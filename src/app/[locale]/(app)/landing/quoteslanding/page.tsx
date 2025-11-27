"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import { Suspense } from "react";
import QuotesLandingPageClient from "./Components/QuotesLandingPageClient";

export default function QuotesLandingPage() {
  usePageScroll();
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="p-6 space-y-4">
            <div className="h-12 w-64 bg-muted animate-pulse rounded" />
            <div className="h-96 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      }
    >
      <QuotesLandingPageClient />
    </Suspense>
  );
}
