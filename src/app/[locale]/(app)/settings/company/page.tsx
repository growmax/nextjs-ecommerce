"use client";

import dynamic from "next/dynamic";

// Dynamically import ComanyPageClient
const CompanyPageClient = dynamic(
  () => import("./components/ComanyPageClient"),
  {
    ssr: false, // Disable server-side rendering for this component
  }
);

export default function CompanySettingsPage() {
  return <CompanyPageClient />;
}
