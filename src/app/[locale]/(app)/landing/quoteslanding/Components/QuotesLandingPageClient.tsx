"use client";

import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { LandingLayout, PageLayout } from "@/components/layout";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import QuotesLandingTable from "../Components/QuotesLandingTable/QuotesLandingTable";

export default function QuotesLandingPageClient() {
  const t = useTranslations("quotes");

  const [refreshTrigger] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);

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
          }}
        />
      </PageLayout>

      <PageLayout variant="content">
        <QuotesLandingTable
          refreshTrigger={refreshTrigger}
          setExportCallback={setExportCallback}
          onTotalCountChange={setTotalCount}
        />
      </PageLayout>
    </LandingLayout>
  );
}
