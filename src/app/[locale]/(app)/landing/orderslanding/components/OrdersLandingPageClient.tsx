"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { LandingLayout, PageLayout } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import OrdersLandingTable from "./OrdersLandingTable/OrdersLandingTable";

export default function OrdersLandingPageClient() {
  const t = useTranslations("orders");

  const [refreshTrigger] = useState(0);

  const [exportCallback, setExportCallback] = useState<(() => void) | null>(
    null
  );

  const handleExport = useCallback(async () => {
    if (exportCallback) {
      exportCallback();
    } else {
      toast.error(t("exportNotReady"));
    }
  }, [exportCallback, t]);

  return (
    <LandingLayout>
      <PageLayout>
        <DashboardToolbar
          title={t("title")}
          primary={{
            condition: true,
            value: t("export"),
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
