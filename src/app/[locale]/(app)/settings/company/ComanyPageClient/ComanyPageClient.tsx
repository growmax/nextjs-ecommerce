import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import CompanyBranchTable from "../../../../../../components/SettingsCompany/CompanyBranchTable/CompanyBranchTable";
import CompanyDetail from "../../../../../../components/SettingsCompany/CompanyDetail/CompanyDetail";

const ComanyPageClient = () => {
  return (
    <>
      <div id="profile-header" className="h-[24px] md:h-[32px]">
        <HeaderBar title="Company Settings" />
      </div>
      <div className="p-12 md:p-18 flex flex-col items-stretch gap-8">
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
