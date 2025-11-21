"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { useEffect } from "react";
import CompanyBranchTable from "./CompanyBranchTable";
import CompanyDetail from "./CompanyDetail";

const ComanyPageClient = () => {
  const { prefetch } = useRoutePrefetch();

  useEffect(() => {
    prefetch("/settings/profile");
  }, [prefetch]);

  return (
    <>
      <div id="profile-header" className="h-[24px] md:h-[32px]">
        <HeaderBar title="Company Settings" />
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
