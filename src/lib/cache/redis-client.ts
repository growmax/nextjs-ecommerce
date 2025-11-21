// "use server";

import type Redis from "ioredis";

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

    // Import ioredis at runtime on the server only to avoid bundlers
    // pulling Node-only modules into client builds.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const IORedis = require("ioredis");
    const RedisCtor = (IORedis && IORedis.default) || IORedis;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - runtime constructor from require
    redisClient = new RedisCtor(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    const client = redisClient as any;
    if (client) {
      client.on("error", () => {});
      client.on("connect", () => {});

      // Connect in background; if it fails, null out the client
      // Note: connect() returns a Promise
      void client.connect().catch(() => {
        // If connection fails, drop the client so subsequent calls can retry
        redisClient = null;
      });
    }

    return client;
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
