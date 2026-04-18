import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { logger } from '../lib/logger';

const router: Router = Router();

// ─── GET /api/v1/users/me ─────────────────────────────────────
// Returns the currently authenticated user's profile and expanded data mapped
// directly to dashboard configurations. Includes attached store parameters natively.
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    // Comment 5: Use explicit select instead of `include: { store: true }` to
    // exclude sensitive fields like pendingPolicyUpdates from the client payload.
    const userWithStore = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        store: {
          select: {
            id: true,
            handle: true,
            name: true,
            bio: true,
            logoUrl: true,
            bannerUrl: true,
            sellerType: true,
            isActive: true,
            averageRating: true,
            reviewCount: true,
            totalSales: true,
            contactEmail: true,
            contactPhone: true,
            location: true,
            createdAt: true,
            updatedAt: true,
            // pendingPolicyUpdates: intentionally EXCLUDED — admin-only field
          },
        },
      },
    });

    if (!userWithStore) {
      res.status(404).json({ success: false, error: { message: 'User payload mapping failed.' } });
      return;
    }

    res.json({ success: true, data: userWithStore });
  } catch (error) {
    logger.error({ error }, 'Failed to parse /me configuration payload');
    res.status(500).json({ success: false, error: { message: 'Failed fetching user payload' } });
  }
});

// ─── POST /api/v1/users/reseller-verify ───────────────────────────
// Accepts Ghana card info and explicitly sets the user into a PENDING verification state.
// Comment 3: Server-side validation for Ghana Card ID format, DOB sanity,
// and path ownership — mirrors frontend validation but is the authoritative check.
router.post('/reseller-verify', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ghanaCardName, ghanaCardId, ghanaCardDob, ghanaCardFrontImagePath, ghanaCardBackImagePath } = req.body;
    
    // Check validation of basic input presence
    if (!ghanaCardName || !ghanaCardId || !ghanaCardDob || !ghanaCardFrontImagePath || !ghanaCardBackImagePath) {
      res.status(400).json({ success: false, error: { message: 'Missing required Ghana card parameters' } });
      return;
    }

    // Validate Ghana Card ID format: GHA-XXXXXXXXX-X (3 letters, dash, 9 digits, dash, 1 digit)
    const ghanaCardRegex = /^GHA-\d{9}-\d$/;
    if (!ghanaCardRegex.test(ghanaCardId)) {
      res.status(400).json({ success: false, error: { message: 'Invalid Ghana Card ID format. Expected GHA-XXXXXXXXX-X' } });
      return;
    }

    // Validate DOB: must be a valid date, not in the future, not more than 120 years ago
    const parsedDob = new Date(ghanaCardDob);
    if (isNaN(parsedDob.getTime())) {
      res.status(400).json({ success: false, error: { message: 'Invalid date of birth' } });
      return;
    }
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    if (parsedDob > now) {
      res.status(400).json({ success: false, error: { message: 'Date of birth cannot be in the future' } });
      return;
    }
    if (parsedDob < minDate) {
      res.status(400).json({ success: false, error: { message: 'Date of birth is too far in the past' } });
      return;
    }

    // Path ownership: ensure submitted image paths belong to the requesting user.
    // This prevents one user from referencing another user's uploaded documents.
    const userId = req.user!.id;
    if (!ghanaCardFrontImagePath.startsWith(userId + '/')) {
      res.status(403).json({ success: false, error: { message: 'Front image path does not belong to this user' } });
      return;
    }
    if (!ghanaCardBackImagePath.startsWith(userId + '/')) {
      res.status(403).json({ success: false, error: { message: 'Back image path does not belong to this user' } });
      return;
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        verificationType: 'GHANA_CARD',
        verificationStatus: 'PENDING',
        ghanaCardName,
        ghanaCardId,
        ghanaCardDob: parsedDob,
        ghanaCardFrontImagePath,
        ghanaCardBackImagePath,
      },
    });

    res.json({ success: true, data: { message: 'Verification application submitted.' } });
  } catch (error) {
    logger.error({ error }, 'Failed to process reseller verification payload');
    res.status(500).json({ success: false, error: { message: 'Internal server error processing verification' } });
  }
});

export { router as userRoutes };
