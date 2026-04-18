import { vi } from 'vitest';

// ─── Integration Test Setup ─────────────────────────────────────
// This file prepares the environment for Supertest integration tests.
//
// Strategy (Option A): These tests are designed to run against a
// local Supabase CLI instance (`supabase start`). The local instance
// provides an identical Postgres database that mirrors production.
//
// When running without a local Supabase instance, these tests will
// be skipped gracefully with a warning.
//
// Required environment: docker, supabase CLI, `supabase start` running.
// The local instance exposes Postgres on port 54322 (default).

// Set test environment variables before any module loads
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Let the OS assign a random port for tests

// Mock the Supabase admin client globally for integration tests
// so we don't need a real Supabase project connection.
// The authenticate middleware is mocked at the route level instead.
vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
  },
}));

// Mock the cache service to avoid needing Redis/Upstash in tests
vi.mock('../services/cache.service', () => ({
  CacheService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock the logger to keep test output clean
vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));

// Mock DOMPurify to prevent JSDOM ESM top-level await crashes in Vitest
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input),
  },
}));

export {};
