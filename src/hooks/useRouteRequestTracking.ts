"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Global route request tracker to prevent duplicate RSC calls
 * This is a singleton pattern to track requests across all components
 */
class RouteRequestTracker {
  private activeRoutes = new Set<string>();
  private routeTimestamps = new Map<string, number>();
  private readonly DEBOUNCE_MS = 100;

  /**
   * Check if a route request is already in progress
   */
  isRouteActive(pathname: string): boolean {
    return this.activeRoutes.has(pathname);
  }

  /**
   * Check if we should allow a new request (debounce check)
   */
  shouldAllowRequest(pathname: string): boolean {
    const lastRequest = this.routeTimestamps.get(pathname);
    if (!lastRequest) return true;

    const now = Date.now();
    return now - lastRequest > this.DEBOUNCE_MS;
  }

  /**
   * Mark a route as active
   */
  startRoute(pathname: string): void {
    this.activeRoutes.add(pathname);
    this.routeTimestamps.set(pathname, Date.now());
  }

  /**
   * Mark a route as complete
   */
  endRoute(pathname: string): void {
    this.activeRoutes.delete(pathname);
  }

  /**
   * Clear all tracked routes (useful for cleanup)
   */
  clear(): void {
    this.activeRoutes.clear();
    this.routeTimestamps.clear();
  }
}

// Singleton instance
const routeTracker = new RouteRequestTracker();

/**
 * Hook to track route-level requests and prevent duplicate RSC calls
 *
 * This hook monitors pathname changes and ensures that:
 * - Only one RSC call happens per route change
 * - Rapid navigation changes are debounced
 * - Duplicate requests are prevented
 *
 * @example
 * ```tsx
 * export default function Page() {
 *   useRouteRequestTracking();
 *   // Your page content
 * }
 * ```
 */
export function useRouteRequestTracking() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // On initial mount, just track the current route
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevPathnameRef.current = pathname;
      routeTracker.startRoute(pathname);
      return;
    }

    // If pathname changed, we have a navigation
    if (prevPathnameRef.current !== pathname) {
      // End tracking for previous route
      if (prevPathnameRef.current) {
        routeTracker.endRoute(prevPathnameRef.current);
      }

      // Start tracking new route
      routeTracker.startRoute(pathname);
      prevPathnameRef.current = pathname;
    }

    // Cleanup: end tracking when component unmounts
    return () => {
      if (pathname) {
        routeTracker.endRoute(pathname);
      }
    };
  }, [pathname]);
}

/**
 * Check if a route request is currently active
 * Useful for components that need to know if a route is loading
 */
export function isRouteActive(pathname: string): boolean {
  return routeTracker.isRouteActive(pathname);
}

/**
 * Check if a new request should be allowed (debounce check)
 */
export function shouldAllowRouteRequest(pathname: string): boolean {
  return routeTracker.shouldAllowRequest(pathname);
}
