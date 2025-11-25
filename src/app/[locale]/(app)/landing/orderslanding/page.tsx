"use client";
import { usePageScroll } from "@/hooks/usePageScroll/usePageScroll";
import dynamic from "next/dynamic";

const OrdersLandingPageClient = dynamic(
  () => import("./components/OrdersLandingPageClient"),
  {
    ssr: false,
  }
);

export default function OrdersLandingPage() {
  usePageScroll();

  return <OrdersLandingPageClient />;
}
