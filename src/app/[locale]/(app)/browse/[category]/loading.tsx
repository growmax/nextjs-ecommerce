import { ProductGridSkeleton } from "@/components/ProductList/ProductGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for product listing page
 * Displays skeleton loaders matching the ProductListClient layout
 */
export default function ProductListLoading() {
  return (
    <div className="mx-auto py-2 w-full px-4">
      <div className="flex flex-col gap-6 lg:flex-row border rounded-lg p-2">
        {/* Desktop Sidebar Skeleton - Hidden on mobile */}
        <aside className="hidden w-64 lg:block">
          <div className="sticky top-4 space-y-6">
            {/* Filter Section Skeleton */}
            <div className="space-y-4">
              {/* Categories */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={`category-${i}`} className="h-8 w-full" />
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={`brand-${i}`} className="h-6 w-full" />
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-20" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={`color-${i}`} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Controls Bar Skeleton */}
          <div className="mb-2 space-y-4">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button Skeleton */}
                <Skeleton className="h-10 w-10 lg:hidden" />
                
                {/* Product Count Skeleton */}
                <Skeleton className="h-4 w-24" />
              </div>

              {/* View Toggle Skeleton - Desktop */}
              <div className="hidden sm:flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            {/* Bottom Row - Search Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              
              {/* View Toggle Skeleton - Mobile */}
              <div className="sm:hidden flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <ProductGridSkeleton viewMode="grid" count={12} />

          {/* Pagination Skeleton */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
