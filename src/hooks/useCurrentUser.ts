"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import UserServices from "@/lib/api/services/UserServices/UserServices";

import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
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

        console.log('Making API call to getUser');
        const response = await UserServices.getUser({ sub });

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

          setUser(userData);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [sub]);

  return { user, sub1: sub, loading, error };
}
