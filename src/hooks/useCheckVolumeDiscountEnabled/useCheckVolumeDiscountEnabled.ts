import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Hook to check if volume discount is enabled for a company
 * This hook calls the API route which uses DiscountService internally
 *
 * @param companyId - The company ID to check
 * @param cond - Condition to enable/disable the check (default: true)
 * @returns Object with VD status flags and loading state
 *
 * @example
 * ```tsx
 * const {
 *   VDapplied,
 *   VolumeDiscountAvailable,
 *   ShowVDButton,
 *   vdLoading
 * } = useCheckVolumeDiscountEnabled(companyId, shouldCheck);
 * ```
 */
function useCheckVolumeDiscountEnabled(
  companyId: string | number | undefined | null,
  cond = true
) {
  const { data, isLoading } = useQuery({
    queryKey: ["volumeDiscount", companyId],
    queryFn: async () => {
      return axios({
        url: "/api/sales/checkIsVDEnabledByCompanyId",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { companyId },
      });
    },
    enabled: !!companyId && cond,
    staleTime: 30 * 60 * 1000, // 30 minutes - volume discount settings rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });

  return {
    VDapplied: false,
    ShowVDButton: data?.data?.data ? true : false,
    VolumeDiscountAvailable: data?.data?.data ? true : false,
    vdLoading: isLoading,
  };
}

export default useCheckVolumeDiscountEnabled;
