"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Hook to ensure data fetching only happens after navigation completes
 *
 * This hook delays data fetching until after the pathname has stabilized,
 * ensuring navigation completes instantly before API calls begin.
 *
 * @param fetchFn - Function to call for data fetching
 * @param deps - Dependencies array for the fetch function (similar to useEffect)
 *
 * @example
 * ```tsx
 * usePostNavigationFetch(() => {
 *   fetchOrders();
 * }, [page, rowPerPage]);
 * ```
 */
export function usePostNavigationFetch(fetchFn: () => void, deps: any[] = []) {
  const pathname = usePathname();
  const navigationCompleteRef = useRef(false);
  const mountedRef = useRef(false);
  const prevPathnameRef = useRef<string | null>(null);

  // Detect when navigation completes
  useEffect(() => {
    // Reset navigation complete flag when pathname changes
    if (prevPathnameRef.current !== pathname) {
      navigationCompleteRef.current = false;
      prevPathnameRef.current = pathname;
    }

    // Mark navigation as complete after a brief delay
    const timer = setTimeout(() => {
      navigationCompleteRef.current = true;
      mountedRef.current = true;
    }, 50); // Small delay to ensure navigation is complete

    return () => clearTimeout(timer);
  }, [pathname]);

  // Fetch data only after navigation is complete
  useEffect(() => {
    // Only fetch after navigation is complete and component is mounted
    if (!navigationCompleteRef.current || !mountedRef.current) {
      return;
    }

    // Use requestIdleCallback with 0ms timeout for immediate execution
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(
        fetchFn,
        { timeout: 0 } // Immediate execution
      );
      return () => window.cancelIdleCallback(idleId);
    } else {
      // Fallback: immediate execution
      fetchFn();
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, ...deps]);
}
