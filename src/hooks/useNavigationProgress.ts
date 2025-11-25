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
 */
export function useNavigationProgress({
  autoDetect = true,
  delayMs = 100,
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

  // End navigation loading
  const endNavigation = useCallback(
    (_reason?: string) => {
      if (!isNavigatingRef.current || !mountedRef.current) return undefined;

      isNavigatingRef.current = false;
      clearNavigationTimeout();

      // Calculate minimum time to show progress (for better UX)
      const elapsed = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0;
      const minimumDelay = prefersReducedMotion ? 0 : delayMs;

      const completeProgress = () => {
        hideLoading(loadingId);
      };

      if (elapsed < minimumDelay) {
        setTimeout(() => {
          if (mountedRef.current) {
            completeProgress();
          }
        }, minimumDelay - elapsed);
      } else {
        completeProgress();
      }

      return undefined;
    },
    [clearNavigationTimeout, prefersReducedMotion, delayMs, hideLoading]
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

        // Start navigation loader immediately on click, before pathname changes
        // Note: We don't prevent default - let Next.js handle the actual navigation
        startNavigation("Loading page...");
      }
    };

    // Use capture phase to catch clicks early, but don't prevent default
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [autoDetect, startNavigation]);

  // Handle route changes - detect navigation completion
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

    // Clear any pending pathname change timeout
    if (pathnameChangeTimeoutRef.current) {
      clearTimeout(pathnameChangeTimeoutRef.current);
      pathnameChangeTimeoutRef.current = null;
    }

    // Remove locale prefix for comparison
    const getPathWithoutLocale = (path: string): string => {
      return path.replace(/^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/, "") || "/";
    };

    const currentPathname = getPathWithoutLocale(pathname);

    // If pathname changed, navigation has completed
    if (
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== currentPathname
    ) {
      // If we were navigating, end navigation after ensuring full completion
      // Wait 600ms to cover the full navigation cycle (~500ms navigation + buffer)
      if (isNavigatingRef.current) {
        pathnameChangeTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && isNavigatingRef.current) {
            endNavigation("route_change");
          }
          pathnameChangeTimeoutRef.current = null;
        }, 600) as any;

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
      } else {
        // Navigation completed but we weren't tracking it (e.g., browser back/forward)
        prevPathnameRef.current = currentPathname;
        pendingPathnameRef.current = null;
        lastClickPathRef.current = null;
      }
    } else if (prevPathnameRef.current === null) {
      // Initialize on first mount
      prevPathnameRef.current = currentPathname;
    }
    return undefined;
  }, [pathname, endNavigation]);

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
      if (mountedRef.current) {
        clearNavigationTimeout();
        endNavigation("unmount");
      }
    };
  }, [clearNavigationTimeout, endNavigation]);

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
