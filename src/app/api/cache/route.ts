import { invalidateCache, invalidateCachePattern } from "@/lib/cache";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.CACHE_API_KEY;

    if (!expectedApiKey) {
      return NextResponse.json(
        { error: "Cache API not configured" },
        { status: 503 }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");
    const pattern = searchParams.get("pattern");

    if (!key && !pattern) {
      return NextResponse.json(
        { error: "Missing 'key' or 'pattern' query parameter" },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (pattern) {
      deletedCount = await invalidateCachePattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Invalidated ${deletedCount} keys matching pattern: ${pattern}`,
        deletedCount,
      });
    }

    if (key) {
      const deleted = await invalidateCache(key);
      deletedCount = deleted ? 1 : 0;
      return NextResponse.json({
        success: deleted,
        message: deleted
          ? `Cache key '${key}' invalidated successfully`
          : `Cache key '${key}' not found or already expired`,
        deletedCount,
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cache invalidation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Cache API - Use DELETE method to invalidate cache",
    usage: {
      invalidateKey: "DELETE /api/cache?key=tenant:myapptino.com",
      invalidatePattern: "DELETE /api/cache?pattern=tenant:*",
      headers: {
        "x-api-key": "your-secret-api-key",
      },
    },
  });
}
