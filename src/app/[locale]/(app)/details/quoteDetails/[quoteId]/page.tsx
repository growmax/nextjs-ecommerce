"use client";

import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component with loading state
const QuoteDetailsClient = dynamic(
  () => import("./components/QuoteDetailsClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Quote Details..." />,
  }
);

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader message="Loading Quote Details..." />}>
      <QuoteDetailsClient params={params} />
    </Suspense>
  );
}
