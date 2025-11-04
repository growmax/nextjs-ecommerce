"use client";

import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import SearchService from "@/lib/api/services/SearchService";
import { AuthStorage } from "@/lib/auth";
import { buildProductSearchQuery } from "@/utils/elasticsearch/search-queries";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface UseSearchOptions {
  searchText?: string;
  elasticIndex?: string;
  enabled?: boolean;
}

export interface UseSearchResult {
  data: Array<{
    productId: number;
    id: string;
    brandProductId?: string;
    productName?: string;
    productShortDescription?: string;
    brandsName?: string;
    productAssetss?: Array<{ source: string; isDefault?: boolean }>;
    [key: string]: unknown;
  }>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to search products using Elasticsearch
 * @param options - Search options including searchText and elasticIndex
 * @returns Search results with loading state
 */
export default function useSearch(
  options: UseSearchOptions = {}
): UseSearchResult {
  const { searchText = "", elasticIndex, enabled = true } = options;
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

  // Get elastic index from tenant data or use provided one
  const finalElasticIndex = useMemo(() => {
    if (elasticIndex) {
      return elasticIndex;
    }
    if (tenantData?.tenant?.elasticCode) {
      return `${tenantData.tenant.elasticCode}pgandproducts`;
    }
    return "pgproduct";
  }, [elasticIndex, tenantData?.tenant?.elasticCode]);

  // Get access token from storage
  const accessToken = useMemo(() => AuthStorage.getAccessToken(), []);

  // Get catalog settings to extract CatalogCodes and EquipmentCodes
  const { data: catalogSettings } = useCatalogSettings(
    user?.companyId?.toString() || "",
    accessToken || ""
  );

  // Extract CatalogCodes and EquipmentCodes from catalog settings
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

  // Build query - convert readonly array to mutable for SearchService
  const query = useMemo(() => {
    if (!searchText.trim()) {
      return null;
    }
    const elasticQuery = buildProductSearchQuery(searchText);
    // Convert readonly _source array to mutable array
    return {
      ...elasticQuery,
      _source: elasticQuery._source
        ? [...elasticQuery._source]
        : elasticQuery._source,
    };
  }, [searchText]);

  // Search query
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "product-search",
      searchText,
      finalElasticIndex,
      catalogCodes.join(","),
      equipmentCodes.join(","),
      user?.userId,
    ],
    queryFn: async () => {
      if (!query || !searchText.trim()) {
        return { success: true, data: [], total: 0 };
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
          elasticIndex: finalElasticIndex,
          query,
          catalogCodes: catalogCodes.length > 0 ? catalogCodes : undefined,
          equipmentCodes:
            equipmentCodes.length > 0 ? equipmentCodes : undefined,
          context,
        });

        return result;
      } catch {
        return { success: false, data: [], total: 0 };
      }
    },
    enabled:
      enabled && !!searchText.trim() && !!finalElasticIndex && !!user?.userId,
    staleTime: 30 * 1000, // 30 seconds - search results can change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data: data?.data || [],
    loading: isLoading,
    error: error as Error | null,
  };
}
