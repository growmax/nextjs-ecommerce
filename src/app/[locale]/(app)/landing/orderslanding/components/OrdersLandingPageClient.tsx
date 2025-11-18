"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const [refreshTrigger] = useState(0);
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === "collapsed";

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
    <div className="w-full overflow-x-hidden">
      <div
        className={cn(
          "mt-[10px] mb-[15px]",
          isSidebarCollapsed ? "px-[45px]" : "px-[0px]"
        )}
      >
        <DashboardToolbar
          title="Orders"
          primary={{
            condition: true,
            value: "Export",
            handleClick: handleExport,
            startIcon: <Download />,
          }}
        />
      </div>

      <div className="pb-[20px]">
        <OrdersLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
        />
      </div>

      <Toaster richColors />
    </div>
  );
}
