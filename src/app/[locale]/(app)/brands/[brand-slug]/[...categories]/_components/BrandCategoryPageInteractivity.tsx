"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useCallback, useMemo } from "react";
import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandCategoryPageInteractivityProps {
  initialFilters: {
    page: number;
    sort: number;
  };
  total: number;
}

/**
 * BrandCategoryPageInteractivity Component
 * Client component that ONLY handles interactivity:
 * - Pagination controls
 * - Sort dropdown
 * - URL updates
 * 
 * Does NOT render products (products are server-rendered for SEO)
 */
export function BrandCategoryPageInteractivity({
  initialFilters,
  total,
}: BrandCategoryPageInteractivityProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
    </>
  );
}

