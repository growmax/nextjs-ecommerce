import axios from "axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useSWR from "swr/immutable";
import type { PaymentTerm } from "@/lib/api";

/**
 * Hook to get latest payment terms with cash discount
 * This hook calls the API route which uses PaymentService internally
 *
 * @param fetchLatestPaymentTerm - Condition to enable/disable the check (default: false)
 * @returns Object with latest payment terms and loading state
 *
 * @example
 * ```tsx
 * const {
 *   latestPaymentTerms,
 *   latestPaymentTermsLoading
 * } = useGetLatestPaymentTerms(true);
 * ```
 */
export default function useGetLatestPaymentTerms(
  fetchLatestPaymentTerm = false
) {
  const { user } = useCurrentUser();
  const userId = user?.userId;
  const companyId = user?.companyId;

  const fetcher = async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await axios({
      url: "/api/sales/payments/getAllPaymentTerms",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { userId, companyId },
    });

    // Filter for cash discount terms and return the first one
    const dataterms = response?.data?.data?.filter(
      (term: PaymentTerm) => term.cashdiscount === true
    )?.[0];

    return dataterms;
  };

  const { data: paymentTerms, error: paymentTermError } = useSWR(
    userId && fetchLatestPaymentTerm ? ["fetchPaymentTerms", userId] : null,
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );

  return {
    latestPaymentTerms: paymentTerms,
    latestPaymentTermsLoading: !paymentTerms && !paymentTermError,
  };
}
