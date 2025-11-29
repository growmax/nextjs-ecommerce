"use client";

import { PageLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

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
        <PageLayout variant="content">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
            {/* Left Side - Status Tracker and Products Table - 60% */}
            <div className={`w-full ${leftWidth} space-y-2 sm:space-y-3`}>
              {/* Cancellation Card Skeleton */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  {/* Right Section */}
                  <div className="flex flex-col gap-1 sm:text-right">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </div>

              {/* Status Tracker Skeleton */}
              {showStatusTracker && (
                <div className="mt-4">
                  <Skeleton className="h-48 w-full" />
                </div>
              )}

              {/* Products Table Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </div>

              {/* Contact Details and Terms Cards Skeleton - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 details-card-gap details-section-margin">
                {/* Contact Details Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-3">
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
                </div>

                {/* Terms Card Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Price Details - 40% */}
            <div className={`w-full ${rightWidth} mt-4`}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>

      {/* Right Sidebar Icons Skeleton */}
      <div className="fixed right-0 top-[127px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </>
  );
}
