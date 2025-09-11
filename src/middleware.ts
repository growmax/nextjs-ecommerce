import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use a locale prefix in the URL
  localePrefix: "always",
});

export const config = {
  // Match only internationalized pathnames
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
