"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import { Input } from "@/components/ui/input";
import { useTenantInfo } from "@/contexts/TenantContext";
import OpenElasticSearchService from "@/lib/api/services/ElacticQueryService/openElasticSearch/openElasticSearch";
import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Product {
  productId: number;
  id: string;
  brandProductId?: string;
  productName?: string;
  productShortDescription?: string;
  shortDescription?: string;
  brandsName?: string;
  brandName?: string;
  productAssetss?: Array<{ source: string; isDefault?: number | boolean }>;
  productIndexName?: string;
  image?: string;
}

interface AddMoreProductsProps {
  handleCallback?: (product: Product) => void;
  popWidth?: string;
}

function AddMoreProducts({
  handleCallback,
  popWidth = "430px",
}: AddMoreProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tenantInfo = useTenantInfo();
  const debounceRef = useRef<number | null>(null);

  // Get Elasticsearch index from tenant info or use default
  const elasticIndex = tenantInfo?.elasticCode
    ? `${tenantInfo.elasticCode}pgandproducts`
    : "schwingstetterpgandproducts";

  // Debounced search function (matching SearchDialogBox pattern)
  useEffect(() => {
    // clear any pending timeout
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // If query is empty, clear results and don't call API
    const term = (searchQuery || "").trim();
    if (!term || term.length < 2) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce the API call (matching SearchDialogBox timing)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const data = await OpenElasticSearchService.searchProducts(
          term,
          elasticIndex
        );
        setProducts((data.data || []) as unknown as Product[]);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [searchQuery, elasticIndex]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(query.length > 0);
  };

  const handleAddProduct = (product: Product) => {
    console.log(product);
    setSearchQuery("");
    setIsSearchOpen(false);
    setProducts([]);
    if (handleCallback) {
      handleCallback(product);
    }
  };


  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Search and add products..."
        value={searchQuery}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => searchQuery && setIsSearchOpen(true)}
        onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
        className="h-10 w-full pr-10 text-sm sm:text-base"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100"
        aria-label="search"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isSearchOpen && searchQuery && (
        <div
          className="absolute z-[1400] mt-1 rounded-lg bg-white shadow-2xl border"
          style={{
            width: popWidth,
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : products.length > 0 ? (
                  products.map(product => {
                    // Match SearchDialogBox image logic
                    const defaultImage = product.productAssetss?.find(
                      asset => asset.isDefault === 1
                    );
                    const imageUrl =
                      defaultImage?.source || product.productAssetss?.[0]?.source;

                    return (
                      <div
                        key={product.productIndexName || product.productId || product.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                        onClick={() => handleAddProduct(product)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded border">
                          <ImageWithFallback
                            src={imageUrl || "/asset/default-placeholder.png"}
                            alt={product.productShortDescription || "product image"}
                            className="object-cover"
                            width={48}
                            height={48}
                            fallbackSrc="/asset/default-placeholder.png"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                          <span className="truncate font-medium text-sm">
                            {product.productShortDescription || product.productName || "Unknown Product"}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {product.brandsName && (
                              <>
                                <span className="truncate">{product.brandsName}</span>
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
                ) : searchQuery.length < 2 ? (
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

export default AddMoreProducts;
