import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import { redis } from '../lib/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ─── Rate Limiter Middleware (Redis Backed) ────────────────────────
// Swapped from in-memory Map to Upstash Ratelimit backed by our Redis client.
// This properly supports multi-instance deployments like Railway and preserves
// the X-RateLimit headers natively mapped via `Ratelimit.slidingWindow()`.

function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  keyPrefix: string
) {
  // Convert windowMs to seconds with the 's' suffix
  const windowSecs = `${Math.ceil(windowMs / 1000)} s` as `${number} s`;
  
  if (!redis) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowSecs),
    prefix: keyPrefix,
    analytics: true,
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';

      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      // Set standard headers
      res.set('X-RateLimit-Limit', String(limit));
      res.set('X-RateLimit-Remaining', String(remaining));
      res.set('X-RateLimit-Reset', String(Math.ceil(reset / 1000)));

      if (!success) {
        const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
        res.set('Retry-After', String(retryAfterSec));
        
        logger.warn({ ip, prefix: keyPrefix, count: limit }, 'Rate limit exceeded');

        res.status(429).json({
          success: false,
          error: {
            message: `Too many requests. Try again in ${retryAfterSec} seconds.`,
          },
        });
        return;
      }
      
      next();
    } catch (error) {
      // If redis dies, fallback transparently to avoid hard outages, but log profusely
      logger.error({ error }, 'Rate Limiter Redis Error - Failing open explicitly');
      next();
    }
  };
}

export const rateLimiter = {
  auth: createRateLimiter(10, 15 * 60 * 1000, 'rl:auth'),
  general: createRateLimiter(200, 15 * 60 * 1000, 'rl:general'),
  upload: createRateLimiter(30, 60 * 60 * 1000, 'rl:upload'),
  checkout: createRateLimiter(5, 15 * 60 * 1000, 'rl:checkout'),
};
