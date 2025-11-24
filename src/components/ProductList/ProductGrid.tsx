"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useProductStore } from "@/store/useProductStore";
import { ProductCard } from "./ProductCard";

/**
 * ProductGrid Component
 * Displays filtered products in grid or list layout
 * Adapts to sidebar state: 3 cols (open) / 4 cols (closed)
 */
export function ProductGrid() {
  const { filteredProducts, viewMode, currentPage, itemsPerPage } = useProductStore();
  const { open: sidebarOpen } = useSidebar();

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  if (filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center rounded-lg">
        <p className="text-lg text-muted-foreground">
          No products found matching your filters.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  // Dynamic grid columns based on sidebar state
  const gridCols = viewMode === "grid"
    ? sidebarOpen
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" // Sidebar open: 3 cols on xl
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Sidebar closed: 4 cols on xl
    : "grid-cols-1";

  return (
    <div
      className={`grid gap-2 md:gap-6 lg:gap-8 rounded-lg p-2 ${gridCols}`}
    >
      {paginatedProducts.map(product => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
