"use client";

import { useState, useRef } from "react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const exportCallbackRef = useRef<(() => void) | null>(null);

  const handleExport = () => {
    if (exportCallbackRef.current) {
      exportCallbackRef.current();
    } else {
      toast.error("Export functionality is not ready. Please try again.");
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Data has been refreshed successfully!");
  };

  const setExportCallback = (callback: (() => void) | null) => {
    exportCallbackRef.current = callback;
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
      <OrdersLandingTable
        refreshTrigger={refreshTrigger}
        setExportCallback={setExportCallback}
      />

      <Toaster richColors />
    </>
  );
}
