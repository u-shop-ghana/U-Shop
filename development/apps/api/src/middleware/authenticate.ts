import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

// Type augmentation for req.user is in src/types/express.d.ts
// Verifies the Supabase JWT from the Authorization header, looks up
// the internal User record, and attaches it to req.user.
//
// Why verify via supabaseAdmin.auth.getUser(token) instead of
// decoding the JWT ourselves? Because getUser() makes a round-trip
// to Supabase and checks that the token hasn't been revoked
// (e.g., user signed out on another device). A local JWT decode
// would miss revocations.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // The token arrives as "Bearer eyJhbG..." — reject if missing or malformed
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { message: 'No authorization token provided' },
    });
    return;
  }

  // Extract just the token part (after "Bearer ")
  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Malformed authorization header' },
    });
    return;
  }

  try {
    // Ask Supabase to verify: Is this token cryptographically valid?
    // Was it issued by our project? Has it expired? Was it revoked?
    const { data: { user: supabaseUser }, error } =
      await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      logger.warn({ error }, 'Token verification failed');
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
      return;
    }

    // Look up our internal User record using the Supabase uid.
    // We SELECT only the fields we need — never fetch the entire row
    // (avoids leaking studentIdImagePath, etc. onto the request object).
    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: {
        id: true,
        supabaseId: true,
        email: true,
        role: true,
        verificationStatus: true,
        isSuspended: true,
        store: { select: { id: true } },
      },
    });

    if (!user) {
      // Authenticated with Supabase but no record in our DB.
      // This can happen if signup succeeded in Supabase but the
      // POST /api/v1/auth/register call to create our User record failed.
      // The frontend should retry via the /sync endpoint.
      res.status(401).json({
        success: false,
        error: { message: 'User account not found. Please complete registration.' },
      });
      return;
    }

    // Block suspended users immediately — they cannot use the API at all.
    if (user.isSuspended) {
      res.status(403).json({
        success: false,
        error: { message: 'Your account has been suspended. Contact support.' },
      });
      return;
    }

    // Attach user to request — all downstream handlers can access req.user
    req.user = {
      id: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      isSuspended: user.isSuspended,
      storeId: user.store?.id,
    };

    next();
  } catch (err) {
    // Unexpected error (DB down, Supabase unreachable, etc.)
    // Pass to the centralized error handler — never swallow with console.log.
    next(err);
  }
}

// ─── requireSeller ──────────────────────────────────────────────
// Authorization middleware — must be used AFTER authenticate().
// Ensures the user has a store (is a seller).
export function requireSeller(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'SELLER' && req.user?.role !== 'BOTH' && req.user?.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: { message: 'Seller access required. Create a store first.' },
    });
    return;
  }
  next();
}

// ─── requireAdmin ───────────────────────────────────────────────
// Authorization middleware — must be used AFTER authenticate().
// Restricts access to admin-only routes (verification queue, disputes, etc.).
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: { message: 'Forbidden: Admin access required' },
    });
    return;
  }
  next();
}

// ─── requireVerified ────────────────────────────────────────────
// Authorization middleware — ensures the user is verified before
// they can perform trust-sensitive actions (e.g., creating a store).
export function requireVerified(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.verificationStatus !== 'VERIFIED') {
    res.status(403).json({
      success: false,
      error: { message: 'Verification required. Verify your student status first.' },
    });
    return;
  }
  next();
}
