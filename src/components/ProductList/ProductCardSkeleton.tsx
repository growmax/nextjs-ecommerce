"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  viewMode?: "grid" | "list" | "table";
}

/**
 * ProductCardSkeleton Component
 * Loading skeleton for ProductCard that matches the exact structure of real product cards
 * Mirrors ProductGridServer (grid) and ProductListView (list) layouts
 */
export function ProductCardSkeleton({ viewMode = "grid" }: ProductCardSkeletonProps) {
  const isGrid = viewMode === "grid";

  if (isGrid) {
    // Grid View Skeleton - matches ProductGridServer structure
    return (
      <div className="group transition-shadow hover:shadow-lg overflow-hidden h-full flex flex-col min-h-[380px] border rounded-lg">
        <div className="p-0 flex flex-col h-full">
          {/* Product Image Skeleton */}
          <div className="relative w-full bg-white flex items-center justify-center min-h-[220px] max-h-[320px] rounded-t-lg overflow-hidden">
            <Skeleton className="absolute inset-0 h-full w-full" />
          </div>

          {/* Product Info Skeleton */}
          <div className="flex-1 p-2 md:p-5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Title - 2 lines */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Price */}
              <Skeleton className="h-6 w-24" />

              {/* Brand */}
              <Skeleton className="h-[14px] w-32" />
              
              {/* SKU */}
              <Skeleton className="h-[14px] w-28" />
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="pt-5 mt-auto">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View Skeleton - matches ProductListView structure
  return (
    <div className="group transition-shadow hover:shadow-lg overflow-hidden border rounded-lg flex flex-col md:flex-row min-h-[220px]">
      <div className="p-0 flex flex-col md:flex-row w-full">
        {/* Product Image Skeleton */}
        <div className="relative w-full md:w-2/5 bg-white flex items-center justify-center min-h-[200px] max-h-[260px] md:min-w-[180px] md:max-w-[280px] shrink-0 md:py-6 md:pl-6 rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden">
          <Skeleton className="absolute inset-0 h-full w-full md:h-[calc(100%-48px)] md:top-6 md:rounded-md" />
        </div>

        {/* Product Info Skeleton */}
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Title - 2 lines */}
            <div className="space-y-2">
              <Skeleton className="h-[18px] w-full" />
              <Skeleton className="h-[18px] w-3/4" />
            </div>

            {/* Price */}
            <Skeleton className="h-6 w-24" />

            {/* Brand and SKU */}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-[14px] w-32" />
              <Skeleton className="h-[14px] w-28" />
            </div>
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="pt-5 mt-auto md:w-1/2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
