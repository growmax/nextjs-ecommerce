"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

/**
 * Hook to prefetch main navigation routes on app mount
 * Optimized for fast, non-aggressive prefetching - completes within 1 second
 * Only prefetches the most critical routes for instant navigation
 */
export function usePrefetchMainRoutes() {
  const router = useRouter();

  useEffect(() => {
    // Only the most critical routes - limited set for faster completion
    const criticalRoutes = ["/dashboard", "/cart"];

    // Prefetch immediately with minimal delay for faster completion
    if (typeof window !== "undefined") {
      // Use requestIdleCallback with very short timeout for fast prefetching
      if ("requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(
          () => {
            criticalRoutes.forEach(route => {
              try {
                router.prefetch(route);
              } catch {
                // Silently fail - prefetching is optional
              }
            });
          },
          { timeout: 100 } // Very short timeout for fast completion
        );

        return () => {
          window.cancelIdleCallback(idleId);
        };
      } else {
        // Fallback: immediate prefetch for faster completion
        criticalRoutes.forEach(route => {
          try {
            router.prefetch(route);
          } catch {
            // Silently fail
          }
        });
        return undefined;
      }
    }
    return undefined;
  }, [router]);
}
