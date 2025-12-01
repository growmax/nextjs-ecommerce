"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import API from "@/lib/api";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import type { JWTPayload } from "@/lib/interfaces/JWTInterfaces";
import { useEffect, useRef, useState } from "react";

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
  roundOff?: string | number | null;
  taxExempted?: boolean | undefined;
  defaultCountryCallingCode?: number | string;
  defaultCountryCodeIso?: number | string;
}

/**
 * Extract user data from JWT token
 */
function extractUserFromJWT(): CurrentUser | null {
  try {
    const token = AuthStorage.getAccessToken();
    if (!token) return null;

    const jwtService = JWTService.getInstance();
    const payload = jwtService.decodeToken(token) as JWTPayload | null;
    
    if (!payload) return null;

    return {
      currency: payload.currency,
      userId: payload.userId,
      companyId: payload.companyId,
      displayName: payload.displayName || "",
      email: payload.email || "",
      phoneNumber: payload.phoneNumber,
      role: payload.roleName,
      roundOff: payload.roundOff ?? null,
      taxExempted: payload.taxExempted ?? false,
    };
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useUserDetails();

  const [sub, setSub] = useState<string | null>(null);

  // 🚀 LOCK TO PREVENT MULTIPLE API CALLS
  const isFetchedRef = useRef(false);

  // Extract sub from JWT
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

  // Fetch user ONLY ONCE
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!sub) {
          setLoading(false);
          return;
        }

        // STOP DOUBLE CALLS (React Strict Mode, rerenders, etc.)
        if (isFetchedRef.current) {
          console.log('Skipping API call - already fetched');
          setLoading(false);
          return;
        }

        isFetchedRef.current = true; // Lock it after first call

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
          console.log('Making API call to getUser');
          const response = await API.User.getUser({ sub });
          if (response?.data) {
            const data = response.data as typeof response.data & {
              roundOff?: string | number | null;
              taxExempted?: boolean;
              defaultCountryCallingCode?: string;
              defaultCountryCodeIso?: string;
            };
            const userData: CurrentUser = {
              currency: data.currency,
              userId: data.userId,
              companyId: data.companyId,
              displayName: data.displayName || "",
              email: data.email || "",
              role: data.roleName,
              roundOff: data.roundOff || "",
              taxExempted: data.taxExempted || false,
              defaultCountryCallingCode: data.defaultCountryCallingCode || "",
              defaultCountryCodeIso: data.defaultCountryCodeIso || "",
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

    fetchUser();
  }, [sub]);

  return { user, sub1: sub, loading, error };
}
