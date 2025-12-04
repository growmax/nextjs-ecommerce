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
      {/* Desktop Table View Skeleton - matches ProductTableView structure exactly */}
      <div className="hidden md:block w-full overflow-x-auto product-table-wrapper" role="status" aria-label="Loading products">
        <table className="w-full table-fixed border-collapse">
          {/* This colgroup must match ProductTableView exactly — do not remove */}
          <colgroup>
            <col style={{ width: "var(--product-table-col-product, 35%)" }} />
            <col style={{ width: "var(--product-table-col-brand, 13%)" }} />
            <col style={{ width: "var(--product-table-col-sku, 11%)" }} />
            <col style={{ width: "var(--product-table-col-price, 13%)" }} />
            <col style={{ width: "var(--product-table-col-stock, 12%)" }} />
            <col style={{ width: "var(--product-table-col-actions, 16%)" }} />
          </colgroup>
          <thead>
            <tr className="border-b">
              <th scope="col" className="text-left p-3 font-medium text-sm text-foreground">
                Product
              </th>
              <th scope="col" className="text-left p-3 font-medium text-sm text-foreground">
                Brand
              </th>
              <th scope="col" className="text-left p-3 font-medium text-sm text-foreground">
                SKU
              </th>
              <th scope="col" className="text-right p-3 font-medium text-sm text-foreground">
                Price
              </th>
              <th scope="col" className="text-center p-3 font-medium text-sm text-foreground">
                Stock
              </th>
              <th scope="col" className="text-center p-3 font-medium text-sm text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                {/* Product column with image and title - matches ProductTableView */}
                <td className="p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Match aspect-square from ProductTableView - 48px */}
                    <Skeleton className="w-12 h-12 shrink-0 rounded aspect-square" />
                    <div className="min-w-0 flex-1 space-y-2">
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
