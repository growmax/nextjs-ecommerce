"use client";

import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import SearchService, { ElasticSearchQuery } from "@/lib/api/services/SearchService/SearchService";
import {
  buildBrandQuery,
  buildCategoryQuery,
  buildMajorCategoryQuery,
  buildProductGroupQuery,
  buildSubCategoryQuery
} from "@/utils/opensearch/browse-queries";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PaginationControl from "../category/components/PaginationControl";
import ProductCard from "../category/components/ProductCard";

interface Product {
  productId: number;
  id: string;
  brandProductId?: string;
  productShortDescription?: string;
  productAssetss?: Array<{ source: string; isDefault?: boolean }>;
  brandsName?: string;
  b2CUnitListPrice?: number;
  b2CDiscountPrice?: number;
  productIndexName?: string;
  [key: string]: unknown;
}

interface ProductListPageClientProps {
  searchParams: {
    category?: string;
    subcategory?: string;
    majorcategory?: string;
    brand?: string;
    pg?: string;
    page?: string;
    sort?: string;
    [key: string]: string | undefined;
  };
}

export function ProductListPageClient({
  searchParams,
}: ProductListPageClientProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.page || "1", 10)
  );
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<{
    sortBy: number;
    sortByField?: string;
  }>({
    sortBy: parseInt(searchParams.sort || "1", 10),
  });

  // Get tenant context (you may need to adjust this based on your auth setup)
  const getElasticIndex = useCallback(() => {
    // This should come from your tenant context
    // For now, using a placeholder - you'll need to get this from your auth/tenant context
    const tenantCode = urlSearchParams.get("tenant") || "";
    return tenantCode ? `${tenantCode}pgandproducts` : "";
  }, [urlSearchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const elasticIndex = getElasticIndex();
      if (!elasticIndex) {
        console.error("Elastic index not available");
        setLoading(false);
        return;
      }

      let queryResult;

      // Determine which query builder to use based on search params
      if (searchParams.category) {
        const categoryId = parseInt(searchParams.category, 10);
        if (!isNaN(categoryId)) {
          queryResult = buildCategoryQuery([categoryId], {
            page: currentPage,
            pageSize: itemsPerPage,
            sortBy,
          });
        }
      } else if (searchParams.subcategory) {
        const subCategoryId = parseInt(searchParams.subcategory, 10);
        if (!isNaN(subCategoryId)) {
          queryResult = buildSubCategoryQuery(subCategoryId, {
            page: currentPage,
            pageSize: itemsPerPage,
            sortBy,
          });
        }
      } else if (searchParams.majorcategory) {
        const majorCategoryId = parseInt(searchParams.majorcategory, 10);
        if (!isNaN(majorCategoryId)) {
          queryResult = buildMajorCategoryQuery(majorCategoryId, {
            page: currentPage,
            pageSize: itemsPerPage,
            sortBy,
          });
        }
      } else if (searchParams.brand) {
        queryResult = buildBrandQuery(searchParams.brand, {
          page: currentPage,
          pageSize: itemsPerPage,
          sortBy,
        });
      } else if (searchParams.pg) {
        const productGroupId = parseInt(searchParams.pg, 10);
        if (!isNaN(productGroupId)) {
          queryResult = buildProductGroupQuery(productGroupId, {
            page: currentPage,
            pageSize: itemsPerPage,
            sortBy,
          });
        }
      } else {
        // Default: show all published products
        // Build a base query without category filter
        queryResult = {
          query: {
            from: (currentPage - 1) * itemsPerPage,
            size: itemsPerPage,
            _source: [] as readonly string[],
            query: {
              bool: {
                must: [
                  {
                    term: {
                      is_published: 1,
                    },
                  },
                ],
                must_not: [
                  {
                    match: {
                      pg_index_name: {
                        query: "PrdGrp0*",
                      },
                    },
                  },
                  {
                    term: {
                      internal: true,
                    },
                  },
                ],
              },
            },
            ...(sortBy.sortBy === 2 && {
              sort: [{ unitListPrice: { order: "asc" } }],
            }),
            ...(sortBy.sortBy === 3 && {
              sort: [{ unitListPrice: { order: "desc" } }],
            }),
          },
        };
      }

      if (!queryResult) {
        setLoading(false);
        return;
      }

      // Build query object ensuring sort is properly typed
      // BrowseQueryResult format - has nested query.query.bool
      const boolQuery = queryResult.query.query.bool;
      const searchQuery: ElasticSearchQuery = {
        query: {
          bool: {
            must: boolQuery.must || [],
            ...(boolQuery.should && { should: boolQuery.should }),
            ...(boolQuery.must_not && { filter: boolQuery.must_not }),
          },
        },
        size: queryResult.query.size,
        from: queryResult.query.from,
        ...("_source" in queryResult.query && queryResult.query._source && { _source: queryResult.query._source }),
        ...(queryResult.query.sort && { sort: queryResult.query.sort }),
      };

      const result = await SearchService.searchProducts({
        elasticIndex,
        query: searchQuery,
      });

      setProducts(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    searchParams,
    currentPage,
    itemsPerPage,
    sortBy,
    getElasticIndex,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: number) => {
    setSortBy({ sortBy: newSortBy });
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("sort", newSortBy.toString());
    router.push(`/products?${params.toString()}`);
  };

  if (loading) {
    return <PageLoader message="Loading products..." />;
  }

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Products
        </h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Sort By:
          </label>
          <select
            value={sortBy.sortBy}
            onChange={e => handleSortChange(parseInt(e.target.value, 10))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium"
          >
            <option value={1}>Relevance</option>
            <option value={2}>Price: Low to High</option>
            <option value={3}>Price: High to Low</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} products
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {products.map(product => (
              <ProductCard
                key={product.productId || product.id}
                id={product.productIndexName || product.id}
                title={product.productShortDescription || "Product"}
                img={
                  product.productAssetss?.[0]?.source ||
                  "/placeholder-product.jpg"
                }
                price={product.b2CDiscountPrice || product.b2CUnitListPrice || 0}
                inStock={true}
                onAddToCart={(id: string) => {
                  console.log("Add to cart:", id);
                }}
              />
            ))}
          </div>

          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
    </div>
  );
}

