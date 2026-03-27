import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// ─── API Routes ──────────────────────────────────────────────────
// Routes will be added here as we build each feature:
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/stores', storesRouter);
// app.use('/api/v1/listings', listingsRouter);
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
