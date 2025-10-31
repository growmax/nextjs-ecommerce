import { locales } from "@/i18n/config";
import AuthService from "@/lib/api/services/AuthService";
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

  // Handle internationalization FIRST to ensure locale is in the pathname
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  // Get the pathname after intl middleware processing (with locale prefix)
  const finalPathname = response.headers.get("x-middleware-rewrite")
    ? new URL(response.headers.get("x-middleware-rewrite") || request.url)
        .pathname
    : pathname;

  // Authentication-based redirects (check after locale is added)
  if (isProtectedRoute(finalPathname) && !isAuthenticated) {
    // Extract locale from pathname or use default
    const localeMatch = finalPathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Redirect unauthenticated users to login with proper locale
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", finalPathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(finalPathname) && isAuthenticated) {
    // Extract locale from pathname or use default
    const localeMatch = finalPathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
    const locale = localeMatch ? localeMatch[1] : "en";

    // Redirect authenticated users away from auth pages
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

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

  // Only call API if cookie is missing, user is not authenticated, and not on static routes
  const shouldFetchAnonymousToken =
    !existingToken &&
    !isAuthenticated &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.includes(".");

  if (shouldFetchAnonymousToken) {
    try {
      // Add timeout to prevent middleware from blocking too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const tokenResponse = await AuthService.getAnonymousToken(domain);

      clearTimeout(timeoutId);

      response.cookies.set("anonymous_token", tokenResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    } catch {
      // Log error but don't block the request
      // Continue without token
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
