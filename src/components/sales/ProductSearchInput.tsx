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
  productIndexName?: string;
  brandProductId?: string;
  productName?: string;
  productShortDescription?: string;
  brandsName?: string;
  productAssetss?: Array<{ source: string; isDefault?: boolean | number }>;
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
  const { data: _productAssets } = useQuery({
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
          className={cn("pr-10 ")}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute z-[1400] mt-2 ml-8 rounded-lg bg-white shadow-2xl border"
          ref={dropdownRef}
          style={{
            width: "430px",
            height: "410px",
            right: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "scroll",
                marginRight: "-15px",
                marginBottom: "-15px",
              }}
            >
              <ul className="list-none p-2 m-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(product => {
                   
                    // Match SearchDialogBox image logic
                    const defaultImage = product.productAssetss?.find(
                      asset => asset.isDefault
                    );
                    const imageUrl =
                      defaultImage?.source ||
                      product.productAssetss?.[0]?.source;

                    return (
                      <div
                        key={
                          String(product.productIndexName ||
                          product.productId ||
                          product.id)
                        }
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                        onClick={() => handleProductSelect(product)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded border">
                          <ImageWithFallback
                            src={imageUrl || "/asset/default-placeholder.png"}
                            alt={
                              product.productShortDescription || "product image"
                            }
                            className="object-cover"
                            width={48}
                            height={48}
                            fallbackSrc="/asset/default-placeholder.png"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                          <span className="truncate font-medium text-sm">
                            {product.productShortDescription ||
                              product.productName ||
                              "Unknown Product"}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {product.brandsName && (
                              <>
                                <span className="truncate">
                                  {product.brandsName}
                                </span>
                                {product.brandProductId && <span>•</span>}
                              </>
                            )}
                            {product.brandProductId && (
                              <span className="truncate">
                                {product.brandProductId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : searchText.length < 2 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Type at least 2 characters to search
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No products found
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
