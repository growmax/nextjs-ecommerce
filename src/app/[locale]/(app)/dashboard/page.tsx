"use client";
import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import dynamic from "next/dynamic";

const DashboardPageClient = dynamic(
  () => import("./components/DashboardPageClient"),
  {
    ssr: false,
    loading: () => <PageLoader message="Loading Dashboard..." />,
  }
);

export default DashboardPageClient;
