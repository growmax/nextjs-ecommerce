/* eslint-disable @typescript-eslint/no-explicit-any */
import SectionCard from "@/components/custom/SectionCard";
import CompanyService from "@/lib/api/services/CompanyService";
import { useEffect, useState } from "react";
import TableComponent from "./TableComponent";

const CompanyBranchTable = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [deletingAddressId, setDeletingAddressId] = useState<
    string | number | null
  >(null);

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
        // @ts-expect-error - response may have different structures
        setBranches(
          response?.branchResponse ?? response?.data ?? response ?? []
        );
      } catch (_error) {
        // Error handled silently
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleEdit = (_branch: any) => {
    // TODO: implement edit functionality
  };

  const handleDelete = (id: string | number, _name?: string) => {
    setDeletingAddressId(id);
    // TODO: implement delete functionality
  };

  return (
    <>
      <SectionCard title="Company Branches">
        <TableComponent
          branches={branches}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingAddressId={deletingAddressId}
        />
      </SectionCard>
    </>
  );
};

export default CompanyBranchTable;
