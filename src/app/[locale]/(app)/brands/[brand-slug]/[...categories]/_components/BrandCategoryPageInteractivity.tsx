"use client";

import { CategoryFilters } from "@/components/CategoryFilters/CategoryFilters";
import { CategoryFiltersDrawer } from "@/components/CategoryFilters/CategoryFiltersDrawer";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ViewToggle } from "@/components/ProductList/ViewToggle";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductLoadingProvider } from "@/contexts/ProductLoadingContext";
import type { CategoryPath } from "@/lib/services/CategoryResolutionService";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type { FilterAggregations } from "@/types/category-filters";
import { formatAllAggregations } from "@/utils/format-aggregations";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useTransition } from "react";

interface BrandCategoryPageInteractivityProps {
  initialFilters: {
    page: number;
    sort: number;
  };
  total: number;
  aggregations?: FilterAggregations | null;
  brandName: string;
  currentCategoryPath: string[];
  categoryPath?: CategoryPath | null;
  displayName?: string;
  children?: React.ReactNode;
}

/**
 * BrandCategoryPageInteractivity Component
 * Client component that handles interactivity:
 * - Pagination controls
 * - Sort dropdown
 * - Filters (including brand filter for uniformity)
 * - URL updates
 *
 * Does NOT render products (products are server-rendered for SEO)
 */
export function BrandCategoryPageInteractivity({
  initialFilters,
  total,
  aggregations = null,
  brandName: _brandName,
  currentCategoryPath,
  categoryPath = null,
  displayName = "Brand",
  children,
}: BrandCategoryPageInteractivityProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useBlockingLoader();

  // Show/hide blocking loader when transition state changes
  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Loading products..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  // Format aggregations for filter components
  const formattedFilters = useMemo(() => {
    // Use empty CategoryPath if categoryPath is null (for brand landing page)
    const categoryPathForFormatting: CategoryPath = categoryPath || {
      nodes: [],
      ids: { categoryIds: [] },
      slugs: [],
      fullPath: "",
    };

    return formatAllAggregations(
      aggregations,
      categoryPathForFormatting,
      currentCategoryPath
    );
  }, [aggregations, categoryPath, currentCategoryPath]);

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
      {/* Header + Controls Bar - All on One Line */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 break-words">
            {displayName}
          </h1>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-l pl-2 sm:pl-3">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  Showing {(currentFilters.page - 1) * 20 + 1} -{" "}
                  {Math.min(currentFilters.page * 20, total)} of {total}{" "}
                  products
                </span>
                <span className="sm:hidden">{total} products</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <ViewToggle />
          <SortDropdown
            value={currentFilters.sort}
            onChange={handleSortChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Main Layout - Filters and Products Side by Side */}
      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <CategoryFilters
            brands={formattedFilters.brands}
            childCategories={formattedFilters.childCategories}
            siblingCategories={formattedFilters.siblingCategories}
            currentCategoryPath={currentCategoryPath}
            variantAttributeGroups={formattedFilters.variantAttributeGroups}
            productSpecificationGroups={
              formattedFilters.productSpecificationGroups
            }
            catalogCodes={formattedFilters.catalogCodes}
            equipmentCodes={formattedFilters.equipmentCodes}
            isLoading={!aggregations}
          />
        </aside>

        {/* Main Content */}
        <main id="page-main" className="flex-1 min-w-0 relative">
          {/* Mobile Filter Drawer */}
          <div className="lg:hidden mb-4">
            <CategoryFiltersDrawer
              brands={formattedFilters.brands}
              childCategories={formattedFilters.childCategories}
              siblingCategories={formattedFilters.siblingCategories}
              currentCategoryPath={currentCategoryPath}
              variantAttributeGroups={formattedFilters.variantAttributeGroups}
              productSpecificationGroups={
                formattedFilters.productSpecificationGroups
              }
              catalogCodes={formattedFilters.catalogCodes}
              equipmentCodes={formattedFilters.equipmentCodes}
              isLoading={!aggregations}
            />
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
