"use client";

import { usePageScroll } from "@/hooks/usePageScroll";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component - no loading state to avoid double loader
// The component itself handles loading state for API calls
const QuoteDetailsClient = dynamic(
  () => import("./components/QuoteDetailsClient"),
  {
    ssr: false,
  }
);

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  usePageScroll();

  return (
    <Suspense fallback={null}>
      <QuoteDetailsClient params={params} />
    </Suspense>
  );
}
