"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import { Suspense } from "react";
import CartPageClient from "./components/CartPageClient";

export default function Page() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background p-6">
            <div className="space-y-4">
              <div className="h-12 w-64 bg-muted animate-pulse rounded" />
              <div className="h-96 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        }
      >
        <CartPageClient />
      </Suspense>
    </ErrorBoundary>
  );
}
