import { getAnonymousToken } from "@/lib/appconfig";
import { getDomain } from "@/lib/domain";
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales } from "@/i18n/config";

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  const domain = getDomain(request.headers.get("host") || "localhost:3000");

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  // Add pathname to headers for server-side layout decisions
  const pathname = request.nextUrl.pathname;
  response.headers.set("x-pathname", pathname);

  // Add tenant information to headers
  response.headers.set("x-tenant-domain", domain);
  response.headers.set("x-tenant-code", domain); // You might want to extract this differently
  response.headers.set("x-tenant-origin", request.nextUrl.origin);

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
