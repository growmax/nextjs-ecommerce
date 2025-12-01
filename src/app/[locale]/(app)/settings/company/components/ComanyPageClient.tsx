"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";

import CompanyBranchTable from "@/components/SettingsCompany/CompanyBranchTable/CompanyBranchTable";
import { useTranslations } from "next-intl";
import CompanyDetail from "./CompanyDetail";

const ComanyPageClient = () => {
  const t = useTranslations("companySettings");

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
