import CompanyBranchTable from "./CompanyBranchTable";
import CompanyDetail from "./CompanyDetail";

const ComanyPageClient = () => {
  return (
    <div className="p-6 md:p-8 flex flex-col items-stretch gap-6">
      <div className="w-full">
        <CompanyDetail />
      </div>
      <div className="w-full">
        <CompanyBranchTable />
      </div>
    </div>
  );
};

export default ComanyPageClient;
