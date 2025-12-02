"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductTableSkeletonProps {
  count?: number;
}

/**
 * ProductTableSkeleton Component
 * Loading skeleton for ProductTableView that matches the exact structure
 * Shows table skeleton on desktop, stacked cards on mobile
 * Mirrors ProductTableView layout exactly
 */
export function ProductTableSkeleton({ count = 12 }: ProductTableSkeletonProps) {
  return (
    <>
      {/* Desktop Table View Skeleton - matches ProductTableView structure */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                Product
              </th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                Brand
              </th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                SKU
              </th>
              <th className="text-right p-3 font-medium text-sm text-muted-foreground">
                Price
              </th>
              <th className="text-center p-3 font-medium text-sm text-muted-foreground">
                Stock
              </th>
              <th className="text-center p-3 font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                {/* Product column with image and title */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-16 h-16 shrink-0 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full max-w-xs" />
                      <Skeleton className="h-4 w-3/4 max-w-xs" />
                    </div>
                  </div>
                </td>
                {/* Brand column */}
                <td className="p-3">
                  <Skeleton className="h-[14px] w-24" />
                </td>
                {/* SKU column */}
                <td className="p-3">
                  <Skeleton className="h-[14px] w-20" />
                </td>
                {/* Price column */}
                <td className="p-3">
                  <div className="flex justify-end">
                    <Skeleton className="h-6 w-20" />
                  </div>
                </td>
                {/* Stock column */}
                <td className="p-3">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                </td>
                {/* Actions column */}
                <td className="p-3">
                  <div className="flex justify-center">
                    <div className="inline-block">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View Skeleton - matches ProductTableView mobile structure */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            {/* Image and title section */}
            <div className="flex gap-3">
              <Skeleton className="w-20 h-20 shrink-0 rounded" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-1 space-y-1">
                  <Skeleton className="h-[14px] w-24" />
                  <Skeleton className="h-[14px] w-20" />
                </div>
              </div>
            </div>
            {/* Price and action section */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-1">
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
