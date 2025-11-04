"use client";

import { Input } from "@/components/ui/input";
import useSearch from "@/hooks/useSearch";
import { useTenantData } from "@/hooks/useTenantData";
import { ProductAssetsService } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageWithFallback from "../ImageWithFallback";

export interface ProductSearchResult {
  productId: number;
  id: string;
  brandProductId?: string;
  productName?: string;
  productShortDescription?: string;
  brandsName?: string;
  productAssetss?: Array<{ source: string; isDefault?: boolean }>;
  [key: string]: unknown;
}

export interface ProductSearchInputProps {
  onProductSelect?: (product: ProductSearchResult) => void;
  placeholder?: string;
  className?: string;
  elasticIndex?: string | undefined;
  disabled?: boolean;
}

export default function ProductSearchInput({
  onProductSelect,
  placeholder = "Search and add products...",
  className,
  elasticIndex,
  disabled = false,
}: ProductSearchInputProps) {
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tenantData } = useTenantData();

  // Get elastic index
  const finalElasticIndex = useMemo(() => {
    if (elasticIndex) {
      return elasticIndex;
    }
    if (tenantData?.tenant?.elasticCode) {
      return `${tenantData.tenant.elasticCode}pgandproducts`;
    }
    return "pgproduct";
  }, [elasticIndex, tenantData?.tenant?.elasticCode]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms debounce for fast response

    return () => clearTimeout(timer);
  }, [searchText]);

  // Search products
  const { data: searchResults, loading } = useSearch({
    searchText: debouncedSearchText,
    elasticIndex: finalElasticIndex,
    enabled: debouncedSearchText.trim().length > 0 && !disabled,
  });

  // Extract product IDs from search results
  const productIds = useMemo(() => {
    return searchResults
      .map(product => product.productId)
      .filter((id): id is number => id !== undefined && id !== null);
  }, [searchResults]);

  // Fetch product assets for the search results
  const { data: productAssets } = useQuery({
    queryKey: ["product-assets-search", productIds.sort().join(",")],
    queryFn: async () => {
      if (productIds.length === 0) {
        return null;
      }

      try {
        const response =
          await ProductAssetsService.getProductAssetsByProductIds(productIds);
        // Handle nested response structure
        let data: Array<{
          productId?: { id?: number };
          source?: string;
          isDefault?: number | boolean;
        }> = [];
        if (response && typeof response === "object") {
          if (
            "data" in response &&
            response.data &&
            typeof response.data === "object" &&
            "data" in response.data &&
            Array.isArray((response.data as { data: unknown }).data)
          ) {
            data = (response.data as { data: typeof data }).data;
          } else if ("data" in response && Array.isArray(response.data)) {
            data = response.data as typeof data;
          } else if (Array.isArray(response)) {
            data = response as typeof data;
          }
        }
        return data;
      } catch {
        return null;
      }
    },
    enabled: productIds.length > 0 && !disabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Helper to get product image
  const getProductImage = useCallback(
    (product: ProductSearchResult): string | null => {
      if (!product.productId || !productAssets) {
        // Try to get image from productAssetss if available
        if (product.productAssetss && product.productAssetss.length > 0) {
          const defaultImage = product.productAssetss.find(asset => {
            const isDefault = asset.isDefault;
            if (typeof isDefault === "boolean") {
              return isDefault === true;
            }
            if (typeof isDefault === "number") {
              return isDefault === 1;
            }
            if (typeof isDefault === "string") {
              return isDefault === "1" || isDefault === "true";
            }
            return false;
          });
          return (
            defaultImage?.source || product.productAssetss[0]?.source || null
          );
        }
        return null;
      }

      // Find assets for this product ID
      const productAssetsForProduct = productAssets.filter(
        asset => asset.productId?.id === product.productId
      );

      if (productAssetsForProduct.length > 0) {
        // Find default image
        const defaultImage = productAssetsForProduct.find(asset => {
          const isDefault = asset.isDefault;
          if (typeof isDefault === "boolean") {
            return isDefault === true;
          }
          if (typeof isDefault === "number") {
            return isDefault === 1;
          }
          if (typeof isDefault === "string") {
            return isDefault === "1" || isDefault === "true";
          }
          return false;
        });
        return (
          defaultImage?.source || productAssetsForProduct[0]?.source || null
        );
      }

      // Fallback to productAssetss if available
      if (product.productAssetss && product.productAssetss.length > 0) {
        const defaultImage = product.productAssetss.find(asset => {
          const isDefault = asset.isDefault;
          if (typeof isDefault === "boolean") {
            return isDefault === true;
          }
          if (typeof isDefault === "number") {
            return isDefault === 1;
          }
          if (typeof isDefault === "string") {
            return isDefault === "1" || isDefault === "true";
          }
          return false;
        });
        return (
          defaultImage?.source || product.productAssetss[0]?.source || null
        );
      }

      return null;
    },
    [productAssets]
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    (product: ProductSearchResult) => {
      onProductSelect?.(product);
      setSearchText("");
      setIsOpen(false);
      searchInputRef.current?.blur();
    },
    [onProductSelect]
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update isOpen based on search results
  useEffect(() => {
    if (debouncedSearchText.trim().length > 0 && searchResults.length > 0) {
      setIsOpen(true);
    } else if (debouncedSearchText.trim().length === 0) {
      setIsOpen(false);
    }
  }, [debouncedSearchText, searchResults]);

  const showDropdown =
    isOpen && searchResults.length > 0 && debouncedSearchText.trim().length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (
              debouncedSearchText.trim().length > 0 &&
              searchResults.length > 0
            ) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-10", showDropdown && "rounded-b-none border-b-0")}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-0 bg-white dark:bg-gray-950 border border-t-0 rounded-b-lg shadow-lg max-h-[400px] overflow-y-auto"
        >
          {searchResults.map(product => {
            const productImage = getProductImage(product);
            const productName =
              product.productShortDescription ||
              product.productName ||
              product.brandProductId ||
              "Unknown Product";
            const productId = product.brandProductId || product.id || "";

            return (
              <div
                key={product.id || product.productId}
                onClick={() => handleProductSelect(product)}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
              >
                {/* Product Image */}
                <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {productImage ? (
                    <ImageWithFallback
                      src={productImage}
                      alt={productName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                      <span className="text-white font-semibold text-sm">
                        {productName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {productId}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {productName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
