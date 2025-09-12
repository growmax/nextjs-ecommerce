import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.AUTH_BASE_URL}/loginNew`, {
      method: "POST",
      headers: {
        Origin:
          request.headers.get("x-tenant-origin") ||
          process.env.DEFAULT_TENANT_ORIGIN!,
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

    // Set secure cookie if login successful
    let accessToken = null;
    if (data.accessToken) {
      accessToken = data.accessToken;
    } else if (data.tokens && data.tokens.accessToken) {
      accessToken = data.tokens.accessToken;
    } else if (data.data && data.data.accessToken) {
      accessToken = data.data.accessToken;
    }

    if (response.ok && accessToken) {
      nextResponse.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
