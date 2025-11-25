"use client";

import useUser from "@/hooks/useUser/useUser";
import CurrencyService from "@/lib/api/services/CurrencyService/CurrencyService";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch currency factor for a company
 * Migrated from buyer-fe/src/components/Summary/hooks/useCurrencyFactor.js
 *
 * @param companyId - Optional company ID (defaults to user's company ID)
 * @returns Currency factor with loading state
 */
export default function useCurrencyFactor(companyId?: number | string | null) {
  const { companydata } = useUser();
  const userCompanyId = (companydata as { companyId?: number })?.companyId;

  // Use provided companyId or fallback to user's companyId
  const targetCompanyId = companyId || userCompanyId;

  const { data, error, isLoading } = useQuery({
    queryKey: ["get-Currency", targetCompanyId],
    queryFn: async () => {
      if (!targetCompanyId) {
        throw new Error("Company ID is required");
      }

      const response = await CurrencyService.getCurrencyFactor(targetCompanyId);

      // Normalize response format
      // Backend returns: { success: "success", data: number }
      if (response && typeof response === "object" && "data" in response) {
        return (response as { data: unknown }).data;
      }

      return response;
    },
    enabled: !!targetCompanyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    CurrencyFactor: data as number | undefined,
    CurrencyFactorLoading: isLoading || (!error && !data),
  };
}
