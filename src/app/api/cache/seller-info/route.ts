import { getRedisClient, isRedisEnabled } from "@/lib/cache/redis-client";
import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * GET /api/cache/seller-info?productId=123&companyId=456&currencyId=96
 * Returns cached seller info from Redis
 */
export async function GET(request: NextRequest) {
  try {
    if (!isRedisEnabled()) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const companyId = searchParams.get("companyId");
    const currencyId = searchParams.get("currencyId");

    if (!productId || !companyId || !currencyId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: productId, companyId, currencyId",
        },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const cacheKey = `seller-info:${productId}:${companyId}:${currencyId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached) as {
          sellerId: string | number;
          sellerName: string;
        };
        return NextResponse.json({ data }, { status: 200 });
      }
    } catch (error) {
      // If Redis fails, return null (graceful degradation)
      console.error("Redis GET error:", error);
    }

    return NextResponse.json({ data: null }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/cache/seller-info:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve seller info from cache",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache/seller-info
 * Body: {productId, companyId, currencyId, sellerId, sellerName}
 * Caches seller info in Redis with TTL 3600 seconds
 */
export async function POST(request: NextRequest) {
  try {
    if (!isRedisEnabled()) {
      return NextResponse.json(
        { success: false, message: "Redis is not enabled" },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { productId, companyId, currencyId, sellerId, sellerName } = body;

    if (
      !productId ||
      !companyId ||
      !currencyId ||
      sellerId === undefined ||
      !sellerName
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productId, companyId, currencyId, sellerId, sellerName",
        },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { success: false, message: "Redis client not available" },
        { status: 200 }
      );
    }

    const cacheKey = `seller-info:${productId}:${companyId}:${currencyId}`;
    const cacheValue = {
      sellerId,
      sellerName,
    };

    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(cacheValue));
      return NextResponse.json(
        { success: true, message: "Seller info cached successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Redis SET error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to cache seller info",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/cache/seller-info:", error);
    return NextResponse.json(
      {
        error: "Failed to cache seller info",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

