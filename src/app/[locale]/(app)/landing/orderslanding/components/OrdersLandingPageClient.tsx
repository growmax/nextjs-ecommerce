"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useTenantData } from "@/hooks/useTenantData";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const { tenantData } = useTenantData();
  const { isAuthenticated, user } = useUserDetails();
  console.log(tenantData, user, isAuthenticated);
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
