"use client";

import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import {
  DashboardChartSkeleton,
  DashboardOrdersTableSkeleton,
} from "./DashboardSkeletons";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load heavy components to reduce initial bundle size
const DashboardChart = dynamic(
  () =>
    import("./DashboardChart/DashboardChart").then(mod => mod.DashboardChart),
  {
    loading: () => <DashboardChartSkeleton />,
    ssr: false,
  }
);

const DashboardOrdersTable = dynamic(
  () => import("./DashboardOrdersTable/DashboardOrdersTable"),
  {
    loading: () => <DashboardOrdersTableSkeleton />,
    ssr: false,
  }
);

export default function DashboardPageClient() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="w-full">
            <Suspense
              fallback={<DashboardChartSkeleton />}
            >
              <DashboardChart />
            </Suspense>
          </div>
          <div className="w-full">
            <Suspense
              fallback={<DashboardOrdersTableSkeleton />}
            >
              <DashboardOrdersTable />
            </Suspense>
          </div>
        </div>
    </div>
  );
}
