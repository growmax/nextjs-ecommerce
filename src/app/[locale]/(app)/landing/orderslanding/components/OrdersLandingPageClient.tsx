"use client";

import OrdersLandingTable from "@/app/[locale]/(app)/landing/orderslanding/components/OrdersLandingTable/OrdersLandingTable";
import { LandingLayout, PageLayout } from "@/components";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersLandingPageClient() {
  const { prefetch } = useRoutePrefetch();
  const t = useTranslations("orders");

  useEffect(() => {
    prefetch("/landing/quoteslanding");
    prefetch("/settings/profile");
    prefetch("/settings/company");
    prefetch("/dashboard");
  }, [prefetch]);
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
