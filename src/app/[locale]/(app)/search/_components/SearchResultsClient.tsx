"use client";

import { CategoryPagination } from "@/components/Pagination/CategoryPagination";
import { ProductViewSwitcher } from "@/components/ProductGrid/ProductViewSwitcher";
import { ViewToggle } from "@/components/ProductList/ViewToggle";
import { SortDropdown } from "@/components/Sort/SortDropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { Package } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

interface SearchResultsClientProps {
  initialProducts: FormattedProduct[];
  initialTotal: number;
  initialPage: number;
  initialSort: number;
  searchQuery: string;
  locale: string;
}

/**
 * SearchResultsClient Component
 * Pure client component that handles all interactivity:
 * - Pagination controls
 * - Sort dropdown
 * - View toggle
 * - URL updates
 * - Product rendering
 * 
 * This component is mounted AFTER hydration to prevent SSR mismatches
 */
export function SearchResultsClient({
  initialProducts,
  initialTotal,
  initialPage,
  initialSort,
  searchQuery,
  locale,
}: SearchResultsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  // Only render view toggle and product grid after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse current filters from URL
  const currentFilters = useMemo(
    () => ({
      page: parseInt(searchParams.get("page") || String(initialPage), 10),
      sort: parseInt(searchParams.get("sort") || String(initialSort), 10),
    }),
    [searchParams, initialPage, initialSort]
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
  const totalPages = Math.ceil(initialTotal / 20);

  // Show empty state if no products
  if (initialProducts.length === 0) {
    return (
      <div className="flex-1 min-w-0">
        <div className="py-12">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                No products found
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                No results found for "{searchQuery}". Try adjusting your search
                terms or browse our categories.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Controls Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              {initialTotal > 0 ? (
                <>
                  Showing {((currentFilters.page - 1) * 20) + 1} -{" "}
                  {Math.min(currentFilters.page * 20, initialTotal)} of {initialTotal} results
                  {searchQuery && ` for "${searchQuery}"`}
                </>
              ) : (
                <>No results found{searchQuery && ` for "${searchQuery}"`}</>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Only render view toggle after mount to prevent hydration mismatch */}
          {isMounted ? (
            <ViewToggle />
          ) : (
            <div className="w-24 h-8" /> // Placeholder to prevent layout shift
          )}
          <SortDropdown
            value={currentFilters.sort}
            onChange={handleSortChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Product Grid - Only render after mount to prevent hydration issues */}
      {isMounted ? (
        <ProductViewSwitcher products={initialProducts} locale={locale} />
      ) : (
        // Show skeleton for initial SSR/hydration to match what client will render
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: Math.min(8, initialProducts.length) }).map((_, i) => (
            <div
              key={i}
              className="h-[380px] bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

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
