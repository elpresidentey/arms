import * as path from 'path';
import type { INestApplication } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ensure Node can resolve the backend's dependency tree from the serverless
// bundle, where files land at <fn>/backend/node_modules but the entry point
// lives at <fn>/api/index.js.
module.paths.unshift(path.resolve(__dirname, '..', 'backend', 'node_modules'));
module.paths.unshift(path.resolve(__dirname, '..', '..', 'node_modules'));

const isDev = process.env.NODE_ENV !== 'production';

function describeError(error: unknown): Record<string, unknown> {
  const e = error as Error & { code?: string };
  return {
    name: e?.name ?? 'UnknownError',
    message: e?.message ?? String(error),
    code: e?.code,
    stack: e?.stack,
  };
}

let app: INestApplication | null = null;

const initializeApp = async (): Promise<INestApplication> => {
  if (app) return app;

  console.log('Initializing NestJS app for serverless...');
  console.log('cwd:', process.cwd());
  console.log('module.paths:', module.paths.join(', '));

  const { initializeSentry, configureApp } = await import('../backend/src/bootstrap');
  const { AppModule } = await import('../backend/src/app.module');
  const { NestFactory } = await import('@nestjs/core');

  initializeSentry();

  app = await NestFactory.create(AppModule, {
    logger: isDev ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn'],
  });

  configureApp(app);
  await app.init();

  console.log('NestJS app initialized successfully');
  return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const nestApp = await initializeApp();

    // Get the underlying Express instance
    const expressInstance = nestApp.getHttpAdapter().getInstance();

    // Modify request URL to remove /api prefix for internal routing
    const originalUrl = req.url;
    req.url = req.url?.replace(/^\/api/, '') || '/';

    // Set up proper headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log(`${req.method} ${originalUrl} -> ${req.url}`);

    // Use Express handler
    return expressInstance(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(isDev ? { error: describeError(error) } : {}),
    });
  }
}