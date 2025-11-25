"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { useEffect } from "react";

/**
 * RoutePrefetcher - Aggressively prefetches common routes when app loads
 * This ensures routes are ready before users navigate to them
 * Uses requestIdleCallback for non-blocking prefetching
 */
export function RoutePrefetcher() {
  const { prefetchMultiple } = useRoutePrefetch();
  const { isAuthenticated } = useUserDetails();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Use requestIdleCallback to prefetch when browser is idle
    const prefetchRoutes = () => {
      const commonRoutes = [
        "/dashboard",
        "/landing/orderslanding",
        "/landing/quoteslanding",
        "/settings/profile",
        "/settings/company",
        "/cart",
        "/products",
        "/search",
        "/notification",
      ];

      // Prefetch all routes in parallel
      prefetchMultiple(commonRoutes);
    };

    // Prefetch immediately for critical routes
    prefetchRoutes();

    // Also prefetch when browser is idle (if available)
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 2000 });
    }
  }, [isAuthenticated, prefetchMultiple]);

  return null;
}
