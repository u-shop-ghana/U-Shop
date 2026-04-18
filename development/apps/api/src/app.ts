import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Buffer } from 'node:buffer';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { rateLimiter } from './middleware/rate-limiter';
import { autoSanitizeBody } from './middleware/sanitize';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import authRouter from './routes/auth';
import universitiesRouter from './routes/universities';

// Load environment variables
dotenv.config();

const app: express.Application = express();

// Comment 6: Missing trust proxy setting.
// 1 trusts exactly one proxy hop (Railway's load balancer).
app.set('trust proxy', 1);

// ─── Security Middleware ─────────────────────────────────────────
// Explicit CSP directives per security.md §1.
// script-src 'self' blocks inline scripts even if XSS injection occurs.
// img-src allows Supabase Storage for user-uploaded images.
// connect-src allows frontend, Supabase, and Paystack APIs.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*.supabase.co"],
      connectSrc: ["'self'", "*.supabase.co", "api.paystack.co"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
// CORS: Allow the primary frontend URL, Vercel preview deployments,
// and localhost for development. We use the callback pattern because
// Vercel generates a unique subdomain for each deployment/branch,
// so a single static origin string is insufficient.
const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || 'https://u-shop-3eizbxn9j-qwecikuranchies-projects.vercel.app',
  'https://u-shop-3eizbxn9j-qwecikuranchies-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, health checks, curl)
    if (!origin) return callback(null, true);

    // Check exact matches first (env-configured origins + localhost)
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel preview/production deployment for this project specifically.
    // Comment 7: Specific regex matching only U-Shop's project name.
    if (/^https:\/\/u-shop(-[a-zA-Z0-9]+)*\.vercel\.app$/.test(origin)) return callback(null, true);

    // Block unknown origins
    callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },
  credentials: true,
}));

// ─── Logging ─────────────────────────────────────────────────────
// Comment 9: Custom Morgan format that strips query strings from URLs to avoid
// leaking sensitive search terms in logs. Also skips /health to reduce noise.
morgan.token('url-path', (req) => (req as express.Request).path);
app.use(morgan(':method :url-path :status :res[content-length] - :response-time ms', {
  skip: (req) => (req as express.Request).path === '/health',
}));

// ─── Paystack Webhook (raw body) ─────────────────────────────────
// Comment 2: This route MUST be registered BEFORE express.json() so we get
// the raw buffer for HMAC-SHA512 signature verification. express.json() would
// consume the stream and make the raw bytes unavailable.
app.post('/api/v1/webhooks/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    // Reject immediately if the webhook secret is not configured
    if (!webhookSecret || webhookSecret === '<YOUR_PAYSTACK_WEBHOOK_SECRET>') {
      logger.error('PAYSTACK_WEBHOOK_SECRET is not configured — rejecting webhook');
      res.status(500).json({ success: false, error: { message: 'Webhook secret not configured' } });
      return;
    }

    if (!signature) {
      res.status(401).json({ success: false, error: { message: 'Missing signature header' } });
      return;
    }

    // Compute HMAC-SHA512 hash of the raw body using the webhook secret
    const rawBody = req.body as Buffer;
    const hash = crypto.createHmac('sha512', webhookSecret).update(rawBody).digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'hex');
    const sigBuffer = Buffer.from(signature, 'hex');

    if (hashBuffer.length !== sigBuffer.length || !crypto.timingSafeEqual(hashBuffer, sigBuffer)) {
      logger.warn('Paystack webhook signature verification failed');
      res.status(401).json({ success: false, error: { message: 'Invalid signature' } });
      return;
    }

    // Parse the verified payload
    const event = JSON.parse(rawBody.toString('utf-8'));

    // Idempotency check: skip already-processed webhook events.
    // The WebhookEvent table uses externalId as a unique key.
    const existing = await prisma.webhookEvent.findUnique({
      where: { externalId: event.data?.id?.toString() ?? event.event },
    });

    if (existing) {
      logger.info({ eventId: existing.externalId }, 'Duplicate webhook event — skipping');
      res.status(200).json({ success: true });
      return;
    }

    // Record the event for idempotency before processing
    await prisma.webhookEvent.create({
      data: {
        externalId: event.data?.id?.toString() ?? event.event,
        eventType: event.event,
        payload: event,
        processed: false,
      },
    });

    // Dispatch to specific handlers based on event.event type
    if (event.event === 'charge.success') {
      const orderId = event.data?.metadata?.orderId;
      if (orderId) {
        logger.info({ orderId }, 'Processing charge.success for order');
        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (!order) throw new Error('Order not found');

          // Update order status
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: 'PAYMENT_RECEIVED',
              paystackRef: event.data.reference,
              paidAt: new Date(),
            },
          });

          // Create Escrow
          const releaseDates = new Date();
          releaseDates.setDate(releaseDates.getDate() + 7); // 7 day hold

          await tx.escrow.create({
            data: {
              orderId,
              amount: order.sellerAmount,
              status: 'HOLDING',
              releaseAt: releaseDates,
            },
          });
        });
      }
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { externalId: event.data?.id?.toString() ?? event.event },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    logger.info({ eventType: event.event }, 'Paystack webhook successfully processed');

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Paystack webhook processing error');
    res.status(500).json({ success: false, error: { message: 'Webhook processing failed' } });
  }
});

// ─── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Comment 4: Sanitization centralized middleware applied automatically
app.use(autoSanitizeBody);

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Rate Limiting ───────────────────────────────────────────────
// General rate limit on all /api routes: 200 req / 15 min per IP.
// More specific limits are applied per-route group below.
app.use('/api', rateLimiter.general);

// ─── API Routes ──────────────────────────────────────────────────
// Auth gets stricter rate limiting (10 req / 15 min) to prevent brute-force.
app.use('/api/v1/auth', rateLimiter.auth, authRouter);

// Universities is a public read-only endpoint — uses general rate limit.
app.use('/api/v1/universities', universitiesRouter);

import storesRouter from './routes/stores';
import { userRoutes } from './routes/users';
import listingsRouter from './routes/listings';
import categoriesRouter from './routes/categories';
import newsletterRouter from './routes/newsletter';
import reviewsRouter from './routes/reviews';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import escrowRouter from './routes/escrow';

// Routes to be added as we build each feature:
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storesRouter);
app.use('/api/v1/listings', listingsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/escrow', escrowRouter);
// app.use('/api/v1/messages', messagesRouter);

// ─── Error Handling ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Export app for testing (Supertest) ──────────────────────────
// The server is started separately in index.ts so that importing
// the app in tests does NOT call .listen() and cause EADDRINUSE.
export default app;
