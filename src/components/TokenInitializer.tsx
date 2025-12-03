"use client";

import { useEffect } from "react";
import TokenRefreshService from "@/lib/services/TokenRefreshService";

/**
 * TokenInitializer - Ensures tokens are valid on page load/refresh
 * This component runs once on mount and validates/refreshes tokens if needed
 */
export function TokenInitializer() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    // Validate and refresh token if needed (non-blocking)
    // This ensures tokens are fresh on page load/refresh
    TokenRefreshService.ensureValidToken().catch(() => {
      // Silent failure - token refresh will be handled by API interceptor if needed
    });
  }, []);

  // This component doesn't render anything
  return null;
}
