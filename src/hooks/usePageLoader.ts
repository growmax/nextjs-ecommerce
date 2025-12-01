"use client";

import { useLoading } from "@/hooks/useGlobalLoader";
import { useEffect } from "react";

/**
 * Hook to ensure clean handoff from Navigation Spinner to Page Skeleton.
 * 
 * Usage: Call this at the top of any page component that has its own Skeleton loader.
 * Behavior: Immediately hides the "navigation" loader when the component mounts.
 * 
 * This enables the following UX flow:
 * 1. Navigation Start: Show Global Spinner (handled by navigation system)
 * 2. Page Mount: Immediately HIDE Global Spinner and SHOW Page Skeleton (this hook)
 * 3. Data Loaded: Replace Skeleton with Real Data (handled by page component)
 */
export function usePageLoader() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    // Force hide the navigation loader immediately upon mount
    // This allows the page's local Skeleton to take over visually
    hideLoading("navigation");
  }, [hideLoading]);
}
