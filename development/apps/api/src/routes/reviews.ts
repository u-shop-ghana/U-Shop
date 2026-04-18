import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// GET /api/v1/reviews?storeId=...&storeHandle=...
// Fetches reviews, filtered by storeId or storeHandle.
// This is a public endpoint — no auth required.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = req.query.storeId as string | undefined;
    const storeHandle = req.query.storeHandle as string | undefined;

    // At least one filter is required to prevent unbounded queries
    if (!storeId && !storeHandle) {
      res.status(400).json({
        success: false,
        error: { message: 'storeId or storeHandle query parameter is required' },
      });
      return;
    }

    // Build the Prisma where clause dynamically based on which filter was provided
    const whereClause: Record<string, unknown> = {};
    if (storeId) whereClause.storeId = storeId;
    if (storeHandle) whereClause.store = { handle: storeHandle };

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            fullName: true,
            avatarUrl: true,
            universityName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Hard limit to prevent massive payloads
    });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
