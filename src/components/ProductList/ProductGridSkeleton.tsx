"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  viewMode?: "grid" | "list" | "table";
  count?: number;
}

/**
 * ProductGridSkeleton Component
 * Displays skeleton loaders for product grid/list
 * Adapts to sidebar state: 3 cols (open) / 4 cols (closed)
 */
export function ProductGridSkeleton({ 
  viewMode = "grid", 
  count = 12 
}: ProductGridSkeletonProps) {
  const { open: sidebarOpen } = useSidebar();

  // Dynamic grid columns based on sidebar state (matching ProductGrid logic)
  const gridCols = viewMode === "grid"
    ? sidebarOpen
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" // Sidebar open: 3 cols on xl
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Sidebar closed: 4 cols on xl
    : "grid-cols-1";

  return (
    <div
      className={`grid gap-2 md:gap-6 lg:gap-8 rounded-lg p-2 ${gridCols}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
}
