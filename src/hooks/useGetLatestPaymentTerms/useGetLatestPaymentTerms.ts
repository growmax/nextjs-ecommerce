import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { PaymentTerm } from "@/lib/api";
import PaymentService from "@/lib/api/services/PaymentService/PaymentService";
import useSWR from "swr/immutable";

/**
 * Hook to get latest payment terms with cash discount
 * This hook uses PaymentService.fetchPaymentTerms which calls PaymentTerms/fetchPaymentTerms endpoint
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

  const fetcher = async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Use PaymentService.fetchPaymentTerms which calls PaymentTerms/fetchPaymentTerms?userId=${userId}&isB2C=false
    const response = await PaymentService.fetchPaymentTerms(userId);

    // Filter for cash discount terms and return the first one
    // Response structure: { data: PaymentTerm[], success: string, message: string }
    const dataterms = response?.data?.filter(
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
