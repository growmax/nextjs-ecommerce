"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const handleExport = () => {
    // Handle export functionality here
    toast.success("Export has been completed successfully!");
  };

  const handleRefresh = () => {
    // Handle refresh functionality here
    toast.success("Data has been refreshed successfully!");
  };

  return (
    <>
      <DashboardToolbar
        title="Orders"
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
      <OrdersLandingTable />

      <Toaster richColors />
    </>
  );
}
