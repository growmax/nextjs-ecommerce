import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the proper origin for the API call
    const origin =
      request.headers.get("x-tenant-origin") ||
      process.env.DEFAULT_ORIGIN ||
      `https://${process.env.DEFAULT_ORIGIN}`;
    console.log(origin);

    const response = await fetch(`${process.env.AUTH_URL}/loginNew`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        UserName: body.username,
        Password: body.password,
      }),
    });

    const data = await response.json();

    // Create response
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    // Set secure cookies if login successful
    let accessToken = null;
    let refreshToken = null;

    if (data.accessToken) {
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    } else if (data.tokens && data.tokens.accessToken) {
      accessToken = data.tokens.accessToken;
      refreshToken = data.tokens.refreshToken;
    } else if (data.data && data.data.accessToken) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
    }

    if (response.ok && accessToken) {
      // Remove anonymous token since user is now authenticated
      nextResponse.cookies.set("anonymous_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0, // Expire immediately
        path: "/",
      });

      // Set access token (HttpOnly for server-side API routes)
      nextResponse.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Set a client-readable token for client-side JWT payload access
      nextResponse.cookies.set("access_token_client", accessToken, {
        httpOnly: false, // Client can read this for JWT payload
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      if (refreshToken) {
        nextResponse.cookies.set("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        });
      }
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
