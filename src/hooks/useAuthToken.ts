"use client";

import { useState, useCallback } from "react";
import { AuthStorage } from "@/lib/auth";
import { useUserDetails } from "@/contexts/UserDetailsContext";

export function useAuthToken() {
  const { logout } = useUserDetails();
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
      return refreshed.accessToken;
    } catch {
      logout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, logout]);

  return {
    getValidToken,
    isRefreshing,
  };
}
