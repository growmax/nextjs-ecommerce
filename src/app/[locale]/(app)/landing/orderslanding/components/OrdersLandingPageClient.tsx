"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { LandingLayout, PageLayout } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const t = useTranslations("orders");
  const isMobile = useIsMobile();

  const [refreshTrigger] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [exportCallback, setExportCallback] = useState<(() => void) | null>(
    null
  );

  const handleExport = useCallback(async () => {
    if (exportCallback && !loading) {
      exportCallback();
    } else if (loading) {
      toast.error(t("pleaseWait") || "Please wait for data to load");
    } else {
      toast.error(t("exportNotReady"));
    }
  }, [exportCallback, loading, t]);

  return (
    <LandingLayout>
      {!isMobile && (
        <PageLayout>
          <DashboardToolbar
            title={
              totalCount !== null
                ? `${t("title")} (${totalCount.toLocaleString()})`
                : t("title")
            }
            primary={{
              condition: true,
              value: t("export"),
              handleClick: handleExport,
              startIcon: <Download />,
              disabled: loading,
            }}
          />
        </PageLayout>
      )}

      <PageLayout variant="content">
        <OrdersLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
          onTotalCountChange={setTotalCount}
          onLoadingChange={setLoading}
        />
      </PageLayout>
    </LandingLayout>
  );
}
