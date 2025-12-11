"use client";

import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ViewToggle } from "@/components/ProductList/ViewToggle";
import { ProductListTopBar } from "@/components/ProductListTopBar";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductLoadingProvider } from "@/contexts/ProductLoadingContext";
import { SmartFilterSection } from "@/features/smart-filters/components/SmartFilterSection";
import type { BrandFilterOption as SmartBrandOption, SmartFilterResponse } from "@/features/smart-filters/types/smart-filter-response.types";
import type { CategoryPath } from "@/lib/services/CategoryResolutionService";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type { BrandFilterOption } from "@/types/category-filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useTransition } from "react";

/**
 * Map smart filter brand items to the legacy BrandFilterOption format
 * used by ProductListTopBar and TrendingBrands components
 */
function mapToLegacyBrandOptions(
  brands: SmartBrandOption[],
  locale: string,
  categoryPath: string[]
): BrandFilterOption[] {
  return brands.map((brand) => ({
    label: brand.name,
    value: brand.slug,
    count: brand.count,
    selected: brand.isSelected ?? false,
    brandName: brand.slug,
    // Build navigation path: /locale/brands/brand-slug/category-path
    navigationPath: categoryPath.length > 0
      ? `/${locale}/brands/${brand.slug}/${categoryPath.join("/")}`
      : `/${locale}/brands/${brand.slug}`,
  }));
}

interface CategoryPageInteractivityProps {
  initialFilters: {
    page: number;
    sort: number;
  };
  total: number;
  categoryPath: CategoryPath;
  smartFilters: SmartFilterResponse | null;
  currentCategoryPath: string[];
  categoryName?: string;
  children?: React.ReactNode; // Product grid will be passed as children
  _onProductsUpdate?: (products: unknown[]) => void;
}

/**
 * CategoryPageInteractivity Component
 * Client component that ONLY handles interactivity:
 * - Pagination controls
 * - Sort dropdown
 * - URL updates
 *
 * Does NOT render products (products are server-rendered for SEO)
 */
export function CategoryPageInteractivity({
  initialFilters,
  total,
  categoryPath,
  smartFilters,
  currentCategoryPath,
  categoryName = "Category",
  children,
}: CategoryPageInteractivityProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useBlockingLoader();

  // Extract locale from pathname (first segment)
  const locale = pathname.split("/")[1] || "en";
  
  // Get current category ID (last one in the path)
  const currentCategoryId = categoryPath.ids.categoryIds[categoryPath.ids.categoryIds.length - 1] ?? undefined;

  // Show/hide blocking loader when transition state changes
  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Loading products..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

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

  // Map smart filter brands to legacy format for ProductListTopBar
  const legacyBrands = useMemo(() => {
    if (!smartFilters?.filters.brands.items) return [];
    return mapToLegacyBrandOptions(
      smartFilters.filters.brands.items,
      locale,
      currentCategoryPath
    );
  }, [smartFilters?.filters.brands.items, locale, currentCategoryPath]);

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

      // Update URL without reload - this will trigger server component re-render
      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, searchParams, router, currentFilters]
  );

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

  const isLoading = isPending;
  const totalPages = Math.ceil(total / 20);

  return (
    <>
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {categoryName}
          </h1>
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>
                {total} {total === 1 ? "Result" : "Results"}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Layout - Filters and Products Side by Side */}
      <div className="flex gap-4">
        {/* Filters Sidebar - Desktop and Mobile */}
        {smartFilters && <SmartFilterSection filterData={smartFilters} currentCategoryId={currentCategoryId} />}

        {/* Main Content */}
        <main id="page-main" className="flex-1 min-w-0 relative">
          {/* Trending Brands + Controls Row - Clean Alignment */}
          <div className="h-[49px] flex items-start gap-4">
            {/* Product List Top Bar - Switches between Trending Brands and Active Filters */}
            <div className="flex-1 min-w-0">
              <ProductListTopBar
                brands={legacyBrands}
                selectedBrands={[]}
                onBrandClick={() => {}}
                isBrandPage={false}
              />
            </div>

            {/* View Toggle + Sort - Right Side */}
            <div className="flex items-center gap-2 shrink-0">
              <ViewToggle />
              <SortDropdown
                value={currentFilters.sort}
                onChange={handleSortChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Product Grid - Broadcast loading state via context */}
          <ProductLoadingProvider value={{ isLoading }}>
            {children}
          </ProductLoadingProvider>

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
        </main>
      </div>
    </>
  );
}
