"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";

// Lazy load heavy components to reduce initial bundle size
const DashboardChart = dynamic(
  () =>
    import("./DashboardChart/DashboardChart").then(mod => mod.DashboardChart),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const DashboardOrdersTable = dynamic(
  () => import("./DashboardOrdersTable/DashboardOrdersTable"),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export default function DashboardPageClient() {
  const { prefetch } = useRoutePrefetch();

  useEffect(() => {
    prefetch("/landing/orderslanding");
    prefetch("/landing/quoteslanding");
    prefetch("/settings/profile");
    prefetch("/settings/company");
    prefetch("/cart");
  }, [prefetch]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="w-full">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <DashboardChart />
            </Suspense>
          </div>
          <div className="w-full">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <DashboardOrdersTable />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
