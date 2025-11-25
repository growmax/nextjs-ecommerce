"use client";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import dynamic from "next/dynamic";

const OrdersLandingPageClient = dynamic(
  () => import("./components/OrdersLandingPageClient"),
  {
    ssr: false,
  }
);

export default function OrdersLandingPage() {
  usePageScroll();
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls

  return <OrdersLandingPageClient />;
}
