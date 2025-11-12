import { getRedisClient, isRedisEnabled } from "./redis-client";

export async function withRedisCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  if (!isRedisEnabled()) {
    return fn();
  }

  const redis = getRedisClient();

  if (!redis) {
    return fn();
  }

  try {
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached) as T;
    }
    const result = await fn();

    const defaultTtl = parseInt(process.env.REDIS_DEFAULT_TTL || "3600", 10);
    const finalTtl = ttl || defaultTtl;

    await redis.setex(key, finalTtl, JSON.stringify(result));

    return result;
  } catch {
    return fn();
  }
}

export async function invalidateCache(key: string): Promise<boolean> {
  if (!isRedisEnabled()) {
    return false;
  }

  const redis = getRedisClient();

  if (!redis) {
    return false;
  }

  try {
    const result = await redis.del(key);
    return result > 0;
  } catch {
    return false;
  }
}

export async function invalidateCachePattern(pattern: string): Promise<number> {
  if (!isRedisEnabled()) {
    return 0;
  }

  const redis = getRedisClient();

  if (!redis) {
    return 0;
  }

  try {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    const result = await redis.del(...keys);
    return result;
  } catch {
    return 0;
  }
}
