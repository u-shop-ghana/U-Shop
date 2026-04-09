import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // Log error
  if (statusCode >= 500) {
    logger.error({ err, statusCode }, 'Internal server error');
  } else {
    logger.warn({ err, statusCode }, 'Client error');
  }

  // In production, don't leak internal error details
  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack,
        isOperational,
      }),
    },
  });
}
