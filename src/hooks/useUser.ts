"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import UserServices from "@/lib/api/services/UserServices/UserServices";
import { AuthStorage } from "@/lib/auth";
import { UserApiResponse, UserDetails } from "@/lib/interfaces/UserInterfaces";
import { JWTService } from "@/lib/services/JWTService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Hook to fetch user data including listAccessElements
 * Similar to buyer-fe's useUser hook pattern
 *
 * @returns User data with listAccessElements, loading state, and error
 */
export default function useUser() {
  const { isAuthenticated } = useUserDetails();
  const [sub, setSub] = useState<string | null>(null);

  // Extract sub from JWT token
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

  // Fetch user data using TanStack Query
  const {
    data: userData,
    error,
    isLoading,
    refetch,
  } = useQuery<UserApiResponse>({
    queryKey: ["user", "findByName", sub],
    queryFn: async () => {
      if (!sub) {
        throw new Error("No sub available");
      }
      return await UserServices.getUser({ sub });
    },
    enabled: !!sub && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data rarely changes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false, // User data rarely changes, no need to refetch on tab switch
    retry: 1,
  });

  // Extract user details from response
  const user: UserDetails | null = userData?.data || null;
  const companydata = user
    ? {
        ...user,
        // Ensure listAccessElements is always an array
        listAccessElements: user.listAccessElements || [],
      }
    : null;

  return {
    companydata: companydata || {},
    companyLoading: isLoading,
    companydataisValidating: isLoading,
    mutatecompanydata: refetch,
    error,
  };
}
