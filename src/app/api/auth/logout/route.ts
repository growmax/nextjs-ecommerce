/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Get tokens from both request body and cookies
    const accessTokenFromCookie = request.cookies.get("access_token");
    const refreshTokenFromCookie = request.cookies.get("refresh_token");

    // Prioritize tokens from request body, fallback to cookies
    const accessToken = body.accessToken || accessTokenFromCookie?.value;
    const refreshToken = body.refreshToken || refreshTokenFromCookie?.value;

    if (!accessToken) {
      console.log("No access token found in request body or cookies");
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 }
      );
    }

    if (!refreshToken) {
      console.log("No refresh token found in request body or cookies");
      // Still proceed with logout to clear any remaining cookies
      // The external API might not require refresh token for logout
    }

    // Call the external logout API
    const logoutPayload: { accessToken: string; refreshToken?: string } = {
      accessToken,
      refreshToken,
    };

    const response = await fetch(`${process.env.AUTH_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Origin:
          request.headers.get("x-tenant-origin") ||
          process.env.DEFAULT_TENANT_ORIGIN!,
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify(logoutPayload),
    });

    const data = await response.json();

    console.log("External logout API response:", {
      status: response.status,
      success: data?.success,
      data,
    });

    // Create response
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    // Always clear cookies regardless of external API response
    console.log("Clearing all authentication cookies");

    // Clear the access_token cookie (HttpOnly)
    nextResponse.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    // Clear refresh token cookie
    nextResponse.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    // Clear client-accessible token
    nextResponse.cookies.set("access_token_client", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    // Clear legacy auth-token if exists
    nextResponse.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    });

    // Generate new anonymous token for the logged-out user
    const anonymousToken = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    nextResponse.cookies.set("anonymous_token", anonymousToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log(
      "All authentication cookies cleared and new anonymous token set"
    );

    return nextResponse;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
