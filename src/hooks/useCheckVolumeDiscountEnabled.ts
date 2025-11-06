import axios from "axios";
import useSWR from "swr/immutable";

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
  const fetcher = async () => {
    return axios({
      url: "/api/sales/checkIsVDEnabledByCompanyId",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { companyId },
    });
  };

  const { data, error } = useSWR(
    companyId && cond
      ? ["Check_Is_Volume_Discount_Enabled", companyId, cond]
      : null,
    fetcher
  );

  return {
    VDapplied: false,
    ShowVDButton: data?.data?.data ? true : false,
    VolumeDiscountAvailable: data?.data?.data ? true : false,
    vdLoading: !data && !error,
  };
}

export default useCheckVolumeDiscountEnabled;
