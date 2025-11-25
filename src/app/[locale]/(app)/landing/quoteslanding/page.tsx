"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import dynamic from "next/dynamic";

const QuotesLandingPageClient = dynamic(
  () => import("./Components/QuotesLandingPageClient"),
  {
    ssr: false,
  }
);

export default function QuotesLandingPage() {
  usePageScroll();
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return <QuotesLandingPageClient />;
}
