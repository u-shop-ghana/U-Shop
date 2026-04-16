import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// ─── Authenticate Middleware Tests ──────────────────────────────
// Tests the authenticate, requireSeller, requireAdmin, and
// requireVerified middleware functions.
//
// We mock Supabase and Prisma to avoid needing a live database.
// The authenticate() function has external dependencies (Supabase
// auth.getUser + Prisma user.findUnique), so we test it via mocks.
// The role-guard functions (requireSeller, requireAdmin,
// requireVerified) are pure synchronous checks on req.user and
// can be tested without mocks.

// Mock supabase admin client before importing the middleware
vi.mock('../../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock logger to silence output during tests
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to build mock Express objects
function createMocks(authHeader?: string) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined,
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('authenticate middleware', () => {
  let authenticate: typeof import('../authenticate').authenticate;
  let supabaseAdmin: { auth: { getUser: ReturnType<typeof vi.fn> } };
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    vi.resetAllMocks();
    // Dynamic import to pick up the mocks
    const authModule = await import('../authenticate');
    authenticate = authModule.authenticate;
    const supaModule = await import('../../lib/supabase');
    supabaseAdmin = supaModule.supabaseAdmin as unknown as typeof supabaseAdmin;
    const prismaModule = await import('../../lib/prisma');
    prisma = prismaModule.prisma as unknown as typeof prisma;
  });

  it('returns 401 when no Authorization header is present', async () => {
    const { req, res, next } = createMocks();
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'No authorization token provided',
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is not "Bearer ..."', async () => {
    const { req, res, next } = createMocks('Basic abc123');
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase rejects the token', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Token expired' },
    });

    const { req, res, next } = createMocks('Bearer expired-token');
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Invalid or expired token',
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not found in the database', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-uid-123' } },
      error: null,
    });
    prisma.user.findUnique.mockResolvedValue(null);

    const { req, res, next } = createMocks('Bearer valid-token');
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('User account not found'),
        }),
      })
    );
  });

  it('returns 403 when user is suspended', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-uid-123' } },
      error: null,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      supabaseId: 'supabase-uid-123',
      email: 'test@ug.edu.gh',
      role: 'BUYER',
      verificationStatus: 'VERIFIED',
      isSuspended: true,
      store: null,
    });

    const { req, res, next } = createMocks('Bearer valid-token');
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('suspended'),
        }),
      })
    );
  });

  it('attaches user to req and calls next() on success', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'supabase-uid-123' } },
      error: null,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      supabaseId: 'supabase-uid-123',
      email: 'kwame@ug.edu.gh',
      role: 'BOTH',
      verificationStatus: 'VERIFIED',
      isSuspended: false,
      store: { id: 'store-1' },
    });

    const { req, res, next } = createMocks('Bearer valid-token');
    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({
      id: 'user-1',
      supabaseId: 'supabase-uid-123',
      email: 'kwame@ug.edu.gh',
      role: 'BOTH',
      verificationStatus: 'VERIFIED',
      isSuspended: false,
      storeId: 'store-1',
    });
  });

  it('passes unexpected errors to the error handler via next(err)', async () => {
    const dbError = new Error('Database connection lost');
    supabaseAdmin.auth.getUser.mockRejectedValue(dbError);

    const { req, res, next } = createMocks('Bearer valid-token');
    await authenticate(req, res, next);

    // Should NOT return a 401/403 — should forward the error
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(dbError);
  });
});

// ─── Role Guard Middleware Tests ────────────────────────────────
// These are pure synchronous checks on req.user — no mocking needed.
describe('requireSeller', () => {
  let requireSeller: typeof import('../authenticate').requireSeller;

  beforeEach(async () => {
    const mod = await import('../authenticate');
    requireSeller = mod.requireSeller;
  });

  it('calls next() for SELLER role', () => {
    const req = { user: { role: 'SELLER' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireSeller(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next() for BOTH role', () => {
    const req = { user: { role: 'BOTH' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireSeller(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next() for ADMIN role', () => {
    const req = { user: { role: 'ADMIN' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireSeller(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 for BUYER role', () => {
    const req = { user: { role: 'BUYER' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireSeller(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireAdmin', () => {
  let requireAdmin: typeof import('../authenticate').requireAdmin;

  beforeEach(async () => {
    const mod = await import('../authenticate');
    requireAdmin = mod.requireAdmin;
  });

  it('calls next() for ADMIN role', () => {
    const req = { user: { role: 'ADMIN' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 for SELLER role', () => {
    const req = { user: { role: 'SELLER' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 for BOTH role', () => {
    const req = { user: { role: 'BOTH' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireVerified', () => {
  let requireVerified: typeof import('../authenticate').requireVerified;

  beforeEach(async () => {
    const mod = await import('../authenticate');
    requireVerified = mod.requireVerified;
  });

  it('calls next() for VERIFIED status', () => {
    const req = { user: { verificationStatus: 'VERIFIED' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireVerified(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 for UNVERIFIED status', () => {
    const req = { user: { verificationStatus: 'UNVERIFIED' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireVerified(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 for PENDING status', () => {
    const req = { user: { verificationStatus: 'PENDING' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    requireVerified(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
