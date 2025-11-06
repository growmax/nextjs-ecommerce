"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const OrdersLandingPageClient = dynamic(
  () => import("./components/OrdersLandingPageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Orders..." />,
  }
);

export default function OrdersLandingPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading Orders..." />}>
      <OrdersLandingPageClient />
    </Suspense>
  );
}
