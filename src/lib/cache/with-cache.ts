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
      if (process.env.NODE_ENV === "development") {
        /* eslint-disable no-console */
        console.log(`[Redis Cache] HIT: ${key}`);
        /* eslint-enable no-console */
      }
      return JSON.parse(cached) as T;
    }

    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.log(`[Redis Cache] MISS: ${key}`);
      /* eslint-enable no-console */
    }

    const result = await fn();

    const defaultTtl = parseInt(process.env.REDIS_DEFAULT_TTL || "3600", 10);
    const finalTtl = ttl || defaultTtl;

    await redis.setex(key, finalTtl, JSON.stringify(result));

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.error(
        `[Redis Cache] Error for key "${key}":`,
        error instanceof Error ? error.message : String(error)
      );
      /* eslint-enable no-console */
    }
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
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.log(`[Redis Cache] INVALIDATED: ${key}`);
      /* eslint-enable no-console */
    }
    return result > 0;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.error(
        `[Redis Cache] Invalidation error for key "${key}":`,
        error instanceof Error ? error.message : String(error)
      );
      /* eslint-enable no-console */
    }
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

    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.log(
        `[Redis Cache] INVALIDATED PATTERN: ${pattern} (${result} keys)`
      );
      /* eslint-enable no-console */
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.error(
        `[Redis Cache] Pattern invalidation error for "${pattern}":`,
        error instanceof Error ? error.message : String(error)
      );
      /* eslint-enable no-console */
    }
    return 0;
  }
}
