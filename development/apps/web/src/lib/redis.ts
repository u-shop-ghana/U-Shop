// c:\UShop\development\apps\web\src\lib\redis.ts
import { Redis } from '@upstash/redis';

/**
 * Initialize Upstash Redis client for Next.js.
 * Automatically uses KV_REST_API_URL and KV_REST_API_TOKEN 
 * which are provided by the Vercel KV integration.
 */
export const redis = Redis.fromEnv({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
