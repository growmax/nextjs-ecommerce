import type { CompetitorDetail } from "@/lib/api";
import { ManufacturerCompetitorService } from "@/lib/api";
import useSWR from "swr";

/**
 * Hook to fetch manufacturer competitors
 * @param sellerCompanyId - The seller company ID
 * @param cond - Condition to enable/disable the fetch
 */
export default function useGetManufacturerCompetitors(
  sellerCompanyId?: number | string,
  cond = true
) {
  const fetcher = async () => {
    if (!sellerCompanyId) {
      return { data: { competitorDetails: [] } };
    }
    return await ManufacturerCompetitorService.fetchCompetitors(
      sellerCompanyId
    );
  };

  const { data, error, isLoading } = useSWR(
    cond && sellerCompanyId ? `get-Competitor-${sellerCompanyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    competitors: data?.data?.competitorDetails || [],
    competitorsLoading: isLoading,
    competitorsError: error,
  };
}

export type { CompetitorDetail };
