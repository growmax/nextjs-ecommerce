"use client";
import { usePageScroll } from "@/hooks/usePageScroll/usePageScroll";
import dynamic from "next/dynamic";

const QuotesLandingPageClient = dynamic(
  () => import("./components/QuotesLandingPageClient"),
  {
    ssr: false,
  }
);

export default function QuotesLandingPage() {
  usePageScroll();

  return <QuotesLandingPageClient />;
}
