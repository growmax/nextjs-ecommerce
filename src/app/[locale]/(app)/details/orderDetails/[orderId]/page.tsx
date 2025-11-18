"use client";

import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import { usePageScroll } from "@/hooks/usePageScroll";
import type { OrderDetailsPageProps } from "@/types/details/orderdetails/index.types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component with loading state
const OrderDetailsClient = dynamic(
  () => import("./components/OrderDetailsClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Order Details..." />,
  }
);

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  usePageScroll();

  return (
    <Suspense fallback={<PageLoader message="Loading Order Details..." />}>
      <OrderDetailsClient params={params} />
    </Suspense>
  );
}
