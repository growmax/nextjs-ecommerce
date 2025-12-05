"use client";

import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useRef, useTransition } from "react";

// Global navigation deduplication tracker
const navigationTracker = new Map<string, number>();
const NAVIGATION_DEBOUNCE_MS = 300; // Prevent duplicate navigations within 300ms

/**
 * Hook that wraps router navigation with automatic loader display
 *
 * Use this hook instead of useRouter when you want the navigation loader
 * to show automatically for programmatic navigation.
 *
 * @example
 * ```tsx
 * const { push, replace } = useNavigationWithLoader();
 *
 * // This will automatically show the loader
 * push('/details/orderDetails/123');
 * ```
 */
export function useNavigationWithLoader() {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();
  const { showLoading, hideLoading } = useGlobalLoader();
  const [isPending, startTransition] = useTransition();
  const activeNavigationRef = useRef<string | null>(null);

  const push = useCallback(
    (href: string) => {
      const now = Date.now();
      const lastNavigation = navigationTracker.get(href);

      // Prevent duplicate navigation within debounce window
      if (lastNavigation && now - lastNavigation < NAVIGATION_DEBOUNCE_MS) {
        return; // Ignore duplicate navigation
      }

      // Prevent navigation to the same route that's already active
      if (activeNavigationRef.current === href) {
        return; // Already navigating to this route
      }

      // Normalize path for comparison
      const currentPath =
        window.location.pathname.replace(
          /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
          ""
        ) || "/";
      const targetPath =
        href.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";

      // Don't navigate if already on target path
      if (currentPath === targetPath) {
        return;
      }

      // Check if target path is a product listing page (category, brand, brand+category)
      const isProductListingPage = (path: string): boolean => {
        // Brand pages: /brands/[slug] or /brands/[slug]/[...categories]
        if (path.startsWith("/brands/")) return true;

        // Category page: /category (legacy route)
        if (path.startsWith("/category")) return true;

        // Define all known non-product-listing routes
        const knownRoutes = [
          "/", "/dashboard", "/search", "/products", "/quotesummary",
          "/checkout", "/notification", "/settings", "/landing",
          "/ordersummary", "/details", "/categories", "/cart"
        ];

        // Exact match for root
        if (path === "/") return false;

        // Check if it's a known non-product route
        const isKnownRoute = knownRoutes.some(route =>
          path === route || path.startsWith(route + "/")
        );

        // If it's not a known route, it's handled by the catch-all [...categories] route
        return !isKnownRoute;
      };

      // Mark as active navigation
      activeNavigationRef.current = href;
      navigationTracker.set(href, now);

      // Skip loaders for product listing pages to maintain smooth UX
      if (!isProductListingPage(targetPath)) {
        // Start navigation loader immediately (both progress bar and blocking loader)
        startNavigation("Loading page...");
        showLoading("Loading...", "navigation");
      }

      // Navigate
      startTransition(() => {
        router.push(href);
      });

      // Clear active navigation and hide loader after a delay (only if loader was shown)
      setTimeout(() => {
        activeNavigationRef.current = null;
        if (!isProductListingPage(targetPath)) {
          hideLoading("navigation");
        }
      }, 1000);
    },
    [router, startNavigation, showLoading, hideLoading]
  );

  const replace = useCallback(
    (href: string) => {
      const now = Date.now();
      const lastNavigation = navigationTracker.get(`replace:${href}`);

      // Prevent duplicate navigation within debounce window
      if (lastNavigation && now - lastNavigation < NAVIGATION_DEBOUNCE_MS) {
        return; // Ignore duplicate navigation
      }

      // Prevent navigation to the same route that's already active
      if (activeNavigationRef.current === href) {
        return; // Already navigating to this route
      }

      // Normalize path for comparison
      const currentPath =
        window.location.pathname.replace(
          /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
          ""
        ) || "/";
      const targetPath =
        href.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";

      // Don't navigate if already on target path
      if (currentPath === targetPath) {
        return;
      }

      // Check if target path is a product listing page (same as push method)
      const isProductListingPage = (path: string): boolean => {
        if (path.startsWith("/brands/")) return true;
        if (path.startsWith("/category")) return true;

        const knownRoutes = [
          "/", "/dashboard", "/search", "/products", "/quotesummary",
          "/checkout", "/notification", "/settings", "/landing",
          "/ordersummary", "/details", "/categories", "/cart"
        ];

        if (path === "/") return false;

        const isKnownRoute = knownRoutes.some(route =>
          path === route || path.startsWith(route + "/")
        );

        return !isKnownRoute;
      };

      // Mark as active navigation
      activeNavigationRef.current = href;
      navigationTracker.set(`replace:${href}`, now);

      // Skip loaders for product listing pages to maintain smooth UX
      if (!isProductListingPage(targetPath)) {
        // Start navigation loader immediately (both progress bar and blocking loader)
        startNavigation("Loading page...");
        showLoading("Loading...", "navigation");
      }

      // Navigate
      startTransition(() => {
        router.replace(href);
      });

      // Clear active navigation and hide loader after a delay (only if loader was shown)
      setTimeout(() => {
        activeNavigationRef.current = null;
        if (!isProductListingPage(targetPath)) {
          hideLoading("navigation");
        }
      }, 1000);
    },
    [router, startNavigation, showLoading, hideLoading]
  );

  return {
    push,
    replace,
    isPending,
    // Expose other router methods if needed
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}
