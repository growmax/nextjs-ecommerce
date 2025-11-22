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
import { useProductStore } from "@/store/useProductStore";
import { mockProducts } from "@/utils/ProductList/mockData";
import { useEffect, useState } from "react";

interface ProductListClientProps {
  initialCategory?: string;
}

/**
 * ProductListClient Component
 * Main client component composing all product listing pieces
 */
export default function ProductListClient({
  initialCategory,
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
  const [isLoading, setIsLoading] = useState(true);

  // Load products and set initial category on mount
  useEffect(() => {
    // Show loading state when category changes
    setIsLoading(true);
    
    // Simulate async data loading
    const loadData = async () => {
      setProducts(mockProducts);
      if (initialCategory && initialCategory !== "category") {
        setSelectedCategory(initialCategory);
      } else {
        // Default to "all" if no valid category is provided
        setSelectedCategory("all");
      }
      // Small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };
    
    loadData();
  }, [setProducts, initialCategory, setSelectedCategory]);

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
                totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
