/* eslint-disable @typescript-eslint/no-explicit-any */
import SectionCard from "@/components/custom/SectionCard";
import CompanyService from "@/lib/api/services/CompanyService";
import { useEffect, useState } from "react";

interface TableComponentProps {
  data: any[];
  loading?: boolean;
  onDelete?: (id: string | number) => void;
  // Add other props as needed
}

// Simple Table Component inline
const TableComponent: React.FC<TableComponentProps> = ({ data, loading, onDelete }) => {
  if (loading) {
    return <div className="animate-pulse">Loading branches...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Branch Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((branch: any, index: number) => (
            <tr key={branch.id || index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {branch.name || branch.branchName || `Branch ${index + 1}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {branch.address || branch.fullAddress || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {onDelete && (
                  <button
                    onClick={() => onDelete(branch.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No branches found.
        </div>
      )}
    </div>
  );
};

const CompanyBranchTable = () => {
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await CompanyService.getAllBranchesWithPagination({
          offset: 0,
          limit: 10,
          searchString: "",
        });
        if (!mounted) return;
        setBranches(
          (response as any)?.branchResponse ?? response?.data ?? response ?? []
        );
      } catch (_error) {
        // Error handled silently
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = (_id: string | number, _name?: string) => {
    // TODO: implement delete functionality
  };

  return (
    <>
      <SectionCard title="Company Branches">
        <TableComponent
          data={branches}
          onDelete={handleDelete}
        />
      </SectionCard>
    </>
  );
};

export default CompanyBranchTable;
