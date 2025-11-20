import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import CompanyBranchTable from "../../../../../../components/SettingsCompany/CompanyBranchTable/CompanyBranchTable";
import CompanyDetail from "../../../../../../components/SettingsCompany/CompanyDetail/CompanyDetail";

const ComanyPageClient = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* --- Sticky Header (Non-scrollable) --- */}
      <div
        id="profile-header"
        className="h-[24px] md:h-[32px] sticky top-0 z-50 bg-white"
      >
        <HeaderBar title="Company Settings" />
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex flex-col items-stretch gap-8">
        {/* Add extra spacing in mobile */}
        <div className="w-full mt-4 md:mt-0">
          <CompanyDetail />
        </div>

        <div className="w-full">
          <CompanyBranchTable />
        </div>
      </div>
    </div>
  );
};

export default ComanyPageClient;
