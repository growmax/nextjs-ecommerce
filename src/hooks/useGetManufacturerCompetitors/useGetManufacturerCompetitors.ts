import type { CompetitorDetail } from "@/lib/api";
import { ManufacturerCompetitorService } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch manufacturer competitors
 * @param sellerCompanyId - The seller company ID
 * @param cond - Condition to enable/disable the fetch
 */
export default function useGetManufacturerCompetitors(
  sellerCompanyId?: number | string,
  cond = true
) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["competitors", sellerCompanyId],
    queryFn: async () => {
      if (!sellerCompanyId) {
        return { data: { competitorDetails: [] } };
      }
      return await ManufacturerCompetitorService.fetchCompetitors(
        sellerCompanyId
      );
    },
    enabled: cond && !!sellerCompanyId,
    staleTime: 30 * 60 * 1000, // 30 minutes - competitor data is relatively static
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    competitors: data?.data?.competitorDetails || [],
    competitorsLoading: isLoading,
    competitorsError: error,
  };
}

export type { CompetitorDetail };
