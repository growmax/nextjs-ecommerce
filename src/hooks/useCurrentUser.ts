"use client";

import { useAuth } from "@/contexts/AuthContext";
import UserServices from "@/lib/api/services/UserServices";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { useEffect, useState } from "react";

interface CurrencyObj {
  currencyCode: string;
  decimal: string;
  description: string;
  id: number;
  precision: number;
  symbol: string;
  tenantId: number;
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

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

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

        // Fetch user data from API - UserServices.getUser returns UserApiResponse
        const response = await UserServices.getUser({ sub });

        // UserApiResponse has structure: { data: {...}, status: "success" }
        if (response.data) {
          const userData: CurrentUser = {
            // @ts-expect-error - API response may not include all CurrencyObj properties (description, id, tenantId)
            currency: response.data.currency,
            userId: response.data.userId,
            companyId: response.data.companyId,
            displayName: response.data.displayName || "",
            email: response.data.email || "",
            // @ts-expect-error - phoneNumber may not exist on UserDetails type
            phoneNumber: response.data.phoneNumber,
            role: response.data.roleName,
          };

          // Cache the user data in localStorage
          localStorage.setItem("currentUser", JSON.stringify(userData));
          setUser(userData);
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
