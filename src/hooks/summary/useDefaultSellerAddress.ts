"use client";

import useUser from "@/hooks/useUser";
import SellerWarehouseService from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Hook to fetch default seller address/branch
 * Migrated from buyer-fe/src/hooks/useSellerAddress.js
 *
 * @param PrdId - Array of product IDs
 * @param buyerBranchId - Buyer branch ID
 * @param selectedSellerId - Selected seller company ID
 * @returns Default seller address with loading state
 */
export default function useDefaultSellerAddress(
  PrdId: (string | number)[],
  buyerBranchId: number | string | null | undefined,
  selectedSellerId: number | string | null | undefined
) {
  const { companydata } = useUser();
  const userId = (companydata as { userId?: number })?.userId;
  const companyId = (companydata as { companyId?: number })?.companyId;
 
  const { data, error, isLoading } = useQuery({
    queryKey: [
      "defualtSellerAddress",
      buyerBranchId,
      userId,
      companyId,
      selectedSellerId,
      ...PrdId,
    ],
    queryFn: async () => {
      if (!buyerBranchId || !selectedSellerId || !PrdId || PrdId.length === 0) {
        throw new Error("Missing required parameters");
      }

      return await SellerWarehouseService.findSellerBranch(
        String(userId || 0),
        String(companyId || 0),
        {
          userId: Number(userId || 0),
          buyerCompanyId: Number(companyId || 0),
          buyerBranchId: Number(buyerBranchId),
          productIds: PrdId.map(id => Number(id)),
          sellerCompanyId: selectedSellerId ? Number(selectedSellerId) : 0,
        }
      );
    },
    enabled:
      !!buyerBranchId &&
      !!selectedSellerId &&
      !!PrdId &&
      PrdId.length > 0 &&
      !!userId &&
      !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
  
  // Format the response - data is already an array of SellerBranch objects from the service
  // Each item has: { id, name, branchId, companyId }
  const formatAddress = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    // Return the full branch objects as they are already formatted by SellerWarehouseService
    return data;
  }, [data]);

  return {
    defaultSellerAddress: formatAddress || [],
    defaultSellerAddressLoading: isLoading || (!error && !data),
  };
}
