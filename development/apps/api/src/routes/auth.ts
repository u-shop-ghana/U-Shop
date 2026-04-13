import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import { authenticate } from '../middleware/authenticate';
import { VerificationService } from '../services/verification.service';
import { registerSchema } from '@ushop/shared';

const router: Router = Router();

// ─── POST /api/v1/auth/register ─────────────────────────────────
// Called by the frontend immediately after Supabase signup succeeds.
// Creates our internal User record in the database.
//
// Why a separate call? Supabase manages auth (email, password, JWT)
// but we need our own User record for: role, verification status,
// store ownership, order history, etc. Supabase doesn't know about
// our domain-specific data.
//
// This endpoint is idempotent — calling it twice with the same
// supabaseId won't create a duplicate (it returns the existing user).
router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the incoming request body with Zod
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid input', details: parsed.error.flatten() },
        });
        return;
      }

      const { email, fullName } = parsed.data;

      // Extract the Supabase user ID from the Authorization header.
      // The frontend sends the JWT it received from Supabase signup.
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: { message: 'Authorization token required' },
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({
          success: false,
          error: { message: 'Malformed authorization header' },
        });
        return;
      }

      // Verify the token to get the Supabase user ID
      const { data: { user: supabaseUser }, error: authError } =
        await supabaseAdmin.auth.getUser(token);

      if (authError || !supabaseUser) {
        res.status(401).json({
          success: false,
          error: { message: 'Invalid token' },
        });
        return;
      }

      // Idempotency: if a User record already exists for this Supabase ID,
      // return it instead of failing.
      const existingUser = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        select: {
          id: true,
          email: true,
          role: true,
          verificationStatus: true,
        },
      });

      if (existingUser) {
        res.status(200).json({ success: true, data: existingUser });
        return;
      }

      // SupabaseId doesn't exist. Check if Email already exists (to prevent P2002 500 crash)
      // This happens if a user signs up via OAuth to an email that existed before, or if their
      // Supabase auth record was reset but the DB row persisted. We link the new Supabase ID.
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingEmailUser) {
        const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;
        const reLinkedUser = await prisma.user.update({
          where: { id: existingEmailUser.id },
          data: { 
            supabaseId: supabaseUser.id, 
            fullName: fullName,
            ...(avatarUrl ? { avatarUrl } : {})
          },
          select: {
            id: true,
            email: true,
            role: true,
            verificationStatus: true,
          }
        });
        
        logger.info({ userId: reLinkedUser.id, email }, 'Existing user re-linked to new Supabase Auth ID');
        res.status(200).json({ success: true, data: reLinkedUser });
        return;
      }

      // Create our internal User record.
      const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;
      const newUser = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email,
          fullName,
          avatarUrl,
          role: 'BUYER',
          verificationStatus: 'UNVERIFIED',
        },
        select: {
          id: true,
          email: true,
          role: true,
          verificationStatus: true,
        },
      });

      logger.info({ userId: newUser.id, email }, 'New user registered');

      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/v1/auth/sync ─────────────────────────────────────
// Idempotent sync endpoint. If the app detects that a Supabase user
// doesn't have a matching DB record (e.g., the /register call failed
// on first signup), the frontend can call this to ensure sync.
//
// This is a safety net — it should rarely be needed in normal flow.
router.post(
  '/sync',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    // If authenticate() succeeded, the user already exists in our DB.
    // Just return their profile.
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }
);

// ─── GET /api/v1/auth/me ────────────────────────────────────────
// Returns the current user's full profile. Used by the frontend
// after login to populate the auth context.
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch the full profile — more fields than what's on req.user
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          verificationStatus: true,
          universityName: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              handle: true,
              name: true,
              logoUrl: true,
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/v1/auth/verify/upload ────────────────────────────
// Submit a student ID image for manual admin review.
// The frontend uploads the image to Supabase Storage first,
// then sends the storage path here.
router.post(
  '/verify/upload',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { imagePath, universityName } = req.body as {
        imagePath: string;
        universityName?: string;
      };

      // Validate required field
      if (!imagePath || typeof imagePath !== 'string') {
        res.status(400).json({
          success: false,
          error: { message: 'imagePath is required (Supabase Storage path)' },
        });
        return;
      }

      await VerificationService.submitIdForReview(
        req.user!.id,
        imagePath,
        universityName
      );

      res.json({
        success: true,
        data: { message: 'ID submitted for review. You will be notified within 24 hours.' },
      });
    } catch (err) {
      // VerificationService throws descriptive errors (already verified, etc.)
      if (err instanceof Error) {
        res.status(400).json({
          success: false,
          error: { message: err.message },
        });
        return;
      }
      next(err);
    }
  }
);

export default router;
