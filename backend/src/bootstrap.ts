import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import compression = require('compression');
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

let sentryInitialized = false;

export function initializeSentry() {
  if (!process.env.SENTRY_DSN || sentryInitialized) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
  sentryInitialized = true;
  console.log('Sentry initialized for error monitoring');
}

export function configureApp(app: INestApplication) {
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }));

  app.use(compression());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT || (process.env.NODE_ENV === 'production' ? '10' : '50')),
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: 'Too many authentication attempts',
        error: 'Too Many Requests',
        statusCode: 429,
        retryAfter: '15 minutes',
      });
    },
  });

  // Progressive rate limiting - stricter limits for failed attempts
  const progressiveAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: (req) => {
      // Allow more requests for successful logins
      const failedAttemptsHeader = req.headers['x-failed-attempts'];
      const failedAttempts = parseInt(Array.isArray(failedAttemptsHeader) ? failedAttemptsHeader[0] : failedAttemptsHeader || '0');
      if (failedAttempts >= 5) return 2; // Very strict after 5 failures
      if (failedAttempts >= 3) return 5; // Strict after 3 failures
      return 15; // Normal limit
    },
    skipSuccessfulRequests: false, // Count all attempts for progressive limiting
    keyGenerator: (req) => {
      // Use IP + User-Agent for better tracking
      return `${req.ip}-${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
    },
    message: 'Account temporarily locked due to multiple failed attempts',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const failedAttemptsHeader = req.headers['x-failed-attempts'];
      const failedAttempts = parseInt(Array.isArray(failedAttemptsHeader) ? failedAttemptsHeader[0] : failedAttemptsHeader || '0');
      const lockoutTime = failedAttempts >= 5 ? '1 hour' : '15 minutes';
      
      res.status(429).json({
        message: 'Account temporarily locked',
        error: 'Too Many Requests',
        statusCode: 429,
        retryAfter: lockoutTime,
        progressive: true,
      });
    },
  });

  app.use('/auth/login', authLimiter);
  app.use('/auth/login', progressiveAuthLimiter);
  app.use('/auth/register', authLimiter);
  app.use('/auth/forgot-password', authLimiter);

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [process.env.FRONTEND_URL || 'http://localhost:3000'];

  const isAllowedOrigin = (origin: string) => {
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
      return true;
    }

    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) {
      return true;
    }

    return false;
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'baggage',
      'sentry-trace',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: process.env.NODE_ENV === 'production',
    forbidUnknownValues: true,
  }));

  app.getHttpAdapter().getInstance().disable('x-powered-by');
}
