"use client";

import { useEffect } from "react";
import TokenRefreshService from "@/lib/services/TokenRefreshService";
import { useUserDetails } from "@/contexts/UserDetailsContext";

/**
 * TokenInitializer - Ensures tokens are valid on page load/refresh
 * This component runs once on mount and validates/refreshes tokens if needed
 */
export function TokenInitializer() {
  const { checkAuth } = useUserDetails();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    // Validate and refresh token if needed (non-blocking)
    // This ensures tokens are fresh on page load/refresh
    TokenRefreshService.ensureValidToken()
      .then(() => {
        // Sync auth state after token validation/refresh
        // Add a small delay to ensure cookie is available in document.cookie
        setTimeout(() => {
          checkAuth();
          // Dispatch custom event to notify other components
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("token-refreshed"));
          }
        }, 100);
      })
      .catch(() => {
        // Silent failure - token refresh will be handled by API interceptor if needed
        // Still check auth state in case token exists
        setTimeout(() => {
          checkAuth();
        }, 100);
      });
  }, [checkAuth]);

  // This component doesn't render anything
  return null;
}
