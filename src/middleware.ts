import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import { extractTenantFromHost } from "./lib/tenant";
import { SessionValidator } from "./lib/services/SessionValidator";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/orders", "/profile", "/settings"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register", "/forgot-password"];

class TenantMiddleware {
  private request: NextRequest;

  constructor(request: NextRequest) {
    this.request = request;
  }

  public handle(): NextResponse {
    const host = this.request.headers.get("host") || "";
    const { domainUrl, origin, tenantCode } = extractTenantFromHost(host);

    const response = NextResponse.next();

    // Always set tenant headers (use default for localhost)
    const finalTenantCode = tenantCode || "schwingstetter";
    const finalDomain = tenantCode ? domainUrl : "schwingstetter.myapptino.com";
    const finalOrigin = tenantCode
      ? origin
      : "schwingstetterindia.myapptino.com";

    response.headers.set("x-tenant-code", finalTenantCode);
    response.headers.set("x-tenant-domain", finalDomain);
    response.headers.set("x-tenant-origin", finalOrigin);

    return response;
  }
}

class AuthMiddleware {
  private request: NextRequest;

  constructor(request: NextRequest) {
    this.request = request;
  }

  private getPathWithoutLocale(): string {
    const pathname = this.request.nextUrl.pathname;
    // Remove locale prefix (e.g., /en, /es, /fr)
    return pathname.replace(/^\/(en|es|fr)/, "");
  }

  private isProtectedRoute(): boolean {
    const pathWithoutLocale = this.getPathWithoutLocale();
    return protectedRoutes.some(route => pathWithoutLocale.startsWith(route));
  }

  private isAuthRoute(): boolean {
    const pathWithoutLocale = this.getPathWithoutLocale();
    return authRoutes.some(route => pathWithoutLocale.startsWith(route));
  }

  private isAuthenticated(): boolean {
    const token = this.request.cookies.get("access_token");
    if (!token?.value) return false;

    const validator = SessionValidator.getInstance();
    const validation = validator.validateToken(token.value);
    return validation.isValid;
  }

  private getLocale(): string {
    const pathname = this.request.nextUrl.pathname;
    const locale = pathname.split("/")[1];
    if (locale && locales.includes(locale as (typeof locales)[number])) {
      return locale;
    }
    return defaultLocale;
  }

  public handle(): NextResponse | null {
    const isAuthenticated = this.isAuthenticated();
    const isProtectedRoute = this.isProtectedRoute();
    const isAuthRoute = this.isAuthRoute();
    const locale = this.getLocale();
    const pathname = this.request.nextUrl.pathname;

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL(`/${locale}/login`, this.request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if accessing auth route while authenticated
    if (isAuthRoute && isAuthenticated) {
      const dashboardUrl = new URL(`/${locale}/dashboard`, this.request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return null;
  }
}

class IntlMiddleware {
  private middleware: ReturnType<typeof createIntlMiddleware>;

  constructor() {
    this.middleware = createIntlMiddleware({
      locales,
      defaultLocale,
      localePrefix: "always",
    });
  }

  public handle(request: NextRequest): NextResponse {
    return this.middleware(request);
  }
}

class MiddlewareHandler {
  private request: NextRequest;
  private tenantMiddleware: TenantMiddleware;
  private authMiddleware: AuthMiddleware;
  private intlMiddleware: IntlMiddleware;

  constructor(request: NextRequest) {
    this.request = request;
    this.tenantMiddleware = new TenantMiddleware(request);
    this.authMiddleware = new AuthMiddleware(request);
    this.intlMiddleware = new IntlMiddleware();
  }

  private shouldSkip(): boolean {
    const pathname = this.request.nextUrl.pathname;

    // Skip middleware for API routes and static files
    return (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/_vercel") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico"
    );
  }

  public handle(): NextResponse {
    // Skip middleware for certain paths
    if (this.shouldSkip()) {
      return NextResponse.next();
    }

    // First apply tenant middleware (sets headers)
    const tenantResponse = this.tenantMiddleware.handle();

    // Then apply authentication middleware
    const authResponse = this.authMiddleware.handle();
    if (authResponse) {
      // Copy tenant headers to auth response
      const tenantCode = tenantResponse.headers.get("x-tenant-code");
      const tenantDomain = tenantResponse.headers.get("x-tenant-domain");
      const tenantOrigin = tenantResponse.headers.get("x-tenant-origin");

      if (tenantCode) authResponse.headers.set("x-tenant-code", tenantCode);
      if (tenantDomain)
        authResponse.headers.set("x-tenant-domain", tenantDomain);
      if (tenantOrigin)
        authResponse.headers.set("x-tenant-origin", tenantOrigin);

      return authResponse;
    }

    // Finally apply internationalization middleware
    const intlResponse = this.intlMiddleware.handle(this.request);

    // Copy tenant headers to intl response
    const tenantCode = tenantResponse.headers.get("x-tenant-code");
    const tenantDomain = tenantResponse.headers.get("x-tenant-domain");
    const tenantOrigin = tenantResponse.headers.get("x-tenant-origin");

    if (tenantCode) intlResponse.headers.set("x-tenant-code", tenantCode);
    if (tenantDomain) intlResponse.headers.set("x-tenant-domain", tenantDomain);
    if (tenantOrigin) intlResponse.headers.set("x-tenant-origin", tenantOrigin);

    return intlResponse;
  }
}

// Main middleware function
export default function middleware(request: NextRequest): NextResponse {
  const handler = new MiddlewareHandler(request);
  return handler.handle();
}

// Configuration for which paths the middleware should run on
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(en|es|fr)/:path*",

    // Enable redirects that add missing locales
    // Exclude API routes, _next, _vercel, and files with extensions
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
