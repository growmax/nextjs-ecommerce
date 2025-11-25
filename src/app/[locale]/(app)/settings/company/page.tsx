"use client";

import { useRouteRequestTracking } from "@/hooks/useRouteRequestTracking";
import dynamic from "next/dynamic";

// Dynamically import ComanyPageClient
const CompanyPageClient = dynamic(
  () => import("./components/ComanyPageClient"),
  {
    ssr: false, // Disable server-side rendering for this component
  }
);

export default function CompanySettingsPage() {
  useRouteRequestTracking(); // Track route to prevent duplicate RSC calls
  return <CompanyPageClient />;
}
