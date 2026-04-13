import { Router, type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { CacheService } from '../services/cache.service';

const router: Router = Router();

// Define exactly what we store in the cache to avoid 'any'
type CachedCategory = Prisma.CategoryGetPayload<Record<string, never>> & { _count: { listings: number } };

// ─── GET /api/v1/categories ──────────────────────────────────────────
// Retrieve a list of product categories mapping marketplace taxonomy natively.
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Check cache first
    const cachedCategories = await CacheService.get<CachedCategory[]>('taxonomy', 'categories');
    if (cachedCategories) {
      res.json({ success: true, data: cachedCategories, cached: true });
      return;
    }

    // 2. Fetch from database if missing
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });

    // 3. Cache for 24 hours (86400 seconds)
    await CacheService.set('taxonomy', 'categories', categories, 86400);

    res.json({ success: true, data: categories, cached: false });
  } catch (error) {
    logger.error({ error }, 'Failed fetching taxonomy records');
    res.status(500).json({ success: false, error: { message: 'Failed to fetch categories' } });
  }
});

export default router;
