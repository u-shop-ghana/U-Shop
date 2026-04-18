// c:\UShop\development\apps\api\src\services\cache.service.ts
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

export class CacheService {
  /**
   * Generates a cache key with the proper prefix.
   */
  private static generateKey(namespace: string, id: string): string {
    return `ushop:${namespace}:${id}`;
  }

  /**
   * Retrieves an item from the cache. Handles JSON parsing automatically.
   */
  static async get<T>(namespace: string, id: string): Promise<T | null> {
    if (!redis) return null;

    const key = this.generateKey(namespace, id);
    try {
      const data = await redis.get<T>(key);
      if (data) {
        logger.debug({ key }, 'Cache HIT');
      } else {
        logger.debug({ key }, 'Cache MISS');
      }
      return data;
    } catch (error) {
      logger.error(error, `Error reading from cache [${key}]:`);
      return null;
    }
  }

  /**
   * Stores an item in the cache with an optional TTL in seconds.
   */
  static async set(namespace: string, id: string, data: unknown, ttlSeconds = 300): Promise<void> {
    if (!redis) return;

    const key = this.generateKey(namespace, id);
    try {
      await redis.set(key, data, { ex: ttlSeconds });
      logger.debug({ key, ttlSeconds }, 'Cache SET');
    } catch (error) {
      logger.error(error, `Error writing to cache [${key}]:`);
    }
  }

  /**
   * Removes an item from the cache.
   */
  static async invalidate(namespace: string, id: string): Promise<void> {
    if (!redis) return;

    const key = this.generateKey(namespace, id);
    try {
      await redis.del(key);
      logger.debug({ key }, 'Cache INVALIDATE');
    } catch (error) {
      logger.error(error, `Error invalidating cache [${key}]:`);
    }
  }

  /**
   * Scans and removes all cache keys mapped to a specific namespace systematically.
   */
  static async invalidateNamespace(namespace: string): Promise<void> {
    if (!redis) return;

    try {
      const keys = await redis.keys(`ushop:${namespace}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ namespace, count: keys.length }, 'Cache Namespace INVALIDATED');
      }
    } catch (error) {
      logger.error(error, `Error invalidating cache namespace [${namespace}]:`);
    }
  }
}
