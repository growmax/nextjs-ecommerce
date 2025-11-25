"use client";

import { useRouter } from "@/i18n/navigation";
import { useCallback, useRef } from "react";

/**
 * Hook to prefetch routes on hover/focus
 * Debounces prefetch calls to avoid excessive network requests
 */
export function usePrefetchOnHover() {
  const router = useRouter();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  const prefetchRoute = useCallback(
    (href: string) => {
      // Skip if already prefetched
      if (prefetchedRoutes.current.has(href)) {
        return;
      }

      // Clear any pending prefetch
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Debounce prefetch by 100ms to avoid excessive requests
      prefetchTimeoutRef.current = setTimeout(() => {
        try {
          router.prefetch(href);
          prefetchedRoutes.current.add(href);
        } catch (error) {
          // Silently fail - prefetching is optional
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to prefetch route:", href, error);
          }
        }
      }, 100);
    },
    [router]
  );

  const handleMouseEnter = useCallback(
    (href: string) => {
      prefetchRoute(href);
    },
    [prefetchRoute]
  );

  const handleTouchStart = useCallback(
    (href: string) => {
      prefetchRoute(href);
    },
    [prefetchRoute]
  );

  const handleFocus = useCallback(
    (href: string) => {
      prefetchRoute(href);
    },
    [prefetchRoute]
  );

  return {
    handleMouseEnter,
    handleTouchStart,
    handleFocus,
    prefetchRoute,
  };
}
