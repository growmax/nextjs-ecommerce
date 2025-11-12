"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProductAssetsService, type ProductAsset } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import map from "lodash/map";
import { useMemo } from "react";

interface Product {
  productId?: number;
  [key: string]: unknown;
}

/**
 * Hook to fetch product assets for a list of products
 * @param products - Array of products with productId
 * @returns Product assets data
 */
export default function useProductAssets(products: Product[] = []) {
  const { user } = useCurrentUser();

  // Extract product IDs from products array
  const productIds = useMemo(() => {
    return map(products, "productId").filter(
      (id): id is number => id !== undefined && id !== null
    );
  }, [products]);

  // Fetch product assets using React Query
  const { data: productAssets } = useQuery({
    queryKey: ["product-assets", productIds.sort().join(","), user?.userId],
    queryFn: async () => {
      if (productIds.length === 0 || !user?.userId) {
        return null;
      }

      try {
        const response =
          await ProductAssetsService.getProductAssetsByProductIds(productIds);

        // Handle nested response structure (response.data.data)
        let data: ProductAsset[] = [];
        if (response && typeof response === "object") {
          // Try different nested structures
          if (
            "data" in response &&
            response.data &&
            typeof response.data === "object" &&
            "data" in response.data &&
            Array.isArray((response.data as { data: unknown }).data)
          ) {
            data = (response.data as { data: ProductAsset[] }).data;
          } else if ("data" in response && Array.isArray(response.data)) {
            data = response.data as ProductAsset[];
          } else if (Array.isArray(response)) {
            data = response as ProductAsset[];
          }
        }

        return data;
      } catch {
        return null;
      }
    },
    enabled: productIds.length > 0 && !!user?.userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    productAssets: productAssets || [],
  };
}
