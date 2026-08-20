/**
 * @file redis.ts
 * @description Singleton factory for Upstash Redis client with graceful fallback if unconfigured.
 */

import { Redis } from "@upstash/redis";


let redisClient: Redis | null = null;


export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && !url.includes("your-database") && !token.includes("your-token")) {
    try {
      redisClient = new Redis({ url, token });
      return redisClient;
    } catch (e) {
      console.warn("Failed to initialize Upstash Redis:", e);
      return null;
    }
  }

  return null;
}
