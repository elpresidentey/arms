import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SecurityLogger');
  private readonly suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union.*select|select.*from|insert.*into|delete.*from|drop.*table)/i, // SQL injection
    /(<script|javascript:|onerror=|onload=)/i, // XSS attempts
    /(eval\(|exec\(|system\(|passthru\()/i, // Code injection
    /(\$\{|<%=|<\?php)/i, // Template injection
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';

    // Check for suspicious patterns in URL and body
    const isSuspicious = this.checkForSuspiciousActivity(req);

    if (isSuspicious) {
      this.logger.warn(
        `🚨 SUSPICIOUS REQUEST DETECTED - IP: ${ip} | Method: ${method} | URL: ${originalUrl} | User-Agent: ${userAgent}`
      );
    }

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // Log failed authentication attempts
      if (originalUrl.includes('/auth/') && statusCode === 401) {
        this.logger.warn(
          `🔐 FAILED AUTH ATTEMPT - IP: ${ip} | URL: ${originalUrl} | Status: ${statusCode} | Duration: ${duration}ms`
        );
      }

      // Log suspicious status codes
      if (statusCode >= 400 && isSuspicious) {
        this.logger.error(
          `⚠️ SUSPICIOUS REQUEST FAILED - IP: ${ip} | Method: ${method} | URL: ${originalUrl} | Status: ${statusCode}`
        );
      }

      // Log slow requests (potential DoS)
      if (duration > 5000) {
        this.logger.warn(
          `⏱️ SLOW REQUEST - IP: ${ip} | Method: ${method} | URL: ${originalUrl} | Duration: ${duration}ms`
        );
      }
    });

    next();
  }

  private checkForSuspiciousActivity(req: Request): boolean {
    const { originalUrl, body, query } = req;

    // Check URL
    if (this.containsSuspiciousPattern(originalUrl)) {
      return true;
    }

    // Check query parameters
    const queryString = JSON.stringify(query);
    if (this.containsSuspiciousPattern(queryString)) {
      return true;
    }

    // Check body
    if (body) {
      const bodyString = JSON.stringify(body);
      if (this.containsSuspiciousPattern(bodyString)) {
        return true;
      }
    }

    return false;
  }

  private containsSuspiciousPattern(text: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(text));
  }
}
