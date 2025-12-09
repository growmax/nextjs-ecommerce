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

    const response = await fetch(`${process.env.AUTH_URL}/CheckUserName`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        UserName: body.UserName,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check username" },
      { status: 500 }
    );
  }
}
