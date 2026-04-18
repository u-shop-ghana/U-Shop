import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { Decimal } from '@prisma/client/runtime/library';

const router: Router = Router();

// All order routes require authentication
router.use(authenticate);

// POST /api/v1/orders
// Checkout initiation: validates cart, reserves stock atomically,
// creates Order + OrderItems, empties cart, and initializes Paystack.
//
// V1 constraint: only single-store checkout is supported because
// Escrow is a 1:1 relation on Order, and each order maps to one store.
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    // 1. Get the user's cart and validate it has items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                store: {
                  select: { id: true, sellerType: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Cart is empty' },
      });
      return;
    }

    // Enforce single-store checkout in V1
    const storeIds = new Set(cart.items.map((item) => item.listing.storeId));
    if (storeIds.size > 1) {
      res.status(400).json({
        success: false,
        error: { message: 'Multi-vendor checkout is not supported yet. Purchase from one store at a time.' },
      });
      return;
    }

    const storeId = Array.from(storeIds)[0]!;
    const store = cart.items[0]!.listing.store;

    // Calculate totals — using Decimal for financial precision
    let totalAmount = new Decimal(0);
    for (const item of cart.items) {
      totalAmount = totalAmount.add(new Decimal(item.listing.price.toString()).mul(item.quantity));
    }

    // Platform fee: 5% for student sellers, 8% for resellers
    const feeRate = store.sellerType === 'RESELLER' ? new Decimal('0.08') : new Decimal('0.05');
    const platformFee = totalAmount.mul(feeRate).toDecimalPlaces(2);
    const sellerAmount = totalAmount.sub(platformFee);
    // Store as percentage (e.g. 5.00 or 8.00)
    const feePercentage = feeRate.mul(100);

    // 2. Atomic Order Creation + Stock Reservation
    // We use an interactive Prisma transaction so that if any stock check
    // fails, the entire operation rolls back — no partial orders.
    const order = await prisma.$transaction(async (tx) => {
      // a. Reserve stock atomically per item
      for (const item of cart.items) {
        // updateMany with a WHERE stock >= quantity is the atomic stock
        // reservation pattern; it avoids the read-then-write race condition.
        const updated = await tx.listing.updateMany({
          where: {
            id: item.listingId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Item "${item.listing.title}" is out of stock or insufficient quantity`);
        }
      }

      // b. Create Order with OrderItems
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          storeId: storeId,
          totalAmount,
          platformFee,
          sellerAmount,
          feePercentage,
          items: {
            create: cart.items.map((item) => ({
              listingId: item.listingId,
              quantity: item.quantity,
              unitPrice: item.listing.price,
              totalPrice: new Decimal(item.listing.price.toString()).mul(item.quantity),
            })),
          },
        },
      });

      // c. Clear the cart after successful order creation
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // 3. Initialize Paystack transaction
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret || paystackSecret.startsWith('<')) {
      // Paystack not configured — return simulated success for dev
      res.json({
        success: true,
        data: {
          orderId: order.id,
          authorization_url: '/checkout/success',
          reference: order.id,
          warning: 'Paystack not configured — simulated checkout',
        },
      });
      return;
    }

    const paystackResp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        amount: totalAmount.mul(100).toNumber(), // Paystack expects pesewas (amount × 100)
        reference: order.id,
        callback_url: `${process.env.FRONTEND_URL}/checkout/verify`,
        metadata: {
          orderId: order.id,
          buyerId: userId,
          storeId: storeId,
        },
      }),
    });

    if (!paystackResp.ok) {
      const pErr = (await paystackResp.json()) as { message?: string };
      res.status(500).json({
        success: false,
        error: { message: `Paystack initialization failed: ${pErr.message ?? 'Unknown error'}` },
      });
      return;
    }

    const pData = (await paystackResp.json()) as { data: { authorization_url: string; reference: string } };

    res.json({
      success: true,
      data: {
        orderId: order.id,
        authorization_url: pData.data.authorization_url,
        reference: pData.data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
