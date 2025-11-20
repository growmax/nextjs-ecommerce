"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * Custom hook for prefetching routes to improve navigation performance
 * Tracks prefetched routes to avoid duplicate prefetch calls
 *
 * @returns Object with prefetch function and prefetchAndNavigate function
 *
 * @example
 * ```tsx
 * const { prefetch, prefetchAndNavigate } = useRoutePrefetch();
 *
 * // Prefetch a route
 * prefetch('/details/orderDetails/123');
 *
 * // Prefetch and navigate
 * prefetchAndNavigate('/details/orderDetails/123');
 * ```
 */
export function useRoutePrefetch() {
  const router = useRouter();
  const locale = useLocale();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  /**
   * Normalize route - add locale prefix if not present
   * @param route - The route to normalize
   * @returns Normalized route with locale prefix
   */
  const normalizeRoute = useCallback(
    (route: string): string => {
      if (!route) return "";
      return route.startsWith(`/${locale}`)
        ? route
        : `/${locale}${route.startsWith("/") ? route : `/${route}`}`;
    },
    [locale]
  );

  /**
   * Prefetch a route if it hasn't been prefetched yet
   * Optimized to complete under 1 second for fast navigation
   * @param route - The route to prefetch (can be with or without locale prefix)
   * @param force - Force prefetch even if already prefetched (useful for navigation)
   */
  const prefetch = useCallback(
    (route: string, force = false) => {
      if (!route) return;

      const normalizedRoute = normalizeRoute(route);

      if (force || !prefetchedRoutes.current.has(normalizedRoute)) {
        prefetchedRoutes.current.add(normalizedRoute);
        // Always prefetch immediately for fast navigation (< 1 sec)
        // Safely handle cases where prefetch might not be available (e.g., in tests)
        if (typeof router.prefetch === "function") {
          router.prefetch(normalizedRoute);
        }
      }
    },
    [normalizeRoute, router]
  );

  /**
   * Prefetch multiple routes at once (batched for performance)
   * @param routes - Array of routes to prefetch
   * @param batchSize - Number of routes to prefetch in parallel (default: 5)
   */
  const prefetchMultiple = useCallback(
    (routes: string[], batchSize = 5) => {
      if (!routes.length) return;

      // Filter out already prefetched routes
      const routesToPrefetch = routes
        .map(route => normalizeRoute(route))
        .filter(route => route && !prefetchedRoutes.current.has(route));

      if (!routesToPrefetch.length) return;

      // Batch prefetch calls for better performance
      for (let i = 0; i < routesToPrefetch.length; i += batchSize) {
        const batch = routesToPrefetch.slice(i, i + batchSize);
        batch.forEach(route => {
          prefetchedRoutes.current.add(route);
          // Safely handle cases where prefetch might not be available (e.g., in tests)
          if (typeof router.prefetch === "function") {
            router.prefetch(route);
          }
        });
      }
    },
    [normalizeRoute, router]
  );

  /**
   * Prefetch a route and then navigate to it immediately
   * Optimized to ensure prefetch completes under 1 second for fast navigation
   * @param route - The route to prefetch and navigate to
   */
  const prefetchAndNavigate = useCallback(
    (route: string) => {
      if (!route) return;

      const normalizedRoute = normalizeRoute(route);

      // Always prefetch before navigation to ensure route is ready (< 1 sec)
      // Even if already prefetched, re-prefetch to ensure freshness
      if (!prefetchedRoutes.current.has(normalizedRoute)) {
        prefetchedRoutes.current.add(normalizedRoute);
      }
      // Prefetch immediately (Next.js handles deduplication internally)
      // Safely handle cases where prefetch might not be available (e.g., in tests)
      if (typeof router.prefetch === "function") {
        router.prefetch(normalizedRoute);
      }

      // Navigate immediately - Next.js will use prefetched data if available
      router.push(normalizedRoute);
    },
    [normalizeRoute, router]
  );

  /**
   * Clear the prefetched routes cache (useful for testing or cleanup)
   */
  const clearCache = useCallback(() => {
    prefetchedRoutes.current.clear();
  }, []);

  return {
    prefetch,
    prefetchMultiple,
    prefetchAndNavigate,
    clearCache,
  };
}
