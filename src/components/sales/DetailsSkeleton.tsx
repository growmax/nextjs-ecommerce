"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface DetailsSkeletonProps {
  showStatusTracker?: boolean;
  showHeader?: boolean;
  leftWidth?: string;
  rightWidth?: string;
}

export default function DetailsSkeleton({
  showStatusTracker = true,
  showHeader = false,
  leftWidth = "lg:w-[65%]",
  rightWidth = "lg:w-[33%]",
}: DetailsSkeletonProps) {
  return (
    <>
      {showHeader && (
        <div className="w-full h-[73px] bg-white border-b flex items-center px-6">
          <Skeleton className="h-8 w-48" />
        </div>
      )}
      {/* Order Details Content - Scrollable area */}
      <div className="flex-1 w-full">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
            {/* Left Side - Status Tracker and Products Table - 60% */}
            <div
              className={`w-full ${leftWidth} space-y-2 sm:space-y-3 ${
                showStatusTracker ? "" : "mt-[60px]"
              }`}
            >
              {/* Cancellation Card Skeleton - Only shown conditionally in actual UI */}
              {/* Removed from default skeleton to match actual UI structure */}

              {/* Status Tracker Skeleton - Matches OrderStatusTracker Card structure */}
              {showStatusTracker && (
                <div className="mt-[55px]">
                  <Card className="p-3 sm:p-4">
                    {/* Top section: Order ID/Date on left, Financial Summary on right */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      {/* Left: Order ID and Date */}
                      <div className="flex-shrink-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      {/* Right: Financial Summary (TOTAL, PAID, TO PAY, LAST DATE) */}
                      <div className="flex flex-wrap gap-2 sm:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex flex-col min-w-[70px]">
                            <Skeleton className="h-3 w-12 mb-1" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Status buttons row */}
                    <div className="flex items-center gap-0 overflow-hidden rounded-lg">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className={`h-7 sm:h-8 flex-1 ${
                            i === 0 ? "rounded-l-lg" : ""
                          } ${i === 6 ? "rounded-r-lg" : ""}`}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Products Table Skeleton */}
              <Card className="shadow-sm">
                <div className="px-6 py-2 bg-gray-50 rounded-t-lg">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-0">
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact Details and Terms Cards Skeleton - Side by Side */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 ${
                  showStatusTracker ? "" : "mt-4"
                }`}
              >
                {/* Contact Details Card Skeleton */}
                <Card className="shadow-sm">
                  <div className="px-6 py-2 bg-gray-50 rounded-t-lg">
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="px-6 pt-2 space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </Card>

                {/* Terms Card Skeleton */}
                <Card className="shadow-sm">
                  <div className="px-6 py-2 bg-gray-50 rounded-t-lg">
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="px-6 pt-2 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Side - Price Details - 40% */}
            <div
              className={`w-full ${rightWidth} ${
                showStatusTracker ? "mt-[55px]" : "mt-[60px]"
              }`}
            >
              <Card className="shadow-sm">
                <div className="px-4 py-2 bg-green-100 rounded-t-lg">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Icons Skeleton */}
      <div className="fixed right-0 top-[118px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </>
  );
}
