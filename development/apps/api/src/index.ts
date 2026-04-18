import app from './app';
import { logger } from './lib/logger';

// ─── Start Server ────────────────────────────────────────────────
// The Express app is configured in app.ts and exported for Supertest.
// This file is the production entry point — it only calls .listen().
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`🚀 U-Shop API running on http://localhost:${PORT}`);
  logger.info(`📋 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
