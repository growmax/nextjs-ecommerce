import { NextRequest, NextResponse } from "next/server";

// Inline locales to avoid importing from config (reduces bundle size)
const locales = ["en", "es", "fr", "th", "vi", "id", "ms"] as const;

// Inline getDomain to avoid extra imports
function getDomain(host: string): string {
  if (host === "localhost:3000" || host === "localhost:3001") {
    return process.env.DEFAULT_DOMAIN || "sandbox.myapptino.com";
  }
  return host.replace("www.", "");
}

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

// next-intl middleware will be created dynamically inside the middleware function

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early returns for static assets and Next.js internals (fast path)
  // Check these BEFORE any expensive operations
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // If the request targets a public/static asset (possibly with a locale prefix)
  // rewrite locale-prefixed asset requests to the non-prefixed path so Next.js
  // can serve the file from `public/` (e.g. `/en/asset/foo` -> `/asset/foo`).
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  // For asset and images, rewrite to the unprefixed path so static serving works
  if (
    pathWithoutLocale.startsWith("/asset") ||
    pathWithoutLocale.startsWith("/images")
  ) {
    const targetUrl = new URL(pathWithoutLocale, request.url);
    return NextResponse.rewrite(targetUrl);
  }

  // Only compute domain after we know we need it (for non-static routes)
  const domain = getDomain(request.headers.get("host") || "localhost:3000");
  const isAuthenticated = hasAccessToken(request);

  // Bypass middleware for static files
  // Handle manifest.json and static assets (images, fonts, etc.)
  const staticFileExtensions = [
    ".json",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".gif",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];

  const isStaticFile = staticFileExtensions.some(ext => pathname.endsWith(ext));

  if (isStaticFile) {
    // If static file has locale prefix (e.g., /en/growmax-logo.png),
    // rewrite to root path (e.g., /growmax-logo.png)
    const localePattern = /^\/([a-z]{2}(-[A-Z]{2})?)\/(.+)$/;
    const match = pathname.match(localePattern);

    if (match) {
      // Extract the file path after locale
      const filePath = `/${match[2]}`;
      // Rewrite to root path
      const url = new URL(request.url);
      url.pathname = filePath;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Manual locale handling (replaces next-intl middleware for smaller bundle)
  // Extract locale from pathname or detect from headers
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)(\/|$)/);
  const currentLocale = localeMatch ? localeMatch[1] : null;
  
  // If no locale in pathname, redirect to add default locale
  if (!currentLocale) {
    // Get locale from Accept-Language header or use default
    const acceptLanguage = request.headers.get("accept-language");
    const preferredLocale = acceptLanguage?.split(",")[0]?.split("-")[0] || "en";
    const validLocale = locales.includes(preferredLocale as any) ? preferredLocale : "en";
    
    // Redirect to path with locale prefix
    const url = new URL(request.url);
    url.pathname = `/${validLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }
  
  // Validate that the locale is supported
  if (!locales.includes(currentLocale as any)) {
    const url = new URL(request.url);
    url.pathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "/en");
    return NextResponse.redirect(url);
  }
  
  const response = NextResponse.next();
  const finalPathname = pathname;

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

  // Use development origin in dev mode, actual origin in production
  const tenantOrigin =
    process.env.NODE_ENV === "development"
      ? process.env.DEFAULT_ORIGIN || request.nextUrl.origin
      : request.nextUrl.origin;
  response.headers.set("x-tenant-origin", tenantOrigin);

  // Note: x-tenant-code is NOT set here - it will be fetched from API in LayoutDataLoader
  // Server components should fetch tenant data using TenantService.getTenantDataCached()

  // Anonymous token is now handled client-side via /api/auth/anonymous route
  // This prevents blocking middleware requests and improves initial page load performance
  // The token will be fetched asynchronously on the client side when needed

  return response;
}

export const config = {
  // Exclude API routes, Next internals and static/public asset paths from middleware
  // so they are served directly and not rewritten with locale prefixes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|asset|images).*)"],
};
