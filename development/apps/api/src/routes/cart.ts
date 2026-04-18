import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';

const router: Router = Router();

// All cart routes require authentication — no guest carts.
router.use(authenticate);

// GET /api/v1/cart
// Returns the user's cart with all items and their listing details.
// If no cart exists yet, one is created automatically (upsert pattern).
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Upsert ensures a cart always exists for the user without requiring
    // a separate "create cart" step during registration.
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                store: {
                  select: {
                    handle: true,
                    name: true,
                    user: { select: { verificationStatus: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// ─── Upsert Item Schema ─────────────────────────────────────────
// Validates the body of POST /cart/items requests.
const upsertItemSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().min(1),
});

// POST /api/v1/cart/items
// Add or update an item in the cart. Uses a Prisma compound unique
// (cartId_listingId) for the upsert — updating quantity if the item
// already exists, creating it otherwise.
router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsed = upsertItemSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid request body', details: parsed.error.flatten().fieldErrors },
      });
      return;
    }

    const body = parsed.data;

    // Verify the listing exists, is active, and has enough stock
    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      select: { stock: true, status: true, title: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      res.status(404).json({
        success: false,
        error: { message: 'Listing not found or not active' },
      });
      return;
    }

    if (body.quantity > listing.stock) {
      res.status(400).json({
        success: false,
        error: { message: `Only ${listing.stock} units of "${listing.title}" available` },
      });
      return;
    }

    // Get or create cart
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Upsert the cart item using the compound unique key (cartId + listingId)
    await prisma.cartItem.upsert({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId: body.listingId,
        },
      },
      update: {
        quantity: body.quantity,
      },
      create: {
        cartId: cart.id,
        listingId: body.listingId,
        quantity: body.quantity,
      },
    });

    // Fetch and return the full updated cart so the frontend can refresh state
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                store: {
                  select: { handle: true, name: true, user: { select: { verificationStatus: true } } },
                },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: updatedCart });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/cart/items/:id
// Remove a single item from the cart. We use deleteMany with both the
// itemId AND the user's cartId to ensure users can't delete items from
// other people's carts.
router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const itemId = req.params.id as string;

    // Verify the cart belongs to the user
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      res.status(404).json({
        success: false,
        error: { message: 'Cart not found' },
      });
      return;
    }

    // Delete the cart item — deleteMany is safe even if the item doesn't exist
    await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
