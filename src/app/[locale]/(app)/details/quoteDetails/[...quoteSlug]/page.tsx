import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import { Suspense } from "react";
import QuoteDetailsClient from "./components/QuoteDetailsClient";

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteSlug: string[] }>;
}) {
  return (
    <Suspense fallback={<PageLoader message="Loading Quote Details..." />}>
      <QuoteDetailsClient params={params} />
    </Suspense>
  );
}
