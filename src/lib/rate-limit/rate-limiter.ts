import { getRedisClient } from "@/lib/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  limit = 30,
  windowSeconds = 600
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);
      const reset = ttl > 0 ? ttl : windowSeconds;
      const remaining = Math.max(0, limit - current);

      return {
        success: current <= limit,
        limit,
        remaining,
        reset,
      };
    } catch (error) {
      console.warn("Redis rate limit check failed, using in-memory fallback:", error);
    }
  }

  if (inMemoryStore.size > 1000) {
    for (const [key, val] of inMemoryStore.entries()) {
      if (val.resetAt <= now) inMemoryStore.delete(key);
    }
  }

  const record = inMemoryStore.get(identifier);

  if (!record || record.resetAt <= now) {
    const resetAt = now + windowSeconds;
    inMemoryStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: windowSeconds,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.max(1, record.resetAt - now);

  return {
    success: record.count <= limit,
    limit,
    remaining,
    reset,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
