"use client";

import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Brand } from "@/lib/services/BrandResolutionService";
import {
  CategoryPath,
  BreadcrumbItem,
} from "@/lib/services/CategoryResolutionService";
import {
  buildBrandQuery,
  buildCategoryBrandQuery,
} from "@/utils/opensearch/browse-queries";
import SearchService, {
  ElasticSearchQuery,
} from "@/lib/api/services/SearchService/SearchService";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductGrid } from "@/components/ProductGrid/ProductGrid";
import { CategoryBreadcrumb } from "@/components/Breadcrumb/CategoryBreadcrumb";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { StructuredData } from "@/components/seo/StructuredData";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface BrandCategoryPageClientProps {
  brand: Brand;
  categoryPath: CategoryPath | null;
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
 * Brand Category Page Client Component
 * Handles client-side interactivity for brand + category pages
 */
export default function BrandCategoryPageClient({
  brand,
  categoryPath,
  initialProducts,
  initialFilters,
  breadcrumbs,
  locale,
}: BrandCategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State
  const [products, setProducts] = useState(initialProducts.products);
  const [total, setTotal] = useState(initialProducts.total);
  const [isClientFetching, setIsClientFetching] = useState(false);

  // Parse current filters from URL
  const currentFilters = useMemo(
    () => ({
      page: parseInt(
        searchParams.get("page") || String(initialFilters.page),
        10
      ),
      sort: parseInt(
        searchParams.get("sort") || String(initialFilters.sort),
        10
      ),
    }),
    [searchParams, initialFilters.page, initialFilters.sort]
  );

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
            params.delete("page");
          } else if (key === "page" && value > 1) {
            params.set(key, String(value));
          } else if (key === "sort" && value === 1) {
            params.delete("sort");
          } else if (key === "sort" && value !== 1) {
            params.set(key, String(value));
          }
        }
      );

      // Build new URL
      const newURL = params.toString() ? `${pathname}?${params}` : pathname;

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
        const tenantCode = process.env.NEXT_PUBLIC_TENANT_CODE || "";
        const elasticIndex = tenantCode ? `${tenantCode}pgandproducts` : "";

        if (!elasticIndex) {
          console.error("Elastic index not available");
          setIsClientFetching(false);
          return;
        }

        let queryResult;

        if (categoryPath && categoryPath.ids.categoryIds.length > 0) {
          // Build query with both brand and category filters
          queryResult = buildCategoryBrandQuery(
            categoryPath.ids.categoryIds,
            brand.name,
            {
              page: filters.page,
              pageSize: 20,
              sortBy: { sortBy: filters.sort },
            }
          );
        } else {
          // Build brand-only query
          queryResult = buildBrandQuery(brand.name, {
            page: filters.page,
            pageSize: 20,
            sortBy: { sortBy: filters.sort },
          });
        }

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
    [brand.name, categoryPath]
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sort: number) => {
    updateURL({ sort, page: 1 });
  };

  const isLoading = isPending || isClientFetching;
  const categoryName =
    categoryPath && categoryPath.nodes.length > 0
      ? categoryPath.nodes[categoryPath.nodes.length - 1]?.name || null
      : null;
  const totalPages = Math.ceil(total / 20);

  // Build category URL for "View all brands" link
  const categoryUrl = categoryPath
    ? `/${locale}/${categoryPath.slugs.join("/")}`
    : null;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: categoryName
      ? `Shop ${brand.name} ${categoryName} products`
      : `Shop ${brand.name} products`,
    ...(brand.logoUrl && { logo: brand.logoUrl }),
    ...(brand.website && { url: brand.website }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item:
          typeof window !== "undefined"
            ? window.location.origin + crumb.href
            : crumb.href,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data for SEO */}
      <StructuredData data={structuredData} />

      {/* Breadcrumbs */}
      <CategoryBreadcrumb breadcrumbs={breadcrumbs} />

      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          {brand.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-12 w-auto object-contain"
            />
          )}
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {brand.name}
            {categoryName && ` ${categoryName}`}
          </h1>
        </div>
        {categoryPath && categoryPath.nodes.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categoryPath.fullPath}
          </p>
        )}
        {categoryUrl && (
          <Link
            href={categoryUrl}
            prefetch={true}
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View all brands in this category →
          </Link>
        )}
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              Showing {(currentFilters.page - 1) * 20 + 1} -{" "}
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
                  No {brand.name} products found
                  {categoryName ? ` in ${categoryName}` : ""}
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
