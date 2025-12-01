"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FormattedProduct, ElasticSearchQuery } from "@/lib/api/services/SearchService/SearchService";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { BrowseQueryResult } from "@/utils/opensearch/browse-queries";

export interface UseProductsOptions {
  buildQuery: (filters: any) => BrowseQueryResult;
  initialProducts?: FormattedProduct[];
  initialTotal?: number;
  pageSize?: number;
}

export interface UseProductsReturn {
  products: FormattedProduct[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useProducts Hook
 * Fetches products based on URL state changes
 * Automatically refetches when searchParams change
 * 
 * @param options - Configuration options
 * @returns Products data and loading state
 */
export function useProducts({
  buildQuery,
  initialProducts = [],
  initialTotal = 0,
  pageSize = 20,
}: UseProductsOptions): UseProductsReturn {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<FormattedProduct[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch products
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get tenant code from environment
      const tenantCode = process.env.NEXT_PUBLIC_TENANT_CODE || "";
      const elasticIndex = tenantCode ? `${tenantCode}pgandproducts` : "";

      if (!elasticIndex) {
        throw new Error("Elastic index not available");
      }

      // Parse filters from URL
      const page = parseInt(searchParams.get("page") || "1", 10);
      const sort = parseInt(searchParams.get("sort") || "1", 10);
      const minPrice = searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!, 10)
        : undefined;
      const maxPrice = searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!, 10)
        : undefined;
      const inStock = searchParams.get("inStock") === "true";
      const brands = searchParams.get("brands")
        ? searchParams.get("brands")!.split(",").filter(Boolean)
        : undefined;

      // Build query
      const queryResult = buildQuery({
        page,
        pageSize,
        sortBy: { sortBy: sort },
        filters: {
          ...(brands && { brands }),
          ...(minPrice !== undefined && maxPrice !== undefined && {
            priceRange: [minPrice, maxPrice],
          }),
          ...(inStock && { inStock }),
        },
      });

      // Build query object ensuring sort is properly typed
      const searchQuery: ElasticSearchQuery = {
        query: queryResult.query.query,
        size: queryResult.query.size,
        from: queryResult.query.from,
        _source: queryResult.query._source,
        ...(queryResult.query.sort && { sort: queryResult.query.sort }),
      };

      // Fetch products
      const result = await SearchService.searchProducts({
        elasticIndex,
        query: searchQuery,
      });

      setProducts(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      console.error("Error fetching products:", err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, buildQuery, pageSize]);

  /**
   * Refetch products manually
   */
  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  /**
   * Fetch products when URL changes
   */
  useEffect(() => {
    // Only fetch if URL has changed (not on initial mount if we have initial data)
    if (initialProducts.length > 0 && products === initialProducts) {
      // Check if URL params differ from initial state
      const hasUrlParams =
        searchParams.get("page") ||
        searchParams.get("sort") ||
        searchParams.get("minPrice") ||
        searchParams.get("maxPrice") ||
        searchParams.get("inStock") ||
        searchParams.get("brands");

      if (!hasUrlParams) {
        // No URL params, use initial data
        return;
      }
    }

    fetchProducts();
  }, [searchParams, fetchProducts, initialProducts, products]); // Re-fetch when URL changes

  return {
    products,
    total,
    loading,
    error,
    refetch,
  };
}

