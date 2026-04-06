import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const router: Router = Router();

// ─── GET /api/v1/universities ───────────────────────────────────
// Returns all active universities. Public endpoint — no auth required.
// Used by: student verification page (university dropdown),
//          university browsing page, homepage university section.
//
// Why not hardcode? The university list lives in the DB so admins can
// add/deactivate universities without a code deploy. The seed script
// created the initial 5 (GCTU, UG, UCC, KNUST, UMAT).
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch only active universities, ordered alphabetically.
      // We select only fields needed by the frontend to minimize payload.
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

      res.json({
        success: true,
        data: universities,
        meta: { total: universities.length },
      });
    } catch (err) {
      // Pass to centralized error handler — never swallow errors
      logger.error({ err }, 'Failed to fetch universities');
      next(err);
    }
  }
);

export default router;
