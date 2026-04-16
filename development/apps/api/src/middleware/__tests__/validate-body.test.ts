import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { validateBody } from '../validate-body';
import { z } from 'zod';

// ─── validateBody Middleware Tests ──────────────────────────────
// Tests the generic Zod validation middleware that parses req.body,
// strips unknown fields, and returns structured 400 errors on failure.

// Helper to create a mock Express request/response/next trio
function createMocks(body: unknown) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

// A simple test schema for the middleware to validate against
const testSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  age: z.number().int().positive('Age must be positive'),
  email: z.string().email('Invalid email').optional(),
});

describe('validateBody', () => {
  let middleware: ReturnType<typeof validateBody>;

  beforeEach(() => {
    middleware = validateBody(testSchema);
  });

  it('calls next() when body is valid', () => {
    const { req, res, next } = createMocks({ name: 'Kwame', age: 22 });
    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('replaces req.body with parsed data (strips unknown fields)', () => {
    const { req, res, next } = createMocks({
      name: 'Ama',
      age: 19,
      hackerField: 'should be stripped',
    });
    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    // Zod strips unknown fields — hackerField should be gone
    expect(req.body).toEqual({ name: 'Ama', age: 19 });
    expect(req.body).not.toHaveProperty('hackerField');
  });

  it('returns 400 with VALIDATION_FAILED when body is invalid', () => {
    const { req, res, next } = createMocks({ name: 'A', age: -5 });
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_FAILED',
          message: 'Request body failed validation',
        }),
      })
    );
  });

  it('returns field-specific error messages in details', () => {
    const { req, res, next } = createMocks({ name: 'A', age: -5 });
    middleware(req, res, next);

    const response = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    // 'name' should have an error about being too short
    expect(response.error.details.name).toBeDefined();
    expect(response.error.details.name).toContain('Name too short');
  });

  it('returns 400 when required fields are missing', () => {
    const { req, res, next } = createMocks({});
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
