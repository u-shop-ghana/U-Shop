import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// ─── Rate Limiter Middleware Tests ──────────────────────────────
// Tests the in-memory sliding-window rate limiter. We import the
// createRateLimiter factory indirectly via the exported `rateLimiter`
// presets, but since the module initializes a global setInterval for
// cleanup, we need to mock timers.

// Mock the logger to silence rate limit warnings during tests
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create a mock Express request/response/next trio
function createMocks(ip: string = '127.0.0.1') {
  const req = {
    ip,
    socket: { remoteAddress: ip },
    headers: {},
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    set: vi.fn(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('allows requests under the limit', async () => {
    // Dynamic import to ensure mocks are applied before module initialisation
    const { rateLimiter } = await import('../rate-limiter');
    const middleware = rateLimiter.auth; // 10 requests per 15 min

    const { req, res, next } = createMocks('10.0.0.1');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('sets rate limit headers on every response', async () => {
    const { rateLimiter } = await import('../rate-limiter');
    const middleware = rateLimiter.auth;

    const { req, res, next } = createMocks('10.0.0.2');
    middleware(req, res, next);

    // Should set the standard X-RateLimit-* headers
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', '10');
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
  });

  it('returns 429 after exceeding the limit', async () => {
    const { rateLimiter } = await import('../rate-limiter');
    const middleware = rateLimiter.auth; // 10 requests per 15 min

    // Fire 11 requests from the same IP — the 11th should be rejected
    for (let i = 0; i < 11; i++) {
      const { req, res, next } = createMocks('10.0.0.3');
      middleware(req, res, next);

      if (i < 10) {
        // First 10 should pass
        expect(next).toHaveBeenCalled();
      } else {
        // 11th should be rate-limited
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              message: expect.stringContaining('Too many requests'),
            }),
          })
        );
      }
    }
  });

  it('resets the counter after the window expires', async () => {
    const { rateLimiter } = await import('../rate-limiter');
    const middleware = rateLimiter.auth; // 10 req / 15 min

    // Exhaust the limit
    for (let i = 0; i < 11; i++) {
      const { req, res, next } = createMocks('10.0.0.4');
      middleware(req, res, next);
    }

    // Advance time past the 15-minute window
    vi.advanceTimersByTime(15 * 60 * 1000 + 1000);

    // Next request should go through (new window)
    const { req, res, next } = createMocks('10.0.0.4');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('tracks different IPs independently', async () => {
    const { rateLimiter } = await import('../rate-limiter');
    const middleware = rateLimiter.auth;

    // Exhaust the limit for IP A
    for (let i = 0; i < 11; i++) {
      const { req, res, next } = createMocks('10.0.0.5');
      middleware(req, res, next);
    }

    // IP B should still be allowed
    const { req, res, next } = createMocks('10.0.0.6');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
