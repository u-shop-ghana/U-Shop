import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// ─── Integration Tests: Stores API ──────────────────────────────
// Tests the store-related Express routes via Supertest.
//
// Strategy: We mock the Prisma client and Supabase to avoid needing
// a live database, while still exercising the full Express middleware
// pipeline (CORS, helmet, rate limiting, validation, controller logic).

// Mock external dependencies before importing app
vi.mock('../../lib/supabase', () => ({
  supabaseAdmin: {
    auth: { getUser: vi.fn() },
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../services/cache.service', () => ({
  CacheService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: {
    store: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Helper: mock the authenticate middleware to inject a test user
vi.mock('../../middleware/authenticate', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../middleware/authenticate')>();
  return {
    ...original,
    authenticate: vi.fn((_req, _res, next) => {
      _req.user = {
        id: 'test-user-id',
        supabaseId: 'test-supabase-id',
        email: 'kwame@ug.edu.gh',
        role: 'BOTH',
        verificationStatus: 'VERIFIED',
        isSuspended: false,
        storeId: 'test-store-id',
      };
      next();
    }),
  };
});

let app: Express.Application;

beforeAll(async () => {
  // Dynamic import after mocks are established
  const module = await import('../../app');
  app = module.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/v1/stores', () => {
  it('returns 200 and a list of stores', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.store.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'store-1',
        name: 'Kwame Tech',
        handle: 'kwame-tech',
        isActive: true,
        sellerType: 'STUDENT',
        user: { verificationStatus: 'VERIFIED', universityName: 'UG' },
      },
    ]);

    const res = await request(app).get('/api/v1/stores');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].handle).toBe('kwame-tech');
  });
});

describe('GET /api/v1/stores/:handle', () => {
  it('returns 200 with store data for a valid handle', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'store-1',
      name: 'Kwame Tech',
      handle: 'kwame-tech',
      bio: 'Best tech deals',
      isActive: true,
      sellerType: 'STUDENT',
      pendingPolicyUpdates: null,
      user: { verificationStatus: 'VERIFIED', verifiedAt: new Date(), id: 'user-1' },
    });

    const res = await request(app).get('/api/v1/stores/kwame-tech');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.handle).toBe('kwame-tech');
    // pendingPolicyUpdates should be stripped from the response
    expect(res.body.data).not.toHaveProperty('pendingPolicyUpdates');
  });

  it('returns 404 for an unknown handle', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(app).get('/api/v1/stores/nonexistent-store');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/stores/check-handle/:handle', () => {
  it('returns available: true when handle is not taken', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.store.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const res = await request(app).get('/api/v1/stores/check-handle/fresh-new-store');

    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(true);
  });

  it('returns available: false when handle is already taken', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.store.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const res = await request(app).get('/api/v1/stores/check-handle/kwame-tech');

    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
  });
});

describe('POST /api/v1/stores', () => {
  it('returns 400 when the body fails Zod validation', async () => {
    const res = await request(app)
      .post('/api/v1/stores')
      .send({ name: 'K' }) // name too short, handle missing
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('returns 403 when user is not verified', async () => {
    const { prisma } = await import('../../lib/prisma');
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      verificationStatus: 'UNVERIFIED',
    });

    const res = await request(app)
      .post('/api/v1/stores')
      .send({
        name: 'My Store',
        handle: 'my-store',
      })
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
