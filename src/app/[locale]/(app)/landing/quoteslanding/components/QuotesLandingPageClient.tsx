"use client";

import QuotesLandingTable from "@/app/[locale]/(app)/landing/quoteslanding/components/QuotesLandingTable/QuotesLandingTable";
import { LandingLayout, PageLayout } from "@/components";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function QuotesLandingPageClient() {
  const { prefetch } = useRoutePrefetch();
  const t = useTranslations("quotes");

  useEffect(() => {
    prefetch("/landing/orderslanding");
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
        <QuotesLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
        />
      </PageLayout>

      <Toaster richColors />
    </LandingLayout>
  );
}
