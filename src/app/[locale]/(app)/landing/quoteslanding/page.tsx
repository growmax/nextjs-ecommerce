"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";

const QuotesLandingPageClient = dynamic(
  () => import("./Components/QuotesLandingPageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Quotes..." />,
  }
);

export default QuotesLandingPageClient;
