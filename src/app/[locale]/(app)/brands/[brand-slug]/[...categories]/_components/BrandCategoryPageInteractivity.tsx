"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useCallback, useMemo } from "react";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ViewToggle } from "@/components/ProductList/ViewToggle";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilters } from "@/components/CategoryFilters/CategoryFilters";
import { CategoryFiltersDrawer } from "@/components/CategoryFilters/CategoryFiltersDrawer";
import type { CategoryPath } from "@/lib/services/CategoryResolutionService";
import type { FilterAggregations } from "@/types/category-filters";
import { formatAllAggregations } from "@/utils/format-aggregations";

interface BrandCategoryPageInteractivityProps {
  initialFilters: {
    page: number;
    sort: number;
  };
  total: number;
  aggregations?: FilterAggregations | null;
  brandName: string;
  locale: string;
  currentCategoryPath: string[];
  categoryPath?: CategoryPath | null;
  children?: React.ReactNode;
}

/**
 * BrandCategoryPageInteractivity Component
 * Client component that handles interactivity:
 * - Pagination controls
 * - Sort dropdown
 * - Filters (excluding brand filter)
 * - URL updates
 * 
 * Does NOT render products (products are server-rendered for SEO)
 */
export function BrandCategoryPageInteractivity({
  initialFilters,
  total,
  aggregations = null,
  brandName,
  locale,
  currentCategoryPath,
  categoryPath = null,
  children,
}: BrandCategoryPageInteractivityProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Format aggregations for filter components
  // Use empty CategoryPath if categoryPath is null (for brand landing page)
  const categoryPathForFormatting: CategoryPath = categoryPath || {
    nodes: [],
    ids: { categoryIds: [] },
    slugs: [],
    fullPath: "",
  };

  const formattedFilters = useMemo(
    () =>
      formatAllAggregations(
        aggregations,
        categoryPathForFormatting,
        currentCategoryPath,
        locale
      ),
    [aggregations, categoryPathForFormatting, currentCategoryPath, locale]
  );

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
          isLoading={!aggregations}
          hideBrandFilter={true}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Filter Drawer */}
        <div className="lg:hidden mb-4">
          <CategoryFiltersDrawer
            brands={formattedFilters.brands}
            childCategories={formattedFilters.childCategories}
            siblingCategories={formattedFilters.siblingCategories}
            currentCategoryPath={currentCategoryPath}
            variantAttributeGroups={formattedFilters.variantAttributeGroups}
            productSpecificationGroups={formattedFilters.productSpecificationGroups}
            isLoading={!aggregations}
            hideBrandFilter={true}
          />
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

          <div className="flex items-center gap-3">
            <ViewToggle />
            <SortDropdown
              value={currentFilters.sort}
              onChange={handleSortChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Product Grid - Passed as children if provided */}
        {children}

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
    </div>
  );
}

