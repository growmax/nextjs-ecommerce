import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardPageClient from "./components/DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard | E-Commerce",
  description: "View your sales analytics and recent orders",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoader message="Loading Dashboard..." />}>
      <DashboardPageClient />
    </Suspense>
  );
}
