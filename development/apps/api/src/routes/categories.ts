import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router: Router = Router();

// ─── GET /api/v1/categories ──────────────────────────────────────────
// Retrieve a list of product categories mapping marketplace taxonomy natively.
// Can be cached on the Edge since they change infrequently.
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error({ error }, 'Failed fetching taxonomy records');
    res.status(500).json({ success: false, error: { message: 'Failed to fetch categories' } });
  }
});

export default router;
