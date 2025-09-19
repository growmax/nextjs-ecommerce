/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Server-side logout API called");

    // Get the current access token from cookies
    const currentToken = request.cookies.get("access_token");

    if (!currentToken) {
      console.log("No access_token cookie found on server");
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    // Call the external logout API
    const response = await fetch("https://api.myapptino.com/auth/auth/logout", {
      method: "POST",
      headers: {
        origin:
          request.headers.get("x-tenant-origin") ||
          process.env.DEFAULT_TENANT_ORIGIN!,
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken.value}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        refreshToken: body.refreshToken,
        accessToken: currentToken.value,
      }),
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

    // Clear HttpOnly cookies if logout was successful
    if (response.ok && data && data.success === true) {
      console.log("Logout successful - clearing HttpOnly cookies");

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

      // Clear legacy auth-token if exists
      nextResponse.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
        expires: new Date(0),
      });

      console.log("HttpOnly cookies cleared successfully");
    } else {
      console.log("Logout failed - keeping HttpOnly cookies");
    }

    return nextResponse;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
