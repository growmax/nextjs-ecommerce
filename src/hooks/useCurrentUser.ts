"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import UserServices from "@/lib/api/services/UserServices";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { useEffect, useState } from "react";

interface CurrencyObj {
  currencyCode: string;
  decimal: string;
  description?: string;
  id?: number;
  precision: number;
  symbol: string;
  tenantId?: number;
  thousand: string;
}

interface CurrentUser {
  currency: CurrencyObj;
  userId: number;
  companyId: number;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

// Helper function to extract user data from JWT payload
const extractUserFromJWT = (): CurrentUser | null => {
  const token = AuthStorage.getAccessToken();
  if (!token) return null;

  const jwtService = JWTService.getInstance();
  const payload = jwtService.decodeToken(token) as any;

  if (!payload || (!payload.userId && !payload.companyId)) {
    return null;
  }

  return {
    currency: {
      currencyCode: payload.currency?.currencyCode || "INR",
      decimal: payload.currency?.decimal || ".",
      description: payload.currency?.description || "INDIAN RUPEE",
      id: payload.currency?.id || 96,
      precision: payload.currency?.precision || 2,
      symbol: payload.currency?.symbol || "INR ₹",
      thousand: payload.currency?.thousand || ",",
    },
    userId: Number(payload.userId || payload.id) || 0,
    companyId: Number(payload.companyId) || 0,
    displayName: payload.displayName || "",
    email: payload.email || "",
    role: payload.accountRole || payload.roleName || "",
  };
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useUserDetails();

  // Get sub from JWT token
  const [sub, setSub] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = AuthStorage.getAccessToken();
      if (token) {
        const jwtService = JWTService.getInstance();
        const payload = jwtService.decodeToken(token);
        setSub(payload?.sub || null);
      }
    } else {
      setSub(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // If no sub, can't fetch user data
        if (!sub) {
          setLoading(false);
          return;
        }

        // First check if we have cached user data
        const cachedUser = localStorage.getItem("currentUser");
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        // Try to extract user data from JWT token directly (primary method)
        const jwtUserData = extractUserFromJWT();
        if (jwtUserData) {
          // Cache the user data in localStorage
          localStorage.setItem("currentUser", JSON.stringify(jwtUserData));
          setUser(jwtUserData);
          setLoading(false);
          return;
        }

        // Fallback: Try to fetch from API (but handle 404 gracefully)
        try {
          const response = await UserServices.getUser({ sub });
          if (response.data) {
            const userData: CurrentUser = {
              currency: response.data.currency,
              userId: response.data.userId,
              companyId: response.data.companyId,
              displayName: response.data.displayName || "",
              email: response.data.email || "",
              role: response.data.roleName,
            };

            // Cache the user data in localStorage
            localStorage.setItem("currentUser", JSON.stringify(userData));
            setUser(userData);
          }
        } catch {
          // Try JWT extraction as last resort
          const fallbackUserData = extractUserFromJWT();
          if (fallbackUserData) {
            localStorage.setItem(
              "currentUser",
              JSON.stringify(fallbackUserData)
            );
            setUser(fallbackUserData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [sub]);

  const clearUserCache = () => {
    localStorage.removeItem("currentUser");
  };

  return {
    user,
    loading,
    error,
    clearUserCache,
  };
}
