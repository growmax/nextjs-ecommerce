"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { toast } from "sonner";
import QuotesLandingTable from "../Components/QuotesLandingTable/QuotesLandingTable";

export default function QuotesLandingPageClient() {
  const handleExport = () => {
    toast.success("Export has been completed successfully!");
  };

  const handleRefresh = () => {
    toast.success("Data has been refreshed successfully!");
  };

  return (
    <>
      <DashboardToolbar
        title="Quotes"
        secondary={{
          condition: true,
          value: "Export",
          handleClick: handleExport,
          startIcon: <Download className="h-4 w-4" />,
        }}
        refresh={{
          condition: true,
          handleRefresh,
        }}
      />
      <QuotesLandingTable />

      <Toaster richColors />
    </>
  );
}
