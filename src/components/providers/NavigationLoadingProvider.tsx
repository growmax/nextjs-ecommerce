"use client";

import { usePathname } from "@/i18n/navigation";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { useEffect, useRef } from "react";

/**
 * NavigationLoadingProvider
 *
 * Ensures loading states are shown immediately on navigation
 * by detecting pathname changes and triggering loading state early.
 */
export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const { startNavigation } = useNavigationProgress();

  useEffect(() => {
    // On initial mount, just store the pathname
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    // If pathname changed, navigation is happening
    if (prevPathnameRef.current !== pathname) {
      // Check if target pathname is a product listing page
      const isProductListingPage = (path: string): boolean => {
        // Remove locale prefix for comparison
        const pathWithoutLocale = path.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";
        
        // Brand pages: /brands/[slug] or /brands/[slug]/[...categories]
        if (pathWithoutLocale.startsWith("/brands/")) return true;
        
        // Category page: /category (legacy route)
        if (pathWithoutLocale.startsWith("/category")) return true;
        
        // Define all known non-product-listing routes
        const knownRoutes = [
          "/", "/dashboard", "/search", "/products", "/quotesummary",
          "/checkout", "/notification", "/settings", "/landing",
          "/ordersummary", "/details", "/categories", "/cart"
        ];
        
        // Exact match for root
        if (pathWithoutLocale === "/") return false;
        
        // Check if it's a known non-product route
        const isKnownRoute = knownRoutes.some(route =>
          pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/")
        );
        
        // If it's not a known route, it's handled by the catch-all [...categories] route
        return !isKnownRoute;
      };

      // Skip loading for product listing pages (category, brand, brand+category)
      // These pages should have instant transitions without loading indicators
      if (!isProductListingPage(pathname)) {
        // Start navigation loading immediately
        // This ensures loading.tsx files show up right away
        startNavigation("Loading page...");
      }

      // Update previous pathname
      prevPathnameRef.current = pathname;
    }
  }, [pathname, startNavigation]);

  return <>{children}</>;
}
