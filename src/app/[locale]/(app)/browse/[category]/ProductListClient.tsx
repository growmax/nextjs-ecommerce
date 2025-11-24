"use client";

import {
  FilterSection,
  MobileFilterSheet,
  ProductGrid,
  ProductGridSkeleton,
  SearchBar,
  ViewToggle,
} from "@/components/ProductList";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryProducts } from "@/hooks/ProductList/useProductListAPI";
import { useProductStore } from "@/store/useProductStore";
import { useEffect } from "react";

interface ProductListClientProps {
  initialCategory?: string;
}

/**
 * ProductListClient Component
 * Main client component for product listing page
 * Fetches products by category and manages display state
 */
export default function ProductListClient({
  initialCategory = "all",
}: ProductListClientProps) {
  const {
    setProducts,
    filteredProducts,
    setSelectedCategory,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    viewMode,
  } = useProductStore();
  const { open: sidebarOpen } = useSidebar();

  // Fetch products for the current category
  const {
    products: categoryProducts,
    isLoading,
    error: loadError,
  } = useCategoryProducts({
    categorySlug: initialCategory,
  });

  // Load products into store when data arrives
  useEffect(() => {
    if (categoryProducts.length > 0) {
      setProducts(categoryProducts);
    }
  }, [categoryProducts, setProducts]);

  // Set initial category
  useEffect(() => {
    if (initialCategory && initialCategory !== "category") {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory("all");
    }
  }, [initialCategory, setSelectedCategory]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  return (
    <div
      className={`mx-auto py-2 ${sidebarOpen ? "w-full px-4" : "w-full px-4"}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row border rounded-lg p-2">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden w-64 lg:block">
          <div className="sticky top-4">
            <FilterSection />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Controls Bar */}
          <div className="mb-2 space-y-4">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <MobileFilterSheet />

                {/* Product Count */}
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* View Toggle - Desktop */}
              <div className="hidden sm:block">
                <ViewToggle />
              </div>
            </div>

            {/* Bottom Row - Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <SearchBar />
              </div>

              {/* View Toggle - Mobile */}
              <div className="sm:hidden shrink-0">
                <ViewToggle />
              </div>
            </div>
          </div>

          {/* Error State */}
          {loadError ? (
            <div className="w-full px-4 py-16 border rounded-lg bg-red-50/50">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-red-600">
                  Failed to load products
                </p>
                <p className="text-sm text-muted-foreground">{loadError}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              {isLoading ? (
                <ProductGridSkeleton viewMode={viewMode} count={12} />
              ) : (
                <ProductGrid />
              )}

              {/* Pagination */}
              {filteredProducts.length > itemsPerPage && (
                <div className="mt-8 flex justify-center">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredProducts.length / itemsPerPage
                    )}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
