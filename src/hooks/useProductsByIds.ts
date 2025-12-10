"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useTenantData } from "@/hooks/useTenantData";
import type { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { getCatalogSettings } from "@/lib/appconfig";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";

export interface UseProductsByIdsOptions {
  brandProductIds: (string | number)[];
  elasticIndex?: string | undefined;
  enabled?: boolean;
  path?: string; // For cache key differentiation
}

/**
 * Hook to fetch products by brandProductId array
 * Replaces useProductarr hook from buyer-fe
 */
export function useProductsByIds(
  options: UseProductsByIdsOptions
): UseQueryResult<FormattedProduct[]> {
  const {
    brandProductIds,
    elasticIndex: providedElasticIndex,
    enabled = true,
    path,
  } = options;
  const { tenantData } = useTenantData();
  const { user } = useUserDetails();
  const accessToken =
    typeof window !== "undefined"
      ? document.cookie
        .split("; ")
        .find(row => row.startsWith("access_token="))
        ?.split("=")[1] || undefined
      : undefined;

  // Get elastic index from tenant data or use provided one
  const elasticIndex = useMemo(() => {
    if (providedElasticIndex) {
      return providedElasticIndex;
    }
    if (tenantData?.tenant?.elasticCode) {
      return `${tenantData.tenant.elasticCode}pgandproducts`;
    }
    // Fallback to sandbox default if no elasticCode available
    return "sandboxpgandproducts";
  }, [providedElasticIndex, tenantData?.tenant?.elasticCode]);

  // Fetch catalog settings (optional - only if user is authenticated)
  const { data: catalogSettings } = useQuery({
    queryKey: ["catalogSettings", user?.companyId],
    queryFn: async () => {
      if (!user?.companyId || !accessToken) {
        return null;
      }
      try {
        return await getCatalogSettings(user.companyId.toString(), accessToken);
      } catch {
        return null;
      }
    },
    enabled: !!user?.companyId && !!accessToken,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Extract CatalogCodes and EquipmentCodes
  const catalogCodes = useMemo(() => {
    if (!catalogSettings?.data?.CatalogAssigned) {
      return [];
    }
    return catalogSettings.data.CatalogAssigned.filter(
      item => item.isCatalog && item.name
    )
      .map(item => item.name!)
      .filter((code): code is string => !!code);
  }, [catalogSettings]);

  const equipmentCodes = useMemo(() => {
    if (!catalogSettings?.data?.CatalogAssigned) {
      return [];
    }
    return catalogSettings.data.CatalogAssigned.filter(
      item => !item.isCatalog && item.name
    )
      .map(item => item.name!)
      .filter((code): code is string => !!code);
  }, [catalogSettings]);

  // Build query to fetch products by brandProductId
  const query = useMemo(() => {
    const must: Array<Record<string, unknown>> = [
      {
        term: {
          is_published: 1,
        },
      },
      {
        terms: {
          "brand_product_id.keyword": brandProductIds,
        },
      },
    ];

    // Add catalog/equipment code filters if available
    if (catalogCodes.length > 0 || equipmentCodes.length > 0) {
      must.push({
        terms: {
          "catalogCode.keyword": [...catalogCodes, ...equipmentCodes],
        },
      });
    }

    return {
      query: {
        bool: {
          must,
          must_not: [],
        },
      },
      size: brandProductIds.length,
      from: 0,
    };
  }, [brandProductIds, catalogCodes, equipmentCodes]);

  return useQuery({
    queryKey: [
      "products-by-ids",
      path || "homepage",
      brandProductIds.sort().join(","),
      elasticIndex,
      catalogCodes.join(","),
      equipmentCodes.join(","),
    ],
    queryFn: async () => {
      if (!brandProductIds.length || !elasticIndex) {
        return [];
      }

      try {
        const context =
          user?.userId && user?.companyId && tenantData?.tenant?.tenantCode
            ? {
              companyId: user.companyId,
              userId: user.userId,
              tenantCode: tenantData.tenant.tenantCode,
              ...(accessToken && { accessToken }),
            }
            : undefined;

        const result = await SearchService.searchProducts({
          elasticIndex,
          query,
          catalogCodes: catalogCodes.length > 0 ? catalogCodes : undefined,
          equipmentCodes:
            equipmentCodes.length > 0 ? equipmentCodes : undefined,
          context,
        });

        return result.data || [];
      } catch (error) {
        console.error("Failed to fetch products by IDs:", error);
        return [];
      }
    },
    enabled: enabled && brandProductIds.length > 0 && !!elasticIndex,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
