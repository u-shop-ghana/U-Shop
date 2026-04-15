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
    const userWithStore = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        store: true, // Inject active store if they are sellers
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
// Accepts Ghana card info and explicitly sets the user into a PENDING verification state
router.post('/reseller-verify', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ghanaCardName, ghanaCardId, ghanaCardDob, ghanaCardFrontImagePath, ghanaCardBackImagePath } = req.body;
    
    // Check validation of basic input securely
    if (!ghanaCardName || !ghanaCardId || !ghanaCardDob || !ghanaCardFrontImagePath || !ghanaCardBackImagePath) {
      res.status(400).json({ success: false, error: { message: 'Missing required Ghana card parameters' } });
      return;
    }

    // Force date type conversion safely
    const parsedDob = new Date(ghanaCardDob);

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
