"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import CompanyBranchTable from "@/app/[locale]/(app)/settings/company/components/CompanyBranchTable";
import CompanyDetail from "@/app/[locale]/(app)/settings/company/components/CompanyDetail";

const ComanyPageClient = () => {
  const { prefetch } = useRoutePrefetch();
  const t = useTranslations("companySettings");

  useEffect(() => {
    prefetch("/settings/profile");
  }, [prefetch]);

  return (
    <>
      <div id="profile-header" className="h-[24px] md:h-[32px]">
        <HeaderBar title={t("companySettings")} />
      </div>
      <div className="p-6 md:p-8 flex flex-col items-stretch gap-6">
        <div className="w-full">
          <CompanyDetail />
        </div>
        <div className="w-full">
          <CompanyBranchTable />
        </div>
      </div>
    </>
  );
};

export default ComanyPageClient;
