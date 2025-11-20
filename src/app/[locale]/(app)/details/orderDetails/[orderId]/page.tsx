"use client";

import { usePageScroll } from "@/hooks/usePageScroll";
import type { OrderDetailsPageProps } from "@/types/details/orderdetails/index.types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import of client component - no loading state to avoid double loader
// The component itself handles loading state for API calls
const OrderDetailsClient = dynamic(
  () => import("./components/OrderDetailsClient"),
  {
    ssr: false,
  }
);

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  usePageScroll();

  return (
    <Suspense fallback={null}>
      <OrderDetailsClient params={params} />
    </Suspense>
  );
}
