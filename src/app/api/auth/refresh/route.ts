import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token");
    const accessToken = request.cookies.get("access_token");

    if (!refreshToken?.value) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.AUTH_URL}/refresh`, {
      method: "POST",
      headers: {
        origin:
          request.headers.get("x-tenant-origin") || process.env.DEFAULT_ORIGIN!,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        refreshToken: refreshToken.value,
        accessToken: accessToken?.value || null,
      }),
    });

    if (!response.ok) {
      // Clear invalid refresh token
      const nextResponse = NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );

      nextResponse.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
        expires: new Date(0),
      });

      nextResponse.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
        expires: new Date(0),
      });

      nextResponse.cookies.set("access_token_client", "", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
        expires: new Date(0),
      });

      return nextResponse;
    }

    const tokens = await response.json();

    const nextResponse = NextResponse.json(tokens, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    // Set new access token
    if (tokens.accessToken) {
      nextResponse.cookies.set("access_token", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Also update client-accessible token for state management
      nextResponse.cookies.set("access_token_client", tokens.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    // Set new refresh token if provided
    if (tokens.refreshToken) {
      nextResponse.cookies.set("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
