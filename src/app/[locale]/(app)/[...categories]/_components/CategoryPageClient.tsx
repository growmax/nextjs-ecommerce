"use client";

import { CategoryBreadcrumb } from "@/components/Breadcrumb/CategoryBreadcrumb";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ProductGrid } from "@/components/ProductGrid/ProductGrid";
import { StructuredData } from "@/components/seo/StructuredData";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SearchService, { ElasticSearchQuery, FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import {
  BreadcrumbItem,
  CategoryPath,
} from "@/lib/services/CategoryResolutionService";
import { buildCategoryQuery } from "@/utils/opensearch/browse-queries";
import { Package } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

interface CategoryPageClientProps {
  categoryPath: CategoryPath;
  initialProducts: {
    products: FormattedProduct[];
    total: number;
  };
  initialFilters: {
    page: number;
    sort: number;
  };
  breadcrumbs: BreadcrumbItem[];
  locale: string;
}

/**
 * Category Page Client Component
 * Handles client-side interactivity, URL updates, and product fetching
 */
export default function CategoryPageClient({
  categoryPath,
  initialProducts,
  initialFilters,
  breadcrumbs,
  locale: _locale,
}: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State
  const [products, setProducts] = useState(initialProducts.products);
  const [total, setTotal] = useState(initialProducts.total);
  const [isClientFetching, setIsClientFetching] = useState(false);

  // Parse current filters from URL
  const currentFilters = useMemo(() => ({
    page: parseInt(searchParams.get("page") || String(initialFilters.page), 10),
    sort: parseInt(searchParams.get("sort") || String(initialFilters.sort), 10),
  }), [searchParams, initialFilters.page, initialFilters.sort]);

  /**
   * Update URL without page reload
   */
  const updateURL = useCallback(
    (newFilters: Partial<typeof currentFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove parameters
      Object.entries({ ...currentFilters, ...newFilters }).forEach(
        ([key, value]) => {
          if (key === "page" && value === 1) {
            params.delete("page"); // Remove page=1 for cleaner URLs
          } else if (key === "page" && value > 1) {
            params.set(key, String(value));
          } else if (key === "sort" && value === 1) {
            params.delete("sort"); // Remove sort=1 (default) for cleaner URLs
          } else if (key === "sort" && value !== 1) {
            params.set(key, String(value));
          }
        }
      );

      // Build new URL
      const newURL = params.toString()
        ? `${pathname}?${params}`
        : pathname;

      // Update URL without reload
      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, searchParams, router, currentFilters]
  );

  /**
   * Fetch products client-side
   */
  const fetchProducts = useCallback(
    async (filters: typeof currentFilters) => {
      setIsClientFetching(true);

      try {
        // Get tenant code from environment or context
        const tenantCode =
          process.env.NEXT_PUBLIC_TENANT_CODE || "";
        const elasticIndex = tenantCode ? `${tenantCode}pgandproducts` : "";

        if (!elasticIndex) {
          console.error("Elastic index not available");
          setIsClientFetching(false);
          return;
        }

        const categoryIds = categoryPath.ids.categoryIds;
        if (!categoryIds || categoryIds.length === 0) {
          console.error("No category IDs available");
          setIsClientFetching(false);
          return;
        }

        const queryResult = buildCategoryQuery(categoryIds, {
          page: filters.page,
          pageSize: 20,
          sortBy: { sortBy: filters.sort },
        });

        // Build query object ensuring sort is properly typed
        const searchQuery: ElasticSearchQuery = {
          query: queryResult.query.query,
          size: queryResult.query.size,
          from: queryResult.query.from,
          _source: queryResult.query._source,
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
        setIsClientFetching(false);
      }
    },
    [categoryPath.ids.categoryIds]
  );

  /**
   * Fetch products when URL changes
   */
  useEffect(() => {
    // Only fetch if filters changed (not on initial mount)
    if (
      currentFilters.page !== initialFilters.page ||
      currentFilters.sort !== initialFilters.sort
    ) {
      fetchProducts(currentFilters);
    }
  }, [currentFilters, fetchProducts, initialFilters.page, initialFilters.sort]); // Re-fetch when URL changes

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    updateURL({ page });
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sort: number) => {
    updateURL({ sort, page: 1 }); // Reset to page 1 when sorting changes
  };

  const isLoading = isPending || isClientFetching;
  const lastNode = categoryPath.nodes[categoryPath.nodes.length - 1];
  const totalPages = Math.ceil(total / 20);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lastNode?.name || "Category",
    description: `Browse ${categoryPath.fullPath.toLowerCase()} products`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: typeof window !== "undefined" ? window.location.origin + crumb.href : crumb.href,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data for SEO */}
      <StructuredData data={structuredData} />

      {/* Breadcrumbs */}
      <CategoryBreadcrumb breadcrumbs={breadcrumbs} />

      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {lastNode?.name || "Category"}
        </h1>
        {categoryPath.nodes.length > 1 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categoryPath.fullPath}
          </p>
        )}
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              Showing {((currentFilters.page - 1) * 20) + 1} -{" "}
              {Math.min(currentFilters.page * 20, total)} of {total} products
            </>
          )}
        </div>

        <SortDropdown
          value={currentFilters.sort}
          onChange={handleSortChange}
          disabled={isLoading}
        />
      </div>

      {/* Product Grid */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center rounded-lg">
            <div className="text-sm text-gray-600">Loading products...</div>
          </div>
        )}

        {products.length === 0 && !isLoading ? (
          <div className="py-12">
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  No products found{lastNode?.name ? ` in ${lastNode.name}` : ""}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                  Try adjusting your filters or browse other categories.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <CategoryPagination
            currentPage={currentFilters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}

