import { locales } from "@/i18n/config";
import API from "@/lib/api";
import { getDomain } from "@/lib/domain";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/landing/orderslanding",
  "/landing/quoteslanding",
];

// Define public routes that should redirect authenticated users
const AUTH_ROUTES = ["/login", "/signup", "/reset-password"];

function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix for route checking
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  return PROTECTED_ROUTES.some(route => pathWithoutLocale.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  // Remove locale prefix for route checking
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  return AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route));
}

function hasAccessToken(request: NextRequest): boolean {
  const accessToken = request.cookies.get("access_token")?.value;
  return !!accessToken;
}

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  const domain = getDomain(request.headers.get("host") || "localhost:3000");
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = hasAccessToken(request);

  // Authentication-based redirects
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Handle internationalization
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  // Add pathname to headers for server-side layout decisions
  response.headers.set("x-pathname", pathname);

  // Add authentication state to headers
  response.headers.set("x-authenticated", isAuthenticated.toString());

  // Add tenant information to headers
  response.headers.set("x-tenant-domain", domain);
  response.headers.set("x-tenant-code", domain); // You might want to extract this differently

  // Use development origin in dev mode, actual origin in production
  const tenantOrigin =
    process.env.NODE_ENV === "development"
      ? process.env.DEFAULT_ORIGIN || request.nextUrl.origin
      : request.nextUrl.origin;
  response.headers.set("x-tenant-origin", tenantOrigin);

  // Check if anonymous token cookie exists
  const existingToken = request.cookies.get("anonymous_token");

  // Only call API if cookie is missing AND user is not authenticated
  if (!existingToken && !isAuthenticated) {
    try {
      const tokenResponse = await API.Auth.getAnonymousToken(domain);

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
