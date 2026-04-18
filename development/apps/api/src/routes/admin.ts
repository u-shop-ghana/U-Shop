import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { z } from 'zod';

const router: Router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireAdmin);

// POST /api/v1/admin/verify/:userId/approve
// Approves a user's verification request. Clears any previous rejection reason.
router.post('/verify/:userId/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/admin/verify/:userId/reject
// Rejects a user's verification request with a mandatory reason.
const rejectSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
});

router.post('/verify/:userId/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    const parsed = rejectSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid request body', details: parsed.error.flatten().fieldErrors },
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: parsed.data.reason,
        verifiedAt: null,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
