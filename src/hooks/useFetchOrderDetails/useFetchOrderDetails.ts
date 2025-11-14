"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useTenantData } from "@/hooks/useTenantData";
import { OrderDetailsService, type OrderDetailsResponse } from "@/lib/api";
import useSWR from "swr";

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

  // Fetch order details using service (not direct API route)
  const fetchOrders = async () => {
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
  };

  // Use SWR for data fetching with caching
  const { data, error, mutate, isLoading } = useSWR(
    orderId && companyId && userId && tenantId
      ? `orderDetails-${orderId}-${userId}-${companyId}`
      : null,
    fetchOrders,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    fetchOrderResponse: data?.data,
    fetchOrderError: error,
    fetchOrderResponseLoading: isLoading || (!error && !data),
    fetchOrderResponseMutate: mutate,
  };
}
