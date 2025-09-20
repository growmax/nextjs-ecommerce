import { getAnonymousToken } from "@/lib/appconfig";
import { getDomain } from "@/lib/domain";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const domain = getDomain(request.headers.get("host") || "localhost:3000");
  const response = NextResponse.next();

  // Check if anonymous token cookie exists
  const existingToken = request.cookies.get("anonymous_token");

  // Only call API if cookie is missing
  if (!existingToken) {
    try {
      const tokenResponse = await getAnonymousToken(domain);

      response.cookies.set("anonymous_token", tokenResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    } catch {}
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
