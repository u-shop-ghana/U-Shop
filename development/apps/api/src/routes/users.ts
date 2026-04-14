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

export { router as userRoutes };
