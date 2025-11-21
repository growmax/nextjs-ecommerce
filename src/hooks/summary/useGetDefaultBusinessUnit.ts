"use client";

import { useQuery } from "@tanstack/react-query";
import { orderBy, each, uniqBy } from "lodash";

/**
 * Hook to fetch and determine default business unit
 * Migrated from buyer-fe/src/components/Sales/hooks/useGetBusinessUnit.js
 *
 * @param sellerBranchId - Seller branch ID
 * @param products - Array of products to determine business unit from
 * @returns Default business unit with loading state
 */
export default function useGetDefaultBusinessUnit(
  sellerBranchId: number | string | null | undefined,
  products: any[] = []
) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["getBuListData", sellerBranchId],
    queryFn: async () => {
      if (!sellerBranchId) {
        throw new Error("Seller branch ID is required");
      }

      // TODO: Create getBusinessUnitList method in SalesService if it doesn't exist
      // For now, return empty array as placeholder
      return { data: { data: [] } };
    },
    enabled: !!sellerBranchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  /**
   * Get business unit with higher priority based on products
   */
  function getHigherpriority(arr: any[]) {
    let productsBuList: any[] = [];
    each(products, prod => {
      if (prod.businessUnit) {
        productsBuList.push(prod.businessUnit);
      }
    });

    let combinedBuList: any[] = [];

    each(arr, data => {
      each(productsBuList, prdBu => {
        if (data.businessUnitId?.id === prdBu.id) {
          combinedBuList.push({
            businessUnitId: prdBu,
            branchBUId: data.branchBUId,
          });
        }
      });
    });

    if (combinedBuList && combinedBuList.length >= 1) {
      return orderBy(
        uniqBy(combinedBuList, "businessUnitId.id"),
        "businessUnitId.priority",
        "desc"
      )[0];
    } else {
      if (arr && arr.length >= 1) {
        return orderBy(arr, "businessUnitId.priority", "desc")[0];
      } else {
        return null;
      }
    }
  }

  const defaultBu = data
    ? getHigherpriority((data as any)?.data?.data || [])
    : null;

  return {
    businessUnitListData: (data as any)?.data?.data || [],
    defaultBusinessUnit: defaultBu,
    businessUnitListDataLoading: isLoading || (!error && !data),
  };
}
