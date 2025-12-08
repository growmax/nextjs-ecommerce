"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for All Categories page
 * Mirrors the exact UI structure of the real categories page
 */
export function CategoriesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header Section */}
      <div className="mb-6">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`category-skeleton-${index}`}
            className="flex flex-col items-center p-4 rounded-lg border border-border"
          >
            {/* Category Image/Icon */}
            <Skeleton className="w-full aspect-square mb-3 rounded-md" />
            
            {/* Category Name */}
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
