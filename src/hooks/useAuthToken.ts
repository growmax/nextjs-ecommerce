"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { AuthStorage } from "@/lib/auth";
import { useCallback, useState } from "react";

export function useAuthToken() {
  const { logout, checkAuth } = useUserDetails();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) {
      // Wait for current refresh to complete
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!isRefreshing) {
            clearInterval(checkInterval);
            resolve(void 0);
          }
        }, 100);
      });
      return AuthStorage.getAccessToken();
    }

    const token = AuthStorage.getAccessToken();
    if (!token) {
      return null;
    }

    // If token is not expired, return it
    if (!AuthStorage.isTokenExpired()) {
      return token;
    }

    // Try to refresh the token
    setIsRefreshing(true);
    try {
      const refreshed = await AuthStorage.refreshToken();
      if (!refreshed) {
        // Refresh failed, logout user
        logout();
        return null;
      }
      // Update context after successful refresh to sync UI state
      // Add a small delay to ensure cookie is available in document.cookie
      setTimeout(() => {
        checkAuth();
        // Dispatch custom event to notify other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("token-refreshed"));
        }
      }, 100);
      return refreshed.accessToken;
    } catch {
      logout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, logout, checkAuth]);

  return {
    getValidToken,
    isRefreshing,
  };
}
