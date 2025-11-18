"use client";

import OrderDetailsSkeleton from "./components/OrderDetailsSkeleton";
import { usePageScroll } from "@/hooks/usePageScroll";
import type { OrderDetailsPageProps } from "@/types/details/orderdetails/index.types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component with loading state
const OrderDetailsClient = dynamic(
  () => import("./components/OrderDetailsClient"),
  {
    ssr: false,
    loading: () => <OrderDetailsSkeleton />,
  }
);

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  usePageScroll();

  return (
    <Suspense fallback={<OrderDetailsSkeleton />}>
      <OrderDetailsClient params={params} />
    </Suspense>
  );
}
