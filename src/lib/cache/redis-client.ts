import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (typeof window !== "undefined") {
    return null;
  }

  if (!isRedisEnabled()) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    redisClient.on("error", (error: Error) => {
      if (process.env.NODE_ENV === "development") {
        /* eslint-disable no-console */
        console.error("[Redis] Connection error:", error.message);
        /* eslint-enable no-console */
      }
    });

    redisClient.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        /* eslint-disable no-console */
        console.log("[Redis] Connected successfully");
        /* eslint-enable no-console */
      }
    });

    redisClient.connect().catch((error: Error) => {
      if (process.env.NODE_ENV === "development") {
        /* eslint-disable no-console */
        console.error("[Redis] Failed to connect:", error.message);
        /* eslint-enable no-console */
      }
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      /* eslint-disable no-console */
      console.error(
        "[Redis] Initialization error:",
        error instanceof Error ? error.message : String(error)
      );
      /* eslint-enable no-console */
    }
    return null;
  }
}

export function isRedisEnabled(): boolean {
  return process.env.REDIS_ENABLED === "true";
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

