"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";

const OrdersLandingPageClient = dynamic(
  () => import("./components/OrdersLandingPageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Orders..." />,
  }
);

export default OrdersLandingPageClient;
