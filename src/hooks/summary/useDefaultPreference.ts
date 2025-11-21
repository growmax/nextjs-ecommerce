"use client";

import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import useUser from "@/hooks/useUser";
import CompanyService from "@/lib/api/services/CompanyService";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";

/**
 * Hook to fetch default company preferences for summary pages
 * Migrated from buyer-fe/src/components/Summary/hooks/useDefaultPreference.js
 *
 * @param trigger - Timestamp or value to force refresh
 * @param selectedSellerId - Selected seller company ID (optional, for summary/reorder/clone)
 * @param isSummary - Whether this is a summary page (uses V1 endpoint)
 * @returns Default preferences with loading state
 */
export default function useDefaultPreference(
  trigger: number | string | null,
  selectedSellerId?: number | string | null,
  isSummary = false
) {
  const { companydata } = useUser();
  const companyId = (companydata as { companyId?: number })?.companyId;

  const { data, error, isLoading } = useQuery({
    queryKey: [
      "defaultpreference",
      trigger,
      companyId,
      selectedSellerId,
      isSummary,
    ],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const response = await CompanyService.getDefaultPreferences({
        companyId,
        selectedSellerId: selectedSellerId || null,
        isSummary,
      });

      // Normalize response format
      // Backend returns: { success: "success", data: {...} }
      if (response && typeof response === "object" && "data" in response) {
        return (response as { data: unknown }).data;
      }

      return response;
    },
    enabled: !!companyId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: false,
    retry: false,
  });

  const isDefaultCashDiscountEnabled =
    data &&
    typeof data === "object" &&
    "paymentTermsId" in data &&
    data.paymentTermsId &&
    typeof data.paymentTermsId === "object" &&
    "cashdiscount" in data.paymentTermsId &&
    Boolean(
      (data.paymentTermsId as { cashdiscountValue?: number }).cashdiscountValue
    );

  const { latestPaymentTerms } = useGetLatestPaymentTerms(
    !isDefaultCashDiscountEnabled
  );

  // Merge payment terms data
  const mergedData =
    data && typeof data === "object"
      ? {
          ...data,
          prevPaymentTerms: (data as { paymentTermsId?: unknown })
            .paymentTermsId,
          cashDiscountTerm: !isEmpty(latestPaymentTerms)
            ? latestPaymentTerms
            : (data as { paymentTermsId?: unknown }).paymentTermsId,
        }
      : null;

  return {
    defaultpreference: mergedData,
    defaultpreferenceLoading: isLoading || (!error && !data),
  };
}
