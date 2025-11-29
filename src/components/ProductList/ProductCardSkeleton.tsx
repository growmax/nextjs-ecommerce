"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  viewMode?: "grid" | "list" | "table";
}

/**
 * ProductCardSkeleton Component
 * Loading skeleton for ProductCard in both grid and list views
 */
export function ProductCardSkeleton({ viewMode = "grid" }: ProductCardSkeletonProps) {
  const isGrid = viewMode === "grid";

  return (
    <Card
      className={`overflow-hidden ${
        isGrid ? "h-full flex flex-col min-h-[380px]" : "flex flex-col md:flex-row min-h-[220px]"
      }`}
    >
      <CardContent
        className={`p-0 flex ${
          isGrid ? "flex-col h-full" : "flex-col md:flex-row w-full md:pl-6"
        }`}
      >
        {/* Product Image Skeleton */}
        <div
          className={`relative ${
            isGrid
              ? "w-full aspect-[16/10]"
              : "w-full md:w-2/5 aspect-[16/10] md:aspect-auto md:min-w-[180px] md:max-w-[280px] shrink-0 md:py-6"
          }`}
        >
          <Skeleton
            className={`absolute inset-0 ${
              isGrid ? "h-full w-full" : "h-full w-full md:h-[calc(100%-48px)] md:top-6 md:rounded-md"
            }`}
          />
        </div>

        {/* Product Info Skeleton */}
        <div className="flex-1 p-2 md:p-5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Price */}
            <Skeleton className="h-6 w-24" />

            {/* Brand */}
            <Skeleton className="h-4 w-32" />
            
            {/* SKU */}
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="pt-5 mt-auto">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
