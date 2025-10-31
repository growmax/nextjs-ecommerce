"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const QuotesLandingPageClient = dynamic(
  () => import("./Components/QuotesLandingPageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Quotes..." />,
  }
);

export default function QuotesLandingPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading Quotes..." />}>
      <QuotesLandingPageClient />
    </Suspense>
  );
}
