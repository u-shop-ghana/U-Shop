import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// ─── Rate Limiter Middleware ────────────────────────────────────
// A simple in-memory sliding-window rate limiter. This is suitable
// for single-instance deployments. For multi-instance (Railway with
// multiple replicas), swap this for Upstash Redis-backed rate limiting
// using @upstash/ratelimit.
//
// Why not use express-rate-limit? It works fine but doesn't support
// Upstash Redis out of the box. This implementation gives us a clean
// migration path: swap the store from Map to Redis without changing
// the middleware signature.

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms)
}

// In-memory store — replaced with Redis in production
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
globalThis.setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── createRateLimiter ──────────────────────────────────────────
// Factory function that creates a rate limiter with the given
// maxRequests and windowMs. Returns an Express middleware.
function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  keyPrefix: string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use IP address as the rate limit key.
    // req.ip is set by Express and respects X-Forwarded-For when
    // trust proxy is enabled (which Railway/Vercel set automatically).
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    // If no entry or window expired, start a new window
    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      // Set standard rate limit headers so clients know their limits
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', String(maxRequests - 1));
      res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
      next();
      return;
    }

    // Increment the counter
    entry.count += 1;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    // If over the limit, reject with 429
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));

      logger.warn({ ip, key, count: entry.count }, 'Rate limit exceeded');

      res.status(429).json({
        success: false,
        error: {
          message: `Too many requests. Try again in ${retryAfterSec} seconds.`,
        },
      });
      return;
    }

    next();
  };
}

// ─── Pre-configured Rate Limiters ───────────────────────────────
// Different limits for different sensitivity levels.

export const rateLimiter = {
  // Auth endpoints: strict — 10 requests per 15 minutes per IP.
  // Prevents brute-force login attempts.
  auth: createRateLimiter(10, 15 * 60 * 1000, 'rl:auth'),

  // General API: moderate — 200 requests per 15 minutes per IP.
  // Allows normal browsing/search activity.
  general: createRateLimiter(200, 15 * 60 * 1000, 'rl:general'),

  // Upload endpoints: conservative — 30 uploads per hour per IP.
  // Prevents storage abuse.
  upload: createRateLimiter(30, 60 * 60 * 1000, 'rl:upload'),

  // Checkout endpoint: very strict — 5 per 15 minutes per IP.
  // Prevents order spam / payment abuse.
  checkout: createRateLimiter(5, 15 * 60 * 1000, 'rl:checkout'),
};
