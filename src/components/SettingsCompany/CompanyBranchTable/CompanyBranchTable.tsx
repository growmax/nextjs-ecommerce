import SectionCard from "@/components/custom/SectionCard";
import { DataTable } from "@/components/Global/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CompanyService from "@/lib/api/services/CompanyService";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CompanyDialogBox from "../DialogBox/AddressDialogBox";

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<
    string | number | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const offset = pagination.pageIndex;

        const response = await CompanyService.getAllBranchesWithPagination({
          offset,
          limit: pagination.pageSize,
          searchString: searchQuery,
        });

        if (!mounted) return;

        const branchData =
          (response as any)?.data?.branchResponse ??
          (response as any)?.branchResponse ??
          (response as any)?.data ??
          response;

        const total =
          (response as any)?.data?.totalCount ??
          (response as any)?.totalCount ??
          0;

        const branchesArray = Array.isArray(branchData) ? branchData : [];
        setBranches(branchesArray);
        setTotalCount(total);
      } catch {
        if (!mounted) return;
        setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [pagination.pageIndex, pagination.pageSize, searchQuery, reloadTrigger]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const transformBranchToFormData = (branch: Branch) => ({
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
  });

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

      toast.success("Branch deleted successfully");
      reloadTable();
    } catch {
      toast.error("Failed to delete branch. Please try again.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Branch",
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
        header: "Address",
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
                    className="text-xs font-medium px-2.5 py-0.5 bg-primary/10 text-primary"
                  >
                    Billing
                  </Badge>
                )}
                {branch.addressId?.isShipping && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-2.5 py-0.5"
                  >
                    Shipping
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "gst",
        header: "Tax ID / GST",
        cell: ({ row }) => {
          const gst = row.original.addressId?.gst;
          const gstValues = gst ? gst.split(",").map(s => s.trim()) : [];

          return (
            <div className="text-xs sm:text-sm whitespace-nowrap flex flex-wrap gap-1 items-center">
              {gstValues.length > 0
                ? gstValues.map((value, index) => (
                    <React.Fragment key={index}>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {value}
                      </span>
                      {index < gstValues.length - 1 && (
                        <span className="text-muted-foreground / "></span>
                      )}
                    </React.Fragment>
                  ))
                : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "primaryContact",
        header: "Contact Person",
        cell: ({ row }) => (
          <div className="text-xs sm:text-sm whitespace-nowrap">
            {row.original.addressId?.primaryContact || "-"}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-xs sm:text-sm whitespace-nowrap">
            {row.original.addressId?.mobileNo || "-"}
          </div>
        ),
      },
    ],
    []
  );

  const reloadTable = () => {
    setReloadTrigger(prev => !prev);
  };

  return (
    <>
      <SectionCard
        title="Branches"
        className="h-full flex flex-col py-2.5"
        contentClassName="p-0 flex-1 overflow-hidden"
        headerActions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full px-2">
            
            {/* Search */}
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                className="pl-9 h-9 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Add Branch Button */}
            <Button
              size="sm"
              className="h-9 w-full sm:w-auto"
              onClick={() => {
                setDialogMode("create");
                setSelectedBranch(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 " />
              Add Branch
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto w-full max-w-full">
          <DataTable
            data={branches}
            columns={columns}
            isLoading={isLoading}
            emptyMessage={
              isError
                ? "Failed to load branches. Please try again."
                : "No branches found. Add a branch to get started."
            }
            enableActions
            renderRowActions={row => (
              <Tooltip>
 <TooltipTrigger asChild>
 <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={
                  deletingAddressId ===
                  (row.original.addressId?.id || row.original.id)
                }
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(row.original.addressId?.id || row.original.id);
                }}
              >
                {deletingAddressId ===
                (row.original.addressId?.id || row.original.id) ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
 </TooltipTrigger>
 <TooltipContent>
        <p>Delete Branch</p>
      </TooltipContent>
            
              </Tooltip>
            )}
            enableSorting
            enableColumnVisibility={false}
            showPagination
            pageSizeOptions={[5, 10, 20, 30]}
            manualPagination={true}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            getRowId={row => String(row.id)}
            onRowClick={row => handleEdit(row.original)}
            className="h-full w-full"
            tableClassName="min-w-0 md:min-w-[800px]"
          />
        </div>
   
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
            reloadTable();
            toast.success("Branch saved successfully");
          }}
        />
      
    
      </SectionCard>
    </>
  );
};

export default CompanyBranchTable;
