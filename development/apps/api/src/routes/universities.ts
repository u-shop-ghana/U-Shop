import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { CacheService } from '../services/cache.service';

const router: Router = Router();

// ─── GET /api/v1/universities ───────────────────────────────────
// Returns all active universities. Public endpoint — no auth required.
// Used by: student verification page (university dropdown),
//          university browsing page, homepage university section.
//
// Why not hardcode? The university list lives in the DB so admins can
// add/deactivate universities without a code deploy. The seed script
// created the initial 5 (GCTU, UG, UCC, KNUST, UMAT).
interface UniversityBase {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
}

router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Try to fetch from cache first
      const cachedUniversities = await CacheService.get<UniversityBase[]>('universities', 'all');
      if (cachedUniversities) {
        res.json({
          success: true,
          data: cachedUniversities,
          meta: { total: cachedUniversities.length, cached: true },
        });
        return;
      }

      // 2. Cache MISS: Fetch from DB
      // Fetch only active universities, ordered alphabetically.
      const universities = await prisma.university.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          shortName: true,
          slug: true,
          domain: true,
          logoUrl: true,
        },
        orderBy: { name: 'asc' },
      });

      // 3. Store in cache for 12 hours (43200 seconds)
      await CacheService.set('universities', 'all', universities, 43200);

      res.json({
        success: true,
        data: universities,
        meta: { total: universities.length, cached: false },
      });
    } catch (err) {
      // Pass to centralized error handler — never swallow errors
      logger.error({ err }, 'Failed to fetch universities');
      next(err);
    }
  }
);

export default router;
