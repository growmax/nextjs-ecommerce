"use client";

import { ProductListService } from "@/lib/api";
import type { ProductListItem } from "@/types/product-listing";
import { getCategoryId } from "@/utils/ProductList/categoryMapping";
import { useEffect, useState } from "react";

interface CategoryProductsOptions {
  categorySlug: string;
  enabled?: boolean;
}

interface CategoryProductsResult {
  products: ProductListItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage products for a specific category
 * 
 * @param options - Hook configuration
 * @param options.categorySlug - Category slug from URL (e.g., "milwakee", "all")
 * @param options.enabled - Whether to fetch data (default: true)
 * @returns Product list, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { products, isLoading, error } = useCategoryProducts({
 *   categorySlug: "milwakee"
 * });
 * ```
 */
export function useCategoryProducts({
  categorySlug,
  enabled = true,
}: CategoryProductsOptions): CategoryProductsResult {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Map category slug to internal category ID
      const categoryId = getCategoryId(categorySlug);

      if (categoryId === null) {
        throw new Error(`Invalid category: ${categorySlug}`);
      }

      // Fetch products for this category
      const productList = await ProductListService.fetchByCategory(categoryId);

      setProducts(productList);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load products";
      setError(errorMessage);
      console.error("Failed to load category products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, enabled]);

  return {
    products,
    isLoading,
    error,
    refetch: loadProducts,
  };
}
