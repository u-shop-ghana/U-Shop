import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router: Router = Router();

// POST /api/v1/escrow/process
// Called by Vercel/Supabase cron job to auto-release mature escrows.
// Protected by CRON_SECRET — not by user JWT because there is no
// "user" making this request; it's a scheduled system job.
router.post('/process', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    // Reject if the cron secret is missing or doesn't match
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
      return;
    }

    const now = new Date();

    // Find all escrows that have matured (releaseAt <= now) and are still HOLDING
    const matureEscrows = await prisma.escrow.findMany({
      where: {
        status: 'HOLDING',
        releaseAt: { lte: now },
      },
      include: {
        order: {
          select: {
            id: true,
            storeId: true,
            sellerAmount: true,
          },
        },
      },
      take: 100, // Process in batches to avoid timeout
    });

    if (matureEscrows.length === 0) {
      res.json({ success: true, message: 'No escrows to release', processed: 0, failed: 0 });
      return;
    }

    let processed = 0;
    let failed = 0;

    // Process each escrow individually — one failure should not block others
    for (const escrow of matureEscrows) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Mark escrow as RELEASED
          await tx.escrow.update({
            where: { id: escrow.id },
            data: {
              status: 'RELEASED',
              releasedAt: now,
            },
          });

          // 2. Mark order as COMPLETED
          await tx.order.update({
            where: { id: escrow.orderId },
            data: { status: 'COMPLETED' },
          });

          // 3. Look up the seller's userId via the store
          const store = await tx.store.findUnique({
            where: { id: escrow.order.storeId },
            select: { userId: true },
          });

          if (!store) {
            throw new Error(`Store not found for escrow ${escrow.id}`);
          }

          // 4. Credit the seller's wallet (upsert to create if it doesn't exist)
          const wallet = await tx.wallet.upsert({
            where: { userId: store.userId },
            update: {
              availableBalance: { increment: escrow.amount },
              totalEarned: { increment: escrow.amount },
            },
            create: {
              userId: store.userId,
              availableBalance: escrow.amount,
              totalEarned: escrow.amount,
            },
          });

          // 5. Record the wallet transaction for auditing
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'ESCROW_RELEASE',
              amount: escrow.amount,
              referenceId: escrow.orderId,
              description: `Escrow auto-release for order ${escrow.orderId}`,
            },
          });
        });

        processed++;
      } catch (err) {
        logger.error({ escrowId: escrow.id, error: err }, 'Failed to release escrow');
        failed++;
      }
    }

    res.json({ success: true, processed, failed });
  } catch (error) {
    next(error);
  }
});

export default router;
