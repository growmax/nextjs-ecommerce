"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import dynamic from "next/dynamic";

const QuotesLandingPageClient = dynamic(
  () => import("./Components/QuotesLandingPageClient"),
  {
    ssr: false,
  }
);

export default function QuotesLandingPage() {
  usePageScroll();

  return <QuotesLandingPageClient />;
}
