"use client";

import { SectionToolbar } from "@/components/Global/SectionToolbar/SectionToolbar";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
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
    <div className="h-full flex flex-col">
      <SectionToolbar
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
      <div className="flex-1 overflow-hidden">
        <QuotesLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
        />
      </div>

      <Toaster richColors />
    </div>
  );
}
