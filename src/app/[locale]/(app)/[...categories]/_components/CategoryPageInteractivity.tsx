"use client";

import { CategoryFilters } from "@/components/CategoryFilters/CategoryFilters";
import { CategoryFiltersDrawer } from "@/components/CategoryFilters/CategoryFiltersDrawer";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ViewToggle } from "@/components/ProductList/ViewToggle";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductLoadingProvider } from "@/contexts/ProductLoadingContext";
import { usePageScopedLoader } from "@/hooks/usePageScopedLoader";
import type { CategoryPath } from "@/lib/services/CategoryResolutionService";
import type { FilterAggregations } from "@/types/category-filters";
import { formatAllAggregations } from "@/utils/format-aggregations";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

interface CategoryPageInteractivityProps {
  initialFilters: {
    page: number;
    sort: number;
  };
  total: number;
  categoryPath: CategoryPath;
  aggregations: FilterAggregations | null;
  currentCategoryPath: string[];
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
  aggregations,
  currentCategoryPath,
  children,
}: CategoryPageInteractivityProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  // Auto-trigger scoped loader on transitions (Phase 1)
  usePageScopedLoader(isPending);

  // Format aggregations for filter components
  const formattedFilters = useMemo(
    () =>
      formatAllAggregations(aggregations, categoryPath, currentCategoryPath, locale),
    [aggregations, categoryPath, currentCategoryPath, locale]
  );

  if (process.env.NODE_ENV === 'development') {
    console.log('[CategoryPageInteractivity] Formatted filters:', {
      brandsCount: formattedFilters.brands.length,
      childCategoriesCount: formattedFilters.childCategories.length,
      siblingCategoriesCount: formattedFilters.siblingCategories.length,
      variantAttributeGroupsCount: formattedFilters.variantAttributeGroups.length,
      productSpecificationGroupsCount: formattedFilters.productSpecificationGroups.length,
      catalogCodesCount: formattedFilters.catalogCodes.length,
      equipmentCodesCount: formattedFilters.equipmentCodes.length,
    });
  }

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
    <div className="flex gap-6">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <CategoryFilters
          brands={formattedFilters.brands}
          childCategories={formattedFilters.childCategories}
          siblingCategories={formattedFilters.siblingCategories}
          currentCategoryPath={currentCategoryPath}
          variantAttributeGroups={formattedFilters.variantAttributeGroups}
          productSpecificationGroups={formattedFilters.productSpecificationGroups}
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
            productSpecificationGroups={formattedFilters.productSpecificationGroups}
            catalogCodes={formattedFilters.catalogCodes}
            equipmentCodes={formattedFilters.equipmentCodes}
            isLoading={!aggregations}
          />
        </div>

        {/* Controls Bar */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  Showing {((currentFilters.page - 1) * 20) + 1} -{" "}
                  {Math.min(currentFilters.page * 20, total)} of {total} products
                </span>
                <span className="sm:hidden">
                  {total} products
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
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
  );
}

