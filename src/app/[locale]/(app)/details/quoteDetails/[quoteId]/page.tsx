"use client";

import { usePageScroll } from "@/hooks/usePageScroll";
import { Suspense } from "react";
import QuoteDetailsClient from "./components/QuoteDetailsClient";

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  usePageScroll();

  return (
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
      <QuoteDetailsClient params={params} />
    </Suspense>
  );
}
