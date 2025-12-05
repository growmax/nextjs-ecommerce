"use client";

import { useLoading } from "@/hooks/useGlobalLoader";
import { usePathname } from "@/i18n/navigation";
import { useCallback, useEffect, useRef } from "react";

interface UseNavigationProgressOptions {
  /**
   * Whether to automatically detect navigation events
   * @default true
   */
  autoDetect?: boolean;

  /**
   * Minimum delay before showing progress bar (ms)
   * Prevents flash for very fast navigations
   * @default 100
   */
  delayMs?: number;

  /**
   * Whether to respect reduced motion preferences
   * @default true
   */
  respectReducedMotion?: boolean;

  /**
   * Timeout for navigation detection (ms)
   * @default 30000
   */
  timeoutMs?: number;
}

/**
 * Hook for automatically managing navigation progress
 *
 * This hook integrates with Next.js App Router navigation events and your existing
 * LoadingContext to automatically show/hide a progress bar during navigation.
 *
 * The loader shows immediately on navigation clicks and hides only after navigation completes.
 * It is separate from API loading states.
 *
 * The loader shows immediately on navigation clicks and hides only after navigation completes.
 * It is separate from API loading states.
 */
export function useNavigationProgress({
  autoDetect = true,
  delayMs: _delayMs = 100,
  respectReducedMotion = true,
  timeoutMs = 30000,
}: UseNavigationProgressOptions = {}) {
  const pathname = usePathname();
  const { showLoading, hideLoading } = useLoading();

  const loadingId = "navigation";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const mountedRef = useRef(false);
  const pendingPathnameRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPathRef = useRef<string | null>(null);

  // Check if user prefers reduced motion
  const prefersReducedMotion =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mark as mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Clear any existing timeout
  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined as any;
    }
  }, []);

  // End navigation loading - hide immediately when GET request completes
  const endNavigation = useCallback(
    (_reason?: string) => {
      if (!isNavigatingRef.current || !mountedRef.current) return undefined;

      isNavigatingRef.current = false;
      clearNavigationTimeout();

      // Hide progress bar immediately when GET request completes
      // No delay - we want it to hide as soon as GET is done
      hideLoading(loadingId);

      return undefined;
    },
    [clearNavigationTimeout, hideLoading]
  );

  // Start navigation loading
  const startNavigation = useCallback(
    (message?: string) => {
      if (isNavigatingRef.current || !mountedRef.current) return;

      isNavigatingRef.current = true;
      startTimeRef.current = Date.now();

      // Respect reduced motion - don't show progress bar
      if (!prefersReducedMotion && autoDetect) {
        showLoading(message || "Loading...", loadingId);
      }

      // Set timeout to prevent infinite loading
      clearNavigationTimeout();
      timeoutRef.current = setTimeout(() => {
        endNavigation("timeout");
      }, timeoutMs) as any;
    },
    [
      autoDetect,
      prefersReducedMotion,
      showLoading,
      clearNavigationTimeout,
      timeoutMs,
      endNavigation,
    ]
  );

  // Track previous pathname to detect navigation
  const prevPathnameRef = useRef<string | null>(null);

  // Global click handler to detect navigation clicks early
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    const handleClick = (e: MouseEvent) => {
      // Debounce: prevent duplicate triggers within 200ms
      const now = Date.now();
      if (now - lastClickTimeRef.current < 200) {
        return;
      }

      // Find the closest anchor element
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, mailto, tel, etc.
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }

      // Skip if already navigating to avoid duplicate triggers
      if (isNavigatingRef.current) {
        return;
      }

      // Skip if it's the same path (no navigation)
      const currentPath = window.location.pathname;
      const targetPath = href.startsWith("/")
        ? href
        : new URL(href, window.location.origin).pathname;

      // Remove locale prefix for comparison
      const getPathWithoutLocale = (path: string): string => {
        return path.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";
      };

      // Check if target path is a product listing page (category, brand, brand+category)
      const isProductListingPage = (path: string): boolean => {
        const pathWithoutLocale = getPathWithoutLocale(path);

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
        // This includes: /category-name, /brand-name, /category/subcategory, etc.
        return !isKnownRoute;
      };

      const currentPathWithoutLocale = getPathWithoutLocale(currentPath);
      const targetPathWithoutLocale = getPathWithoutLocale(targetPath);

      if (currentPathWithoutLocale === targetPathWithoutLocale) {
        return;
      }

      // Prevent duplicate clicks to the same path
      if (lastClickPathRef.current === targetPathWithoutLocale) {
        return;
      }

      // Check if this is a Next.js Link (has data attributes or is within a Link component)
      // Next.js Link components typically have specific attributes
      const isNextLink =
        anchor.hasAttribute("data-nextjs-link") ||
        anchor.closest("[data-nextjs-link]") !== null;

      // Only handle Next.js Link clicks or internal navigation links
      if (isNextLink || (href.startsWith("/") && !href.startsWith("//"))) {
        // Mark this click to prevent duplicates
        lastClickTimeRef.current = now;
        lastClickPathRef.current = targetPathWithoutLocale;
        pendingPathnameRef.current = targetPathWithoutLocale;

        // Skip loading for product listing pages (category, brand, brand+category)
        // These pages should have smooth, instant transitions
        if (!isProductListingPage(targetPathWithoutLocale)) {
          // Start navigation loader immediately on click, before pathname changes
          // Note: We don't prevent default - let Next.js handle the actual navigation
          startNavigation("Loading page...");
        }
      }
    };

    // Use capture phase to catch clicks early, but don't prevent default
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [autoDetect, startNavigation]);

  // Handle route changes - detect GET request completion
  const pathnameChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mountedRef.current) {
      // Initialize on first mount
      if (pathname && prevPathnameRef.current === null) {
        prevPathnameRef.current = pathname;
      }
      return undefined;
    }

    if (!pathname) return undefined;

    // Clear any pending timeout
    if (pathnameChangeTimeoutRef.current) {
      clearTimeout(pathnameChangeTimeoutRef.current);
      pathnameChangeTimeoutRef.current = null;
    }

    // Remove locale prefix for comparison
    const getPathWithoutLocale = (path: string): string => {
      return path.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";
    };

    const currentPathname = getPathWithoutLocale(pathname);

    // If pathname changed, check if GET request has completed
    if (
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== currentPathname
    ) {
      // ALWAYS hide loader on pathname change
      // This handles cases where:
      // 1. This hook instance started navigation (isNavigatingRef = true)
      // 2. Another hook instance (e.g. useNavigationWithLoader) started it but died (unmounted)

      pathnameChangeTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          // Force hide the loader regardless of who started it
          // This acts as a "garbage collector" for zombie loaders
          hideLoading(loadingId);

          // Also reset local state if needed
          if (isNavigatingRef.current) {
            endNavigation("get_request_complete");
          }
        }
        pathnameChangeTimeoutRef.current = null;
      }, 50) as any; // Reduced from 200ms to 50ms for faster handoff to loading.tsx

      // Update previous pathname immediately to prevent duplicate processing
      prevPathnameRef.current = currentPathname;
      pendingPathnameRef.current = null;
      lastClickPathRef.current = null;

      return () => {
        if (pathnameChangeTimeoutRef.current) {
          clearTimeout(pathnameChangeTimeoutRef.current);
          pathnameChangeTimeoutRef.current = null;
        }
      };
    } else if (prevPathnameRef.current === null) {
      // Initialize on first mount
      prevPathnameRef.current = currentPathname;
    }
    return undefined;
  }, [pathname, endNavigation, hideLoading, loadingId]);

  // Additional safety: monitor for potential stuck states
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    const safetyTimeout = setTimeout(() => {
      if (isNavigatingRef.current && mountedRef.current) {
        endNavigation("safety_timeout");
      }
    }, timeoutMs * 2) as any;

    return () => clearTimeout(safetyTimeout);
  }, [autoDetect, timeoutMs, endNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // DON'T call endNavigation on unmount!
      // The loader should persist across page transitions.
      // It will be hidden by the pathname change detection or timeout.
      clearNavigationTimeout();
      // Note: We intentionally don't call endNavigation here
      // because we want the loader to stay visible during page transitions
    };
  }, [clearNavigationTimeout]);

  return {
    // State
    isNavigating: isNavigatingRef.current,

    // Actions
    startNavigation,
    endNavigation,

    // Config
    loadingId,
    timeoutMs,
  };
}

// Hook for manual progress control without automatic detection
export function useManualNavigationProgress() {
  const { showLoading, hideLoading } = useLoading();
  const loadingId = "navigation-manual";

  const startProgress = (message?: string) => {
    showLoading(message || "Loading...", loadingId);
  };

  const completeProgress = () => {
    hideLoading(loadingId);
  };

  return {
    startProgress,
    completeProgress,
    loadingId,
  };
}
