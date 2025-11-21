"use client";

import { ApplicationLayout, PageLayout } from "@/components/layout";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailsSkeletonProps {
  showStatusTracker?: boolean;
  leftWidth?: string;
  rightWidth?: string;
  showHeader?: boolean;
}

export default function DetailsSkeleton({
  showStatusTracker = true,
  leftWidth = "lg:w-[65%]",
  rightWidth = "lg:w-[33%]",
  showHeader = false,
}: DetailsSkeletonProps) {
  const { state, isMobile } = useSidebar();
  const leftOffset = isMobile
    ? "0px"
    : state === "expanded"
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)";

  const content = (
    <>
      {/* Details Content Skeleton - Scrollable area */}
      <div className="flex-1 w-full">
        <PageLayout variant="content">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
            {/* Left Side - Status Tracker and Products Table */}
            <div className={`w-full ${leftWidth} space-y-2 sm:space-y-3`}>
              {/* Summary Section Skeleton */}
              {showStatusTracker && (
                <div className="mt-[80px] space-y-4">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              )}

              {/* Status Tracker Skeleton */}
              {showStatusTracker && (
                <div className="mt-4">
                  <Skeleton className="h-48 w-full" />
                </div>
              )}

              {/* Products Table Skeleton */}
              <div
                className={
                  showStatusTracker ? "space-y-2" : "mt-[80px] space-y-2"
                }
              >
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>

              {/* Contact Details and Terms Cards Skeleton - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Contact Details Card Skeleton */}
                <div className="border rounded-lg p-4 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  {/* Seller Information Section */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="pt-2 border-t">
                      {/* Bill To Section */}
                      <Skeleton className="h-5 w-20 mb-2" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      {/* Ship To Section */}
                      <Skeleton className="h-5 w-20 mb-2" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Card Skeleton */}
                <div className="border rounded-lg p-4 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Price Details */}
            <div className={`w-full ${rightWidth} mt-[80px]`}>
              <div className="border rounded-lg p-4 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>

      {/* Right Sidebar Icons Skeleton */}
      <div className="fixed right-0 top-[127px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
        <Skeleton className="h-8 w-8" />
      </div>
    </>
  );

  if (showHeader) {
    return (
      <ApplicationLayout>
        {/* Sales Header Skeleton - Fixed at top */}
        <div className="flex-shrink-0 sticky top-0 z-50 bg-gray-50">
          <div
            className="fixed top-14 left-0 right-0 z-40 flex items-center justify-between gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-3.5 bg-white border-b shadow-sm transition-all duration-200 min-h-[56px] md:min-h-[64px]"
            style={{ left: leftOffset }}
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
        {content}
      </ApplicationLayout>
    );
  }

  return content;
}
