"use client";

import { Input } from "@/components/ui/input";
import { useTenantInfo } from "@/contexts/TenantContext";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { serchquery } from "@/utils/elasticsearch/search-queries";
// Use individual lodash imports for better tree-shaking
import debounce from "lodash/debounce";
import { ImageIcon, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Product {
  productId: number;
  id: string;
  brandProductId?: string;
  productName?: string;
  productShortDescription?: string;
  shortDescription?: string;
  brandsName?: string;
  brandName?: string;
  productAssetss?: Array<{ source: string; isDefault?: boolean }>;
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
  const { user } = useCurrentUser();

  // Get Elasticsearch index from tenant info or use default
  const elasticIndex = "schwingstetterpgandproducts";

  // Debounced search function
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const search = debounce(async () => {
      try {
        setIsLoading(true);
        const context = {
          tenantCode: tenantInfo?.tenantCode || "",
          userId: user?.userId || 0,
          companyId: user?.companyId || 0,
        };

        // Use serchquery to build the Elasticsearch query
        const elasticQuery = serchquery(searchQuery.trim());

        // Limit results to 10
        elasticQuery.size = 10;

        const result = await SearchService.searchProducts({
          elasticIndex,
          query: elasticQuery,
          context,
        });

        setProducts(result.data as Product[]);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    search();

    return () => {
      search.cancel();
    };
  }, [searchQuery, tenantInfo, user, elasticIndex]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(query.length > 0);
  };

  const handleAddProduct = (product: Product) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setProducts([]);
    if (handleCallback) {
      handleCallback(product);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.productAssetss && product.productAssetss.length > 0) {
      const defaultImage = product.productAssetss.find(
        asset => asset.isDefault
      );
      return defaultImage?.source || product.productAssetss[0]?.source;
    }
    return product.image;
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
        className="h-10 w-full pr-10 text-sm"
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
                    const productImage = getProductImage(product);
                    const productName =
                      product.brandProductId ||
                      product.productName ||
                      "Unknown Product";
                    const productDescription =
                      product.productShortDescription ||
                      product.shortDescription ||
                      "";

                    return (
                      <div
                        key={product.productId || product.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                        onClick={() => handleAddProduct(product)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            {productImage ? (
                              <Image
                                src={productImage}
                                alt={productName}
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {productName}
                          </div>
                          {productDescription && (
                            <div className="text-xs text-gray-500 truncate">
                              {productDescription}
                            </div>
                          )}
                          {product.brandsName && (
                            <div className="text-xs text-gray-400">
                              Brand: {product.brandsName}
                            </div>
                          )}
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
