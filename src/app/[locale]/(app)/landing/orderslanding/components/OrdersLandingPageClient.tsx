"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { LandingLayout, PageLayout } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const [refreshTrigger] = useState(0);

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

  return (
    <LandingLayout>
      <PageLayout>
        <DashboardToolbar
          title="Orders"
          primary={{
            condition: true,
            value: "Export",
            handleClick: handleExport,
            startIcon: <Download />,
          }}
        />
      </PageLayout>

      <PageLayout variant="content">
        <OrdersLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
        />
      </PageLayout>

      <Toaster richColors />
    </LandingLayout>
  );
}
