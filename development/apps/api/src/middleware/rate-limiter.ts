import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import { redis } from '../lib/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { LRUCache } from 'lru-cache';

// ─── Rate Limiter Middleware (Redis Backed) ────────────────────────
// Uses Upstash Ratelimit backed by our Redis client for distributed
// rate limiting across multi-instance deployments (Railway).
//
// Comment 4: Sensitive endpoints (auth, checkout) fail CLOSED when Redis is
// unreachable — returning 503 instead of silently disabling rate limiting.
// General and upload limiters fail OPEN for availability, documented below.
// An in-memory LRU fallback provides degraded per-instance protection
// for auth endpoints when Redis is down, removing the binary choice
// between full protection and no protection.

// In-memory fallback rate limiter using LRU cache.
// Only used when Redis is unreachable. Per-instance only (not distributed),
// but better than no rate limiting at all for auth endpoints.
const memoryLimiters = new Map<string, LRUCache<string, number>>();

function getMemoryLimiter(prefix: string, maxRequests: number, windowMs: number): LRUCache<string, number> {
  if (!memoryLimiters.has(prefix)) {
    memoryLimiters.set(prefix, new LRUCache<string, number>({
      max: 10000,     // Track up to 10k unique IPs
      ttl: windowMs,  // Auto-expire entries after the rate limit window
    }));
  }
  return memoryLimiters.get(prefix)!;
}

type FailStrategy = 'open' | 'closed';

function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  keyPrefix: string,
  failStrategy: FailStrategy = 'open'
) {
  // Convert windowMs to seconds with the 's' suffix
  const windowSecs = `${Math.ceil(windowMs / 1000)} s` as `${number} s`;
  
  // If Redis is not configured at all, behavior depends on fail strategy.
  // For 'closed' (auth/checkout), we use the in-memory fallback immediately.
  // For 'open' (general/upload), we pass through — documented trade-off for availability.
  if (!redis) {
    if (failStrategy === 'closed') {
      logger.warn({ prefix: keyPrefix }, 'Redis unavailable at startup — using in-memory fallback for sensitive rate limiter');
      const cache = getMemoryLimiter(keyPrefix, maxRequests, windowMs);
      return (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
        const current = cache.get(ip) ?? 0;
        if (current >= maxRequests) {
          res.set('Retry-After', '60');
          res.status(429).json({
            success: false,
            error: { message: 'Too many requests. Try again later.' },
          });
          return;
        }
        cache.set(ip, current + 1);
        next();
      };
    }
    // fail-open: general/upload — just pass through
    return (_req: Request, _res: Response, next: NextFunction) => next();
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
      // Redis error at runtime — strategy determines behavior
      logger.error({ error, prefix: keyPrefix, strategy: failStrategy }, 'Rate Limiter Redis Error');

      if (failStrategy === 'closed') {
        // For auth/checkout: return 503 with Retry-After to prevent unprotected access
        res.set('Retry-After', '60');
        res.status(503).json({
          success: false,
          error: { message: 'Service temporarily unavailable. Please try again later.' },
        });
        return;
      }

      // For general/upload: fail open for availability, but log aggressively
      // NOTE: This is a documented trade-off — Redis downtime alerts should
      // be configured in your monitoring stack (e.g., Sentry, Railway metrics).
      next();
    }
  };
}

export const rateLimiter = {
  // Sensitive: fail CLOSED — rejecting requests is safer than allowing unprotected auth
  auth: createRateLimiter(10, 15 * 60 * 1000, 'rl:auth', 'closed'),
  checkout: createRateLimiter(5, 15 * 60 * 1000, 'rl:checkout', 'closed'),
  // Non-sensitive: fail OPEN — availability is prioritized over rate limiting
  // Monitor Redis uptime and alert on prolonged outages.
  general: createRateLimiter(200, 15 * 60 * 1000, 'rl:general', 'open'),
  upload: createRateLimiter(30, 60 * 60 * 1000, 'rl:upload', 'open'),
};
