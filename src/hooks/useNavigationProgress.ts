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
 */
export function useNavigationProgress({
  autoDetect = true,
  delayMs = 100,
  respectReducedMotion = true,
  timeoutMs = 30000,
}: UseNavigationProgressOptions = {}) {
  const pathname = usePathname();
  const { isLoading: globalLoading, showLoading, hideLoading } = useLoading();

  const loadingId = "navigation";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const mountedRef = useRef(false);

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

  // Handle route changes
  useEffect(() => {
    if (pathname && isNavigatingRef.current && mountedRef.current) {
      // Small delay to allow for route change animation
      setTimeout(() => {
        if (mountedRef.current) {
          endNavigation("route_change");
        }
      }, 100);
    }
  }, [pathname, endNavigation]);

  // Set up navigation event listeners (safe approach)
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    // For app router, we don't have router.events like pages router
    // Instead, we'll rely on the global loading context
    // This is a simplified implementation for app router compatibility

    return () => {
      // Cleanup
    };
  }, [autoDetect]);

  // Handle global loading state changes
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    // If global loading starts and we're not already navigating, start navigation
    if (globalLoading && !isNavigatingRef.current) {
      startNavigation();
    }

    // If global loading ends and we were navigating, end navigation
    if (!globalLoading && isNavigatingRef.current) {
      endNavigation("global_loading_end");
    }
  }, [globalLoading, autoDetect, startNavigation, endNavigation]);

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
