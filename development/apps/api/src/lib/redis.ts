// c:\UShop\development\apps\api\src\lib\redis.ts
import { Redis } from '@upstash/redis';
import { logger } from './logger';

/**
 * Initialize Upstash Redis client.
 * Using Redis.fromEnv() which automatically looks for:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * in process.env.
 */
const initializeRedis = () => {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      logger.warn('Upstash Redis credentials missing. Caching will be disabled.');
      return null;
    }

    return Redis.fromEnv();
  } catch (error) {
    logger.error(error, 'Failed to initialize Upstash Redis client:');
    return null;
  }
};

export const redis = initializeRedis();
