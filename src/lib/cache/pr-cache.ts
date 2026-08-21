import { getRedisClient } from "@/lib/redis";
import type { PRData } from "@/types/pr-data";

export async function getCachedPRData(
  owner: string,
  repo: string,
  pullNumber: number,
  headSha?: string
): Promise<PRData | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = `pr_cache:${owner.toLowerCase()}:${repo.toLowerCase()}:${pullNumber}${headSha ? `:${headSha}` : ""}`;
    const cached = await redis.get<PRData>(key);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn("Redis PR cache get error:", error);
  }

  return null;
}

export async function setCachedPRData(
  owner: string,
  repo: string,
  pullNumber: number,
  data: PRData,
  headSha?: string,
  ttlSeconds = 3600 * 24 // 24 hours default TTL
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `pr_cache:${owner.toLowerCase()}:${repo.toLowerCase()}:${pullNumber}${headSha ? `:${headSha}` : ""}`;
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.warn("Redis PR cache set error:", error);
  }
}
