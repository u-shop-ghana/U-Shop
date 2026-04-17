import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// ─── Integration Tests: Categories & Universities API ───────────
// Tests the public read-only endpoints that serve taxonomy data.
// These are unauthenticated endpoints — no JWT required.

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
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
    university: {
      findMany: vi.fn(),
    },
    // Stubs to prevent import errors from other route modules
    store: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
    listing: { findUnique: vi.fn() },
    $queryRawUnsafe: vi.fn(),
  },
}));

// Mock authenticate to prevent auth errors on protected routes we don't test here
vi.mock('../../middleware/authenticate', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../middleware/authenticate')>();
  return {
    ...original,
    authenticate: vi.fn((_req, _res, next) => next()),
  };
});

let app: Express.Application;

beforeAll(async () => {
  const module = await import('../../app');
  app = module.default;
});

beforeEach(async () => {
  vi.clearAllMocks();
  // Re-establish the default cache miss behaviour after clearAllMocks
  // wipes the factory-defined mockResolvedValue.
  const { CacheService } = await import('../../services/cache.service');
  (CacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (CacheService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

// ─── Categories ─────────────────────────────────────────────────
describe('GET /api/v1/categories', () => {
  it('returns 200 and an array of categories', async () => {
    const { prisma } = await import('../../lib/prisma');
    const mockCategories = [
      { id: 'cat-1', name: 'Laptops', slug: 'laptops', iconUrl: null, order: 1, _count: { listings: 12 } },
      { id: 'cat-2', name: 'Phones', slug: 'phones', iconUrl: null, order: 2, _count: { listings: 8 } },
    ];
    (prisma.category.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);

    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Laptops');
  });

  it('returns cached data when cache is warm', async () => {
    const { CacheService } = await import('../../services/cache.service');
    const cachedData = [{ id: 'cat-1', name: 'Cached Laptops', slug: 'laptops' }];
    (CacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(cachedData);

    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Cached Laptops');
    expect(res.body.cached).toBe(true);
  });
});

// ─── Universities ───────────────────────────────────────────────
describe('GET /api/v1/universities', () => {
  it('returns 200 and a list of active universities', async () => {
    const { prisma } = await import('../../lib/prisma');
    const mockUnis = [
      { id: 'uni-1', name: 'University of Ghana', shortName: 'UG', slug: 'ug', domain: 'ug.edu.gh', logoUrl: null },
      { id: 'uni-2', name: 'KNUST', shortName: 'KNUST', slug: 'knust', domain: 'knust.edu.gh', logoUrl: null },
    ];
    (prisma.university.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockUnis);

    const res = await request(app).get('/api/v1/universities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('returns cached universities when cache has data', async () => {
    const { CacheService } = await import('../../services/cache.service');
    const cachedUnis = [{ id: 'uni-1', name: 'Cached UG', shortName: 'UG', slug: 'ug' }];
    (CacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(cachedUnis);

    const res = await request(app).get('/api/v1/universities');

    expect(res.status).toBe(200);
    expect(res.body.meta.cached).toBe(true);
  });
});

// ─── Health Check ───────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── 404 Handler ────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for undefined routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
  });
});
