"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { OrderDetailsService, type OrderDetailsResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface UseGetVersionDetailsParams {
  orderIdentifier: string;
  orderVersion: number | null;
  triggerVersionCall: boolean;
}

/**
 * Hook to fetch order details by version with React Query caching
 */
export function useGetVersionDetails({
  orderIdentifier,
  orderVersion,
  triggerVersionCall,
}: UseGetVersionDetailsParams) {
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

  const shouldFetch =
    triggerVersionCall &&
    orderVersion !== null &&
    !!orderIdentifier &&
    !!user?.userId &&
    !!user?.companyId &&
    !!tenantData?.tenant?.tenantCode;

  return useQuery<OrderDetailsResponse>({
    queryKey: [
      "orderVersionDetails",
      orderIdentifier,
      orderVersion,
      user?.userId,
      user?.companyId,
    ],
    queryFn: async () => {
      if (
        !user?.userId ||
        !user?.companyId ||
        !tenantData?.tenant?.tenantCode ||
        !orderIdentifier ||
        orderVersion === null
      ) {
        throw new Error("Missing required parameters");
      }

      const response = await OrderDetailsService.fetchOrderDetailsByVersion({
        userId: user.userId,
        companyId: user.companyId,
        orderIdentifier,
        orderVersion,
      });

      // Handle nested response structure: { success: true, data: { data: {...} } }
      const responseWithNesting = response as unknown as {
        success?: boolean;
        data?: { data?: OrderDetailsResponse["data"] };
        message?: string | null;
        status?: string;
      };

      // Extract actual data from nested structure
      if (responseWithNesting?.data?.data) {
        return {
          data: responseWithNesting.data.data,
          message: responseWithNesting.message || null,
          status: responseWithNesting.status || "success",
        } as OrderDetailsResponse;
      }

      return response;
    },
    enabled: shouldFetch,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache version data
  });
}
