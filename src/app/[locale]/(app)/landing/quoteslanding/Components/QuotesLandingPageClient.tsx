"use client";

import { useState, useCallback } from "react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { toast } from "sonner";
import QuotesLandingTable from "../Components/QuotesLandingTable/QuotesLandingTable";

export default function QuotesLandingPageClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [exportCallback, setExportCallback] = useState<(() => void) | null>(
    null
  );

  const handleExport = useCallback(async () => {
    if (exportCallback) {
      exportCallback();
    } else {
      toast.error("Export function not ready yet");
    }
  }, [exportCallback]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Data has been refreshed successfully!");
  }, []);

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
      <QuotesLandingTable
        refreshTrigger={refreshTrigger}
        setExportCallback={setExportCallback}
      />

      <Toaster richColors />
    </>
  );
}
