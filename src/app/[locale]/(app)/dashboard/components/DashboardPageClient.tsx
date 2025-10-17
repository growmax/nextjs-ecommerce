"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components to reduce initial bundle size
const DashboardChart = dynamic(
  () =>
    import("./DashboardChart/DashboardChart").then(
      mod => mod.DashboardChart
    ),
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
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="w-full">
            <DashboardChart />
          </div>
          <div className="w-full">
            <DashboardOrdersTable />
          </div>
        </div>
      </main>
    </div>
  );
}
