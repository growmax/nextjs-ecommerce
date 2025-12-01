"use client";

import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import ComanyPageClient
const CompanyPageClient = dynamic(
  () => import("./ComanyPageClient/ComanyPageClient"),
  {
    ssr: false,
  }
);

export default function CompanySettingsPage() {
  useRouteRequestTracking();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-6">
          <div className="space-y-4">
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
            <div className="h-96 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      }
    >
      <CompanyPageClient />
    </Suspense>
  );
}
