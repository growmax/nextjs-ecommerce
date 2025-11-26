"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import { Suspense } from "react";
import DashboardPageClient from "./components/DashboardPageClient";

export default function DashboardPage() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start p-6">
              <div className="w-full space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="w-full space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        }
      >
        <DashboardPageClient />
      </Suspense>
    </ErrorBoundary>
  );
}
