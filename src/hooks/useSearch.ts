"use client";

import SearchService from "@/lib/api/services/SearchService";
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
 * Hook to search products using Elasticsearch without authentication
 * @param options - Search options including searchText and elasticIndex
 * @returns Search results with loading state
 */
export default function useSearch(
  options: UseSearchOptions = {}
): UseSearchResult {
  const { searchText = "", elasticIndex, enabled = true } = options;

  // Get elastic index - default to provided one or use standard index
  const finalElasticIndex = useMemo(() => {
    if (elasticIndex) {
      return elasticIndex;
    }
    return "pgproduct";
  }, [elasticIndex]);

  // Build search query
  const query = useMemo(() => {
    if (!searchText.trim()) {
      return null;
    }
    const elasticQuery = buildProductSearchQuery(searchText);
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
    ],
    queryFn: async () => {
      if (!query || !searchText.trim()) {
        return { success: true, data: [], total: 0 };
      }

      try {
        // Simple search without any authentication
        const result = await SearchService.searchProducts({
          elasticIndex: finalElasticIndex,
          query,
        });

        return result;
      } catch {
        return { success: false, data: [], total: 0 };
      }
    },
    enabled: enabled && !!searchText.trim() && !!finalElasticIndex,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data: data?.data || [],
    loading: isLoading,
    error: error as Error | null,
  };
}
