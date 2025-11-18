"use client";

import { DetailsSkeleton } from "@/components/sales";
import { usePageScroll } from "@/hooks/usePageScroll";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component with loading state
const QuoteDetailsClient = dynamic(
  () => import("./components/QuoteDetailsClient"),
  {
    ssr: false,
    loading: () => (
      <DetailsSkeleton showStatusTracker={false} showHeader={true} />
    ),
  }
);

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  usePageScroll();

  return (
    <Suspense
      fallback={<DetailsSkeleton showStatusTracker={false} showHeader={true} />}
    >
      <QuoteDetailsClient params={params} />
    </Suspense>
  );
}
