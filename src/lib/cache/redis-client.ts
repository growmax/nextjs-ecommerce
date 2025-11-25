// "use server";

import type Redis from "ioredis";

let redisClient: Redis | null = null;
let connectionPromise: Promise<void> | null = null;
let isConnecting = false;

export function getRedisClient(): Redis | null {
  if (typeof window !== "undefined") {
    return null;
  }

  if (!isRedisEnabled()) {
    return null;
  }

  if (redisClient) {
    // Check if client is connected
    if (redisClient.status === "ready") {
      return redisClient;
    }
    // If connecting, return client (it will handle the connection)
    if (redisClient.status === "connecting" || redisClient.status === "connect") {
      return redisClient;
    }
    // If disconnected, reset and reconnect
    redisClient = null;
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
      connectTimeout: 5000, // 5 second connection timeout
      commandTimeout: 1000, // 1 second command timeout
      lazyConnect: false, // Connect immediately
      enableReadyCheck: true,
      enableOfflineQueue: false, // Don't queue commands if disconnected
    });

    const client = redisClient as any;
    if (client) {
      client.on("error", (err: Error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Redis connection error:", err.message);
        }
        // Reset client on error so it can reconnect
        redisClient = null;
        connectionPromise = null;
        isConnecting = false;
      });

      client.on("connect", () => {
        isConnecting = false;
      });

      client.on("ready", () => {
        isConnecting = false;
      });

      client.on("close", () => {
        redisClient = null;
        connectionPromise = null;
        isConnecting = false;
      });
    }

    return client;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Redis client creation error:", error);
    }
    redisClient = null;
    return null;
  }
}

/**
 * Ensure Redis is connected before use
 * Returns true if connected, false if connection failed
 */
export async function ensureRedisConnection(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  // If already connected, return immediately
  if ((client.status as string) === "ready") {
    return true;
  }

  // If connecting, wait for existing connection promise
  if (isConnecting && connectionPromise) {
    try {
      await connectionPromise;
      return client.status === "ready";
    } catch {
      return false;
    }
  }

  // Start new connection
  if (client.status === "end" || client.status === "close") {
    // Client is closed, need to reconnect
    redisClient = null;
    const newClient = getRedisClient();
    if (!newClient) {
      return false;
    }
    return ensureRedisConnection();
  }

  // Wait for connection to be ready (with timeout)
  try {
    isConnecting = true;
    connectionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Redis connection timeout"));
      }, 5000); // 5 second timeout

      if (client.status === "ready") {
        clearTimeout(timeout);
        resolve();
        return;
      }

      const onReady = () => {
        clearTimeout(timeout);
        client.removeListener("error", onError);
        resolve();
      };

      const onError = (err: Error) => {
        clearTimeout(timeout);
        client.removeListener("ready", onReady);
        reject(err);
      };

      client.once("ready", onReady);
      client.once("error", onError);
    });

    await connectionPromise;
    isConnecting = false;
    return true;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Redis connection failed:", error);
    }
    return false;
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
