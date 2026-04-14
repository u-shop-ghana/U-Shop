import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { rateLimiter } from './middleware/rate-limiter';
import authRouter from './routes/auth';
import universitiesRouter from './routes/universities';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

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

    // Allow any Vercel preview/production deployment for this project.
    // Vercel deploys use pattern: https://<project>-<hash>-<team>.vercel.app
    // or the production domain like https://ushop.vercel.app
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Block unknown origins
    callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },
  credentials: true,
}));

// ─── Logging ─────────────────────────────────────────────────────
app.use(morgan('combined'));

// ─── Body Parsing ────────────────────────────────────────────────
// NOTE: Webhook routes MUST be registered BEFORE express.json()
// to preserve the raw body for signature verification.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Routes to be added as we build each feature:
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storesRouter);
app.use('/api/v1/listings', listingsRouter);
app.use('/api/v1/categories', categoriesRouter);
// app.use('/api/v1/orders', ordersRouter);
// app.use('/api/v1/messages', messagesRouter);
// app.use('/api/v1/reviews', reviewsRouter);
// app.use('/api/v1/admin', adminRouter);

// ─── Error Handling ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 U-Shop API running on http://localhost:${PORT}`);
  logger.info(`📋 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
