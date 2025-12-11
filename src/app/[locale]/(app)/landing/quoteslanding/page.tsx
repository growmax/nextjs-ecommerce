"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import QuotesLandingPageClient from "./Components/QuotesLandingPageClient";

export default function QuotesLandingPage() {
  usePageScroll();
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return (
    <div>
         <QuotesLandingPageClient />
    </div>
 
  );
}
