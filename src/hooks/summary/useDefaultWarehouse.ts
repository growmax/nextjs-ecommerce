"use client";

import { useQuery } from "@tanstack/react-query";
import SellerWarehouseService from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";

/**
 * Hook to fetch default warehouse address by seller branch ID
 * Migrated from buyer-fe/src/components/Summary/hooks/useDefaultWarehosue.js
 * 
 * @param sellerBranchId - Seller branch ID
 * @returns Default warehouse address with loading state
 */
export default function useDefaultWarehouse(sellerBranchId: number | null | undefined) {
  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["defaultwarehouse", sellerBranchId],
    queryFn: async () => {
      if (!sellerBranchId) {
        throw new Error("Seller branch ID is required");
      }

      return await SellerWarehouseService.findWarehouse({
        sellerBranchId,
      });
    },
    enabled: !!sellerBranchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    defaultWarehouseAddress: data || null,
    defaultWarehouseAddressLoading: sellerBranchId ? (isLoading || (!error && !data)) : false,
  };
}

