import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/api/services/AuthService";

/**
 * GET /api/auth/anonymous
 * Check if anonymous token exists (non-blocking check)
 */
export async function GET(request: NextRequest) {
  try {
    const existingToken = request.cookies.get("anonymous_token")?.value;

    if (existingToken) {
      return NextResponse.json({
        hasToken: true,
        token: existingToken,
        // Don't expose userId if not needed for security
      });
    }

    return NextResponse.json({
      hasToken: false,
    });
  } catch {
    return NextResponse.json(
      { hasToken: false, error: "Failed to check token" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/anonymous
 * Initialize anonymous session (non-blocking, client-side call)
 */
export async function POST(_request: NextRequest) {
  try {
    const origin =
      _request.headers.get("x-tenant-origin") ||
      process.env.DEFAULT_ORIGIN ||
      _request.nextUrl.origin;

    // Check if token already exists
    const existingToken = _request.cookies.get("anonymous_token")?.value;
    if (existingToken) {
      return NextResponse.json({
        token: existingToken,
        userId: null, // Anonymous tokens don't have userId
      });
    }

    // Fetch new anonymous token
    const tokenResponse = await AuthService.getInstance().getAnonymousToken(origin);

    const response = NextResponse.json({
      token: tokenResponse.accessToken,
      userId: (tokenResponse as any).userId || null,
    });

    // Set cookie with secure settings
    response.cookies.set("anonymous_token", tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Set origin cookie for tenant detection
    response.cookies.set("tenant_origin", origin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    console.error("Anonymous token creation failed");
    return NextResponse.json(
      { error: "Failed to create anonymous token" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/anonymous
 * Clear anonymous session
 */
export async function DELETE(_request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear the anonymous token cookie
  response.cookies.set("anonymous_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}

