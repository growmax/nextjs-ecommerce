import CompanyBranchTable from "../../../../../../components/SettingsCompany/CompanyBranchTable/CompanyBranchTable";
import CompanyDetail from "../../../../../../components/SettingsCompany/CompanyDetail/CompanyDetail";

const ComanyPageClient = () => {

  return (
    <div className="flex flex-col h-full">
      {/* --- Scrollable Content --- */}
      <main className="flex-1 px-4 sm:px-4 md:px-8 lg:px-16 pt-4 pb-4 md:pt-6 overflow-x-hidden overflow-y-auto min-h-0">
        <div className="max-w-6xl mx-auto space-y-6 w-full">
          <div className="w-full">
            <CompanyDetail />
          </div>

          <div className="w-full">
            <CompanyBranchTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComanyPageClient;
