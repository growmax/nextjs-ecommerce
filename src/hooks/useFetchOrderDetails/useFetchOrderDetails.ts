"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useTenantData } from "@/hooks/useTenantData";
import { OrderDetailsService, type OrderDetailsResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Utility function to process order data
 * This should be placed in src/utils/functionalUtils.ts or similar
 *
 * @param data - Order details response
 * @param _roundOff - Round off precision (currently unused)
 * @param _quoteSettings - Quote settings (currently unused)
 * @returns Processed order data
 */
function initialDataValuvation(
  data: OrderDetailsResponse,
  _roundOff: number,
  _quoteSettings: Record<string, unknown>
): OrderDetailsResponse {
  // TODO: Implement or import from utils/functionalUtils
  // For now, return data as-is if utility doesn't exist
  if (data && data.data && data.data.orderDetails) {
    // Process order details if needed
    // This is a placeholder - replace with actual utility function
    return data;
  }
  return data;
}

/**
 * Hook to fetch order details using OrderDetailsService
 *
 * Architecture:
 * - Service: OrderDetailsService.fetchOrderDetails() - handles API calls
 * - Hook: useFetchOrderDetails() - manages state and data fetching
 * - Utility: initialDataValuvation() - processes/transforms data
 *
 * @param orderId - Order identifier
 * @returns Object with order details, loading state, error, and mutate function
 */
export default function useFetchOrderDetails(
  orderId: string | null | undefined
) {
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { quoteSettings } = useModuleSettings(user);

  const userId = user?.userId;
  const companyId = user?.companyId;
  const tenantId = tenantData?.tenant?.tenantCode;
  const roundOff = 2; // Default round off, update if user object has roundOff property

  // Use React Query for data fetching with caching
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["orderDetails", orderId, userId, companyId, tenantId],
    queryFn: async () => {
      if (!userId || !companyId || !tenantId || !orderId) {
        throw new Error("Missing required parameters");
      }

      // Use service instead of direct API call
      const response = await OrderDetailsService.fetchOrderDetails({
        userId,
        tenantId,
        companyId,
        orderId,
      });

      // Process data using utility function
      if (response && response.data && response.data.orderDetails) {
        const processedData = initialDataValuvation(
          response,
          roundOff,
          quoteSettings
        );

        // Return processed data
        return {
          ...response,
          data: processedData.data,
        };
      }

      return response;
    },
    enabled: !!orderId && !!companyId && !!userId && !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes - order details may change
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    fetchOrderResponse: data?.data,
    fetchOrderError: error,
    fetchOrderResponseLoading: isLoading,
    fetchOrderResponseMutate: refetch,
  };
}
