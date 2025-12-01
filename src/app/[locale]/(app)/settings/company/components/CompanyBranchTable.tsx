import SectionCard from "@/components/custom/SectionCard";
import { DataTable } from "@/components/Global/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CompanyService from "@/lib/api/services/CompanyService";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import CompanyDialogBox from "./CompanyDialogBox";

// Define the Branch interface for better type safety
interface BranchAddress {
  id: string | number;
  branchName?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pinCodeId?: string;
  country?: string;
  gst?: string;
  primaryContact?: string;
  mobileNo?: string;
  nationalMobileNum?: string;
  phone?: string;
  isBilling?: boolean;
  isShipping?: boolean;
  locality?: string;
  district?: string;
  lattitude?: string;
  longitude?: string;
}

interface Branch {
  id: string | number;
  name?: string;
  addressId?: BranchAddress;
  zoneId?: {
    zoneId?: {
      zoneName?: string;
    };
  };
}

const CompanyBranchTable = () => {
  const t = useTranslations("companySettings");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<
    string | number | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Default page size is 5
  });
  const [totalCount, setTotalCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Calculate offset based on current page
        const offset = pagination.pageIndex;

        const response = await CompanyService.getAllBranchesWithPagination({
          offset,
          limit: pagination.pageSize,
          searchString: searchQuery,
        });
        if (!mounted) return;

        // Extract branches from response based on the actual API structure
        // API returns: { data: { branchResponse: [...], totalCount: 11 }, message: '...', status: '...' }
        const branchData =
          (response as any)?.data?.branchResponse ??
          (response as any)?.branchResponse ??
          (response as any)?.data ??
          response;

        // Extract total count for pagination
        const total =
          (response as any)?.data?.totalCount ??
          (response as any)?.totalCount ??
          0;

        // Ensure we always set an array
        const branchesArray = Array.isArray(branchData) ? branchData : [];
        setBranches(branchesArray);
        setTotalCount(total);
      } catch {
        if (!mounted) return;
        setIsError(true);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }, 150); // 150ms debounce delay

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [pagination.pageIndex, pagination.pageSize, searchQuery]); // Refetch when pagination or search changes

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Transform branch data to form format
  const transformBranchToFormData = (branch: Branch) => {
    return {
      companyName: "",
      branchName: branch.name || branch.addressId?.branchName || "",
      addressLine: branch.addressId?.addressLine || "",
      locality: branch.addressId?.locality || "",
      country: branch.addressId?.country || "",
      state: branch.addressId?.state || "",
      district: branch.addressId?.district || "",
      pinCode: branch.addressId?.pinCodeId || "",
      city: branch.addressId?.city || "",
      latitude: branch.addressId?.lattitude || "",
      longitude: branch.addressId?.longitude || "",
      isBilling: branch.addressId?.isBilling ?? false,
      isShipping: branch.addressId?.isShipping ?? false,
      gst: branch.addressId?.gst || "",
      contactName: branch.addressId?.primaryContact || "",
      contactNumber: branch.addressId?.mobileNo || "",
    };
  };

  const handleEdit = (branch: Branch) => {
    setDialogMode("edit");
    setSelectedBranch(branch);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    setDeletingAddressId(id);

    try {
      await CompanyService.deleteRecordBranchesWithPagination({
        addressId: Number(id),
      });

      // Refresh the branch list after successful deletion
      // Trigger a re-fetch by updating pagination state
      setPagination(prev => ({ ...prev }));
    } catch {
    } finally {
      setDeletingAddressId(null);
    }
  };

  // Define columns using TanStack Table's ColumnDef
  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("branch"),
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
          const branch = row.original;
          return (
            <div className="font-medium text-xs sm:text-sm whitespace-nowrap">
              {branch.name || branch.addressId?.branchName || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: t("address"),
        size: 120,
        minSize: 180,
        cell: ({ row }) => {
          const branch = row.original;
          return (
            <div className="space-y-1 min-w-[180px]">
              <div className="text-xs sm:text-sm">
                {branch.addressId?.addressLine || "-"}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {[
                  branch.addressId?.city,
                  branch.addressId?.state,
                  branch.addressId?.pinCodeId,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {branch.addressId?.country || "-"}
              </div>
              <div className="flex gap-1.5 mt-2">
                {branch.addressId?.isBilling && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium px-2.5 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    {t("billing")}
                  </Badge>
                )}
                {branch.addressId?.isShipping && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-2.5 py-0.5 hover:bg-accent/20"
                  >
                    {t("shipping")}
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "gst",
        header: t("taxIdGst"),
        size: 120,
        minSize: 100,
        cell: ({ row }) => (
          <div className="text-xs sm:text-sm whitespace-nowrap">
            {row.original.addressId?.gst || "-"}
          </div>
        ),
      },
      {
        accessorKey: "primaryContact",
        header: t("contactPerson"),
        size: 120,
        minSize: 100,
        cell: ({ row }) => (
          <div className="text-xs sm:text-sm whitespace-nowrap">
            {row.original.addressId?.primaryContact || "-"}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: t("phone"),
        size: 130,
        minSize: 110,
        cell: ({ row }) => {
          const branch = row.original;
          return (
            <div className="text-xs sm:text-sm whitespace-nowrap">
              {branch.addressId?.mobileNo || "-"}
            </div>
          );
        },
      },
    ],
    [t]
  );

  return (
    <SectionCard
      title={t("companyBranches")}
      className="h-full flex flex-col pb-0"
      contentClassName="p-0 flex-1 overflow-hidden"
      showSeparator={false}
      headerActions={
        <div className="flex items-center gap-2">
          {/* Search Input - real-time search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchBranches")}
              className="pl-9 h-9 w-[200px] sm:w-[250px]"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {/* Add Button */}
          <Button
            size="sm"
            className="h-9"
            onClick={() => {
              setDialogMode("create");
              setSelectedBranch(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addBranch")}
          </Button>
        </div>
      }
    >
      <DataTable
        data={branches}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          isError ? t("failedToLoadBranches") : t("noBranchesFound")
        }
        enableActions
        renderRowActions={row => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={
              deletingAddressId ===
              (row.original.addressId?.id || row.original.id)
            }
            onClick={() =>
              handleDelete(row.original.addressId?.id || row.original.id)
            }
          >
            {deletingAddressId ===
            (row.original.addressId?.id || row.original.id) ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{t("deleteBranch")}</span>
          </Button>
        )}
        enableSorting
        enableColumnVisibility={false}
        showPagination
        pageSizeOptions={[5, 10, 20, 30]}
        // Server-side pagination props
        manualPagination={true}
        totalCount={totalCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={row => String(row.id)}
        onRowClick={row => handleEdit(row.original)}
        className="h-full w-full"
        tableClassName="w-full min-w-[800px] md:table-auto md:min-w-0"
      />

      {/* Add/Edit Branch Dialog */}
      <CompanyDialogBox
        open={isDialogOpen}
        onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedBranch(null);
            setDialogMode("create");
          }
        }}
        mode={dialogMode}
        initialData={
          selectedBranch ? transformBranchToFormData(selectedBranch) : null
        }
        branchId={selectedBranch?.addressId?.id || selectedBranch?.id || null}
        onSuccess={() => {
          // Refresh the branch list after successful create/update
          setPagination(prev => ({ ...prev }));
        }}
      />
    </SectionCard>
  );
};

export default CompanyBranchTable;
