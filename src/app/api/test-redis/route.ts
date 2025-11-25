import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/cache/redis-client";

export async function GET() {
  try {
    const redis = getRedisClient();

    if (!redis) {
      return NextResponse.json({
        error: "Redis client not available",
        redisEnabled: process.env.REDIS_ENABLED,
        redisUrl: process.env.REDIS_URL,
      });
    }

    // Test connection
    const pingResult = await redis.ping();

    // Set a test key
    const testKey = `test:${Date.now()}`;
    const setResult = await redis.setex(testKey, 60, "test-value");

    // Get the test key
    const getResult = await redis.get(testKey);

    // Get all keys matching test:*
    const allTestKeys = await redis.keys("test:*");

    // Get info about the connection
    const info = await redis.info("server");
    const serverInfo = info
      .split("\r\n")
      .reduce((acc: Record<string, string>, line: string) => {
        const [key, value] = line.split(":");
        if (key && value) acc[key] = value;
        return acc;
      }, {});

    return NextResponse.json({
      success: true,
      connection: {
        ping: pingResult,
        status: redis.status,
        url: process.env.REDIS_URL,
      },
      test: {
        key: testKey,
        setResult,
        getResult,
        allTestKeys,
      },
      server: {
        redis_version: serverInfo.redis_version,
        redis_mode: serverInfo.redis_mode,
        os: serverInfo.os,
        arch_bits: serverInfo.arch_bits,
      },
      environment: {
        REDIS_URL: process.env.REDIS_URL,
        REDIS_ENABLED: process.env.REDIS_ENABLED,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Redis test failed",
        message: error instanceof Error ? error.message : String(error),
        redisUrl: process.env.REDIS_URL,
      },
      { status: 500 }
    );
  }
}
