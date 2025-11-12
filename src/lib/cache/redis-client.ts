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

    redisClient.on("error", () => {});

    redisClient.on("connect", () => {});

    redisClient.connect().catch(() => {
      redisClient = null;
    });

    return redisClient;
  } catch {
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
