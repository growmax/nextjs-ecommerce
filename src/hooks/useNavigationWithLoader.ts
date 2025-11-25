"use client";

import { useRouter } from "@/i18n/navigation";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { useTransition, useRef, useCallback } from "react";

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

      // Mark as active navigation
      activeNavigationRef.current = href;
      navigationTracker.set(href, now);

      // Start navigation loader immediately
      startNavigation("Loading page...");

      // Navigate
      startTransition(() => {
        router.push(href);
      });

      // Clear active navigation after a delay
      setTimeout(() => {
        activeNavigationRef.current = null;
      }, 1000);

      // Fallback: if navigation doesn't complete, force hard navigation
      setTimeout(() => {
        const currentPathAfter =
          window.location.pathname.replace(
            /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
            ""
          ) || "/";
        if (
          (!currentPathAfter.startsWith(targetPath) && targetPath !== "/") ||
          (targetPath === "/" && currentPathAfter !== "/")
        ) {
          window.location.href = href;
        }
      }, 500);
    },
    [router, startNavigation]
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

      // Mark as active navigation
      activeNavigationRef.current = href;
      navigationTracker.set(`replace:${href}`, now);

      // Start navigation loader immediately
      startNavigation("Loading page...");

      // Navigate
      startTransition(() => {
        router.replace(href);
      });

      // Clear active navigation after a delay
      setTimeout(() => {
        activeNavigationRef.current = null;
      }, 1000);

      // Fallback: if navigation doesn't complete, force hard navigation
      setTimeout(() => {
        const currentPathAfter =
          window.location.pathname.replace(
            /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
            ""
          ) || "/";
        if (currentPathAfter !== targetPath) {
          window.location.href = href;
        }
      }, 500);
    },
    [router, startNavigation]
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
