import { getRedisClient, isRedisEnabled } from "./redis-client";

export async function withRedisCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const startTime = Date.now();
  
  if (!isRedisEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Redis Cache DISABLED - Request will bypass cache", {
        key,
      });
    }
    return fn();
  }

  const redis = getRedisClient();

  if (!redis) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Redis Client NOT AVAILABLE - Request will bypass cache", {
        key,
      });
    }
    return fn();
  }

  try {
    // Ensure Redis is connected before making requests
    const { ensureRedisConnection } = await import("./redis-client");
    const isConnected = await ensureRedisConnection();
    
    if (!isConnected) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Redis NOT CONNECTED - Request will bypass cache", {
          key,
        });
      }
      return fn();
    }

    const cacheLookupStart = Date.now();
    const cached = await redis.get(key);
    const cacheLookupTime = Date.now() - cacheLookupStart;

    if (cached) {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Redis Cache HIT", {
          key,
          lookupTime: `${cacheLookupTime}ms`,
          totalTime: `${Date.now() - startTime}ms`,
        });
      }
      return JSON.parse(cached) as T;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("❌ Redis Cache MISS", {
        key,
        lookupTime: `${cacheLookupTime}ms`,
      });
    }
    
    const result = await fn();
    const apiTime = Date.now() - startTime - cacheLookupTime;

    const defaultTtl = parseInt(process.env.REDIS_DEFAULT_TTL || "3600", 10);
    const finalTtl = ttl || defaultTtl;

    const setStart = Date.now();
    await redis.setex(key, finalTtl, JSON.stringify(result));
    const setTime = Date.now() - setStart;

    if (process.env.NODE_ENV === "development") {
      console.log("💾 Redis Cache SET", {
        key,
        apiTime: `${apiTime}ms`,
        setTime: `${setTime}ms`,
        totalTime: `${Date.now() - startTime}ms`,
      });
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Redis Cache ERROR", {
        key,
        error: error instanceof Error ? error.message : String(error),
        totalTime: `${Date.now() - startTime}ms`,
      });
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
