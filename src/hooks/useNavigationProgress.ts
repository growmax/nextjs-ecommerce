"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLoading } from "@/contexts/LoadingContext";

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
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading: globalLoading, showLoading, hideLoading } = useLoading();
  
  const loadingId = "navigation";
  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const isNavigatingRef = useRef(false);
  const mountedRef = useRef(false);

  // Check if user prefers reduced motion
  const prefersReducedMotion = respectReducedMotion && 
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
  const clearTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  // Start navigation loading
  const startNavigation = (message?: string) => {
    if (isNavigatingRef.current || !mountedRef.current) return;
    
    isNavigatingRef.current = true;
    startTimeRef.current = Date.now();
    
    // Respect reduced motion - don't show progress bar
    if (!prefersReducedMotion && autoDetect) {
      showLoading(message || "Loading...", loadingId);
    }
    
    // Set timeout to prevent infinite loading
    clearTimeout();
    timeoutRef.current = setTimeout(() => {
      endNavigation("timeout");
    }, timeoutMs);
  };

  // End navigation loading
  const endNavigation = (reason?: string) => {
    if (!isNavigatingRef.current || !mountedRef.current) return;
    
    isNavigatingRef.current = false;
    clearTimeout();
    
    // Calculate minimum time to show progress (for better UX)
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
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
  };

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
  }, [pathname]);

  // Set up navigation event listeners (safe approach)
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    // Safe event handler for navigation start
    const handleStart = (url: string) => {
      // Only trigger for external navigation (not hash changes or same page)
      if (typeof url === "string" && !url.includes('#') && mountedRef.current) {
        startNavigation();
      }
    };

    // Safe event handler for navigation completion
    const handleComplete = () => {
      if (mountedRef.current) {
        endNavigation("navigation_complete");
      }
    };

    // Safe event handler for navigation error
    const handleError = () => {
      if (mountedRef.current) {
        endNavigation("navigation_error");
      }
    };

    // Listen for route changes if router events are available
    if (typeof window !== "undefined" && router?.events) {
      try {
        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleError);

        return () => {
          try {
            router.events?.off("routeChangeStart", handleStart);
            router.events?.off("routeChangeComplete", handleComplete);
            router.events?.off("routeChangeError", handleError);
          } catch {
            // Ignore cleanup errors
          }
        };
      } catch {
        // If router events fail, silently continue without automatic detection
        console.warn("Navigation progress: Unable to attach router events, falling back to LoadingContext only");
      }
    }
  }, [router, autoDetect, mountedRef.current]);

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
  }, [globalLoading, autoDetect, mountedRef.current]);

  // Additional safety: monitor for potential stuck states
  useEffect(() => {
    if (!autoDetect || !mountedRef.current) return;

    const safetyTimeout = setTimeout(() => {
      if (isNavigatingRef.current && mountedRef.current) {
        console.warn("Navigation progress: Possible stuck state detected, forcing completion");
        endNavigation("safety_timeout");
      }
    }, timeoutMs * 2);

    return () => clearTimeout(safetyTimeout);
  }, [isNavigatingRef.current, autoDetect, timeoutMs, mountedRef.current]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mountedRef.current) {
        clearTimeout();
        endNavigation("unmount");
      }
    };
  }, []);

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
