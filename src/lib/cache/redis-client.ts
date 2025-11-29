// "use server";

import type Redis from "ioredis";

let redisClient: Redis | null = null;
let connectionPromise: Promise<void> | null = null;
let isConnecting = false;
let lastErrorTime = 0;
let errorSuppressed = false;
const ERROR_SUPPRESSION_WINDOW = 30000; // Suppress errors for 30 seconds after first error

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
    if (
      redisClient.status === "connecting" ||
      redisClient.status === "connect"
    ) {
      return redisClient;
    }
    // If disconnected or in error state, reset and reconnect
    if (
      (redisClient.status as string) === "end" ||
      (redisClient.status as string) === "close" ||
      (redisClient.status as string) === "error"
    ) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Redis client disconnected, resetting connection", {
          status: redisClient.status,
        });
      }
      try {
        redisClient.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      redisClient = null;
    }
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
      connectTimeout: 10000, // 10 second connection timeout
      commandTimeout: 5000, // 5 second command timeout
      lazyConnect: true, // Only connect when needed (prevents immediate connection attempts)
      enableReadyCheck: true,
      enableOfflineQueue: true, // Queue commands if disconnected (allows graceful handling)
      keepAlive: 30000, // Keep connection alive
      maxRetriesPerRequest: null, // Disable automatic retries to prevent error spam
      retryStrategy: (times: number) => {
        // Stop retrying after 3 attempts to prevent infinite reconnection loops
        if (times > 3) {
          return null; // Stop retrying
        }
        // Exponential backoff: 200ms, 400ms, 800ms
        return Math.min(times * 200, 1000);
      },
      reconnectOnError: (err: Error) => {
        // Don't auto-reconnect on connection errors to prevent error spam
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return false; // Don't reconnect on READONLY errors
        }
        // Only reconnect on specific recoverable errors
        const recoverableErrors = ["ECONNRESET", "EPIPE"];
        return recoverableErrors.some(e => err.message.includes(e));
      },
    });

    const client = redisClient as any;
    if (client) {
      client.on("error", (err: Error) => {
        const now = Date.now();
        const timeSinceLastError = now - lastErrorTime;

        // Only log errors if:
        // 1. It's been more than ERROR_SUPPRESSION_WINDOW since last error, OR
        // 2. This is the first error
        if (
          timeSinceLastError > ERROR_SUPPRESSION_WINDOW ||
          lastErrorTime === 0
        ) {
          if (process.env.NODE_ENV === "development") {
            const errorCode = (err as any).code || "UNKNOWN";
            console.error(
              `❌ Redis connection error: ${errorCode} - ${err.message}`
            );
            if (
              timeSinceLastError > ERROR_SUPPRESSION_WINDOW &&
              lastErrorTime > 0
            ) {
              console.warn(
                "⚠️  Redis errors were suppressed for the last 30 seconds. If Redis is not needed, set REDIS_ENABLED=false in .env.local"
              );
            }
          }
          lastErrorTime = now;
          errorSuppressed = false;
        } else if (!errorSuppressed) {
          // Log suppression message once
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "⚠️  Redis connection errors will be suppressed for 30 seconds. If Redis is not needed, set REDIS_ENABLED=false in .env.local"
            );
            errorSuppressed = true;
          }
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
        lastErrorTime = 0; // Reset error tracking on successful connection
        errorSuppressed = false;
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Redis connected successfully");
        }
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

    // Connect if not already connecting/connected
    if (
      (client.status as string) === "end" ||
      (client.status as string) === "close" ||
      (client.status as string) === "wait"
    ) {
      try {
        await client.connect();
      } catch {
        // Connection failed, will be handled by error handler
        isConnecting = false;
        return false;
      }
    }
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
  } catch {
    isConnecting = false;
    connectionPromise = null;
    // Don't log here - error handler will log it
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
