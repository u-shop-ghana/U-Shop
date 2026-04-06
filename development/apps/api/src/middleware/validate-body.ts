import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

// ─── validateBody Middleware ────────────────────────────────────
// Generic Zod validation middleware per security.md §4.
//
// How it works:
//   1. Parses req.body through the provided Zod schema
//   2. On success: replaces req.body with the validated + type-coerced
//      data (unknown fields are stripped by Zod's default behavior)
//   3. On failure: returns 400 with the standard error envelope
//
// Usage:
//   router.post('/stores', validateBody(createStoreSchema), handler);
//
// Why replace req.body?
// Zod strips unknown fields and coerces types (e.g., string → number).
// Downstream handlers should only see validated data, not raw user input.
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into the standard API error envelope.
      // Each field gets an array of error messages (matching the API contract).
      const fieldErrors: Record<string, string[]> = {};
      for (const err of result.error.errors) {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      }

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request body failed validation',
          details: fieldErrors,
        },
      });
      return;
    }

    // Replace raw body with validated + sanitised data.
    // Unknown fields are automatically stripped by Zod.
    req.body = result.data;
    next();
  };
}
