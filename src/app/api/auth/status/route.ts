import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const tenant = request.headers.get("x-tenant");

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 50)}...` : null,
    tenant,
    cookies: Object.fromEntries(
      Array.from(request.cookies.getAll()).map(cookie => [
        cookie.name,
        cookie.value ? `***${cookie.value.slice(-10)}` : null,
      ])
    ),
  });
}
