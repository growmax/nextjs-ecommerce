"use client";

import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";

/**
 * Hook to fetch register address (sold-to, ship-to, bill-to)
 * Migrated from buyer-fe/src/hooks/useRegisterAddress.js
 * 
 * @returns Register address data with loading state
 */
export default function useRegisterAddress() {
  const { companydata } = useUser();
  const companyId = (companydata as { companyId?: number })?.companyId;
  const userId = (companydata as { userId?: number })?.userId;

  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["registerAddressData", userId, companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      // TODO: Create getRegisterAddress method in CartServices if it doesn't exist
      // For now, return empty array as placeholder
      return { data: [] };
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    registerAddressData: (data as { data?: unknown[] })?.data || [],
    registerAddressDataError: error,
    registerAddressDataLoading: isLoading || (!error && !data),
  };
}

