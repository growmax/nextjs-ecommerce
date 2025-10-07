"use client";

import DashboardTable from "@/components/custom/DashBoardTable";
import { statusColor } from "@/components/custom/statuscolors";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { FilterTabs } from "@/components/custom/FilterTabs";
import SideDrawer from "@/components/custom/sidedrawer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import QuotesService, {
  type QuoteItem,
} from "@/lib/api/services/QuotesService";
import { ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Skeleton Table Component
const SkeletonTable = ({
  columns,
  rows = 10,
}: {
  columns: number;
  rows?: number;
}) => {
  const SkeletonRow = () => (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: columns }).map((_, cellIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <td key={cellIndex} className="px-6 py-6">
          <div className="flex items-center space-x-2">
            <div
              className={`h-4 bg-gray-200 rounded animate-pulse ${
                cellIndex === 0
                  ? "w-24" // Quote Id
                  : cellIndex === 1
                    ? "w-32" // Name
                    : cellIndex === 2
                      ? "w-20" // Quoted Date
                      : cellIndex === 3
                        ? "w-20" // Date
                        : cellIndex === 4
                          ? "w-28" // Account Name
                          : cellIndex === 5
                            ? "w-16" // Total Items
                            : cellIndex === 6
                              ? "w-20" // Subtotal
                              : cellIndex === 7
                                ? "w-24" // Taxable Amount
                                : cellIndex === 8
                                  ? "w-20" // Total
                                  : cellIndex === 9
                                    ? "w-20" // Status
                                    : cellIndex === 10
                                      ? "w-24" // Required Date
                                      : "w-full"
              }`}
            ></div>
            {cellIndex === 9 && ( // Status column with rounded background
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            )}
          </div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="rounded-md border shadow-sm overflow-hidden h-full flex flex-col">
      {/* Skeleton Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <table className="w-full">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <th key={index} className="text-left px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Skeleton Table Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <SkeletonRow key={rowIndex} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Skeleton Pagination */}
      <div className="flex items-center justify-end gap-4 px-4 py-2 border-t bg-gray-50/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

interface QuotesLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
}

function QuotesLandingTable({
  refreshTrigger,
  setExportCallback,
}: QuotesLandingTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20); // Default to first valid option
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedQuoteItems, setSelectedQuoteItems] =
    useState<QuoteItem | null>(null);

  // Define table columns
  const columns = useMemo<ColumnDef<QuoteItem>[]>(
    () => [
      {
        accessorKey: "quotationIdentifier",
        header: () => <div className="text-center">Quote Id</div>,
        size: 150,
        enableResizing: true,
        cell: ({ getValue }) => (
          <div className="flex items-center justify-center h-full font-medium text-blue-600 break-words leading-tight overflow-hidden">
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "quoteName",
        header: () => <div className="text-center">Name</div>,
        size: 200,
        enableResizing: true,
        cell: ({ getValue }) => (
          <div className="flex items-center justify-center h-full break-words leading-tight overflow-hidden">
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "createdDate",
        header: () => <div className="text-center">Quoted Date</div>,
        size: 150,
        enableResizing: true,
        cell: ({ getValue }) => {
          const date = getValue() as string;
          if (!date)
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          try {
            return (
              <div className="flex items-center justify-center h-full break-words leading-tight overflow-hidden">
                {new Date(date).toLocaleDateString()}
              </div>
            );
          } catch {
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          }
        },
      },
      {
        accessorKey: "lastModifiedDate",
        header: () => <div className="text-center">Date</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const date = row.original.lastUpdatedDate;
          if (!date)
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          try {
            return (
              <div className="flex items-center justify-center h-full break-words leading-tight overflow-hidden">
                {new Date(date).toLocaleDateString()}
              </div>
            );
          } catch {
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          }
        },
      },
      {
        accessorKey: "buyerCompanyName",
        header: () => <div className="text-center">Account Name</div>,
        size: 250,
        enableResizing: true,
        cell: ({ getValue }) => (
          <div className="flex items-center justify-center h-full break-words leading-tight overflow-hidden">
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "itemCount",
        header: () => <div className="text-center">Total Items</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const items = row.original.itemCount || 0;
          return (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setSelectedQuoteItems(row.original);
                  setIsItemsDialogOpen(true);
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
              >
                {items}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "subTotal",
        header: () => <div className="text-center">Subtotal</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const currencySymbol = row.original.curencySymbol?.symbol || "$";
          const amount = row.original.subTotal || row.original.grandTotal || 0;
          return (
            <div className="flex items-center justify-center h-full">
              {currencySymbol} {Number(amount).toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "taxableAmount",
        header: () => <div className="text-center">Taxable Amount</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const currencySymbol = row.original.curencySymbol?.symbol || "$";
          const amount = row.original.taxableAmount || 0;
          return (
            <div className="flex items-center justify-center h-full">
              {currencySymbol} {Number(amount).toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "grandTotal",
        header: () => <div className="text-center">Total</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const currencySymbol = row.original.curencySymbol?.symbol || "$";
          const amount = row.original.grandTotal || 0;
          return (
            <div className="flex items-center justify-center h-full">
              <div className="font-semibold break-words leading-tight overflow-hidden">
                {currencySymbol} {Number(amount).toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "updatedBuyerStatus",
        header: () => <div className="text-center">Status</div>,
        size: 200,
        enableResizing: true,
        cell: ({ getValue }) => {
          const status = getValue() as string;
          if (!status) {
            return (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">-</span>
              </div>
            );
          }

          // Get color from the centralized statusColor function
          const bgColor = statusColor(status.toUpperCase());

          return (
            <div className="flex items-center justify-center h-full">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap inline-block max-w-full overflow-hidden text-ellipsis"
                style={{ backgroundColor: bgColor }}
                title={status}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "requiredDate",
        header: () => <div className="text-center">Required Date</div>,
        size: 150,
        enableResizing: true,
        cell: ({ row }) => {
          const date = row.original.customerRequiredDate;
          if (!date)
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          try {
            return (
              <div className="flex items-center justify-center h-full break-words leading-tight overflow-hidden">
                {new Date(date).toLocaleDateString()}
              </div>
            );
          } catch {
            return (
              <div className="flex items-center justify-center h-full">-</div>
            );
          }
        },
      },
    ],
    []
  );

  // Sync pagination state
  useEffect(() => {
    setPagination({
      pageIndex: page,
      pageSize: rowPerPage,
    });
  }, [page, rowPerPage]);

  // Handle pagination changes from DashboardTable
  const handlePaginationChange = useCallback(
    (
      value:
        | { pageIndex: number; pageSize: number }
        | ((prevState: { pageIndex: number; pageSize: number }) => {
            pageIndex: number;
            pageSize: number;
          })
    ) => {
      if (typeof value === "function") {
        const newPagination = value(pagination);
        setPage(newPagination.pageIndex);
        setRowPerPage(newPagination.pageSize);
      } else {
        setPage(value.pageIndex);
        setRowPerPage(value.pageSize);
      }
    },
    [pagination]
  );

  // Computed pagination properties
  const maxPage = useMemo(
    () => Math.max(0, Math.ceil(totalCount / rowPerPage) - 1),
    [totalCount, rowPerPage]
  );
  const canGoPrevious = useMemo(() => page > 0 && !loading, [page, loading]);
  const canGoNext = useMemo(
    () => page < maxPage && !loading,
    [page, maxPage, loading]
  );

  const fetchQuotes = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 0-based offset: Calculate proper starting record number
      const calculatedOffset = page;

      const queryParams = {
        userId: user.userId,
        companyId: user.companyId,
        offset: calculatedOffset,
        limit: rowPerPage,
      };

      const filterRequest = {
        filter_index: 1,
        filter_name: "Quote Filter",
        endCreatedDate: filterData?.quotedDateEnd
          ? filterData.quotedDateEnd.toISOString()
          : "",
        endDate: filterData?.lastUpdatedDateEnd
          ? filterData.lastUpdatedDateEnd.toISOString()
          : "",
        endValue: filterData?.subtotalEnd || "",
        endTaxableAmount: filterData?.taxableEnd || "",
        endGrandTotal: filterData?.totalEnd || "",
        identifier: filterData?.quoteId || "",
        limit: rowPerPage,
        offset: calculatedOffset, // Now using 0-based offset
        name: filterData?.quoteName || "",
        pageNumber: page + 1, // Backend uses 1-based pageNumber for pagination
        startDate: filterData?.lastUpdatedDateStart
          ? filterData.lastUpdatedDateStart.toISOString()
          : "",
        startCreatedDate: filterData?.quotedDateStart
          ? filterData.quotedDateStart.toISOString()
          : "",
        startValue: filterData?.subtotalStart || "",
        startTaxableAmount: filterData?.taxableStart || "",
        startGrandTotal: filterData?.totalStart || "",
        status: filterData?.status ? [filterData.status] : [],
        selectedColumns: [],
        columnWidth: [],
        columnPosition: "",
        userDisplayName: "",
        userStatus: [],
        accountId: [],
        branchId: [],
      };

      const response = await QuotesService.getQuotes(
        queryParams,
        filterRequest
      );

      setQuotes(response.data.quotesResponse || []);
      setTotalCount(response.data.totalQuoteCount || 0);
    } catch (_error) {
      toast.error("Failed to fetch quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage, user, filterData]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes, refreshTrigger]);

  const handleExport = useCallback(async () => {
    try {
      if (quotes.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Dynamic import of xlsx to avoid SSR issues
      const XLSX = await import("xlsx");

      // Prepare data for export
      const exportData = quotes.map(quote => ({
        "Quote Id": quote.quotationIdentifier,
        Name: quote.quoteName || "",
        "Quoted Date": quote.createdDate
          ? new Date(quote.createdDate).toLocaleDateString()
          : "",
        Date: quote.lastUpdatedDate
          ? new Date(quote.lastUpdatedDate).toLocaleDateString()
          : "",
        "Account Name": quote.buyerCompanyName || "",
        "Total Items": quote.itemCount || 0,
        Subtotal: `${quote.curencySymbol?.symbol || "$"} ${Number(quote.subTotal || quote.grandTotal || 0).toLocaleString()}`,
        "Taxable Amount": `${quote.curencySymbol?.symbol || "$"} ${Number(quote.taxableAmount || 0).toLocaleString()}`,
        Total: `${quote.curencySymbol?.symbol || "$"} ${Number(quote.grandTotal || 0).toLocaleString()}`,
        Status: quote.updatedBuyerStatus || "",
        "Required Date": quote.customerRequiredDate
          ? new Date(quote.customerRequiredDate).toLocaleDateString()
          : "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 15 }, // Quote Id
        { wch: 25 }, // Name
        { wch: 15 }, // Quoted Date
        { wch: 15 }, // Date
        { wch: 25 }, // Account Name
        { wch: 12 }, // Total Items
        { wch: 15 }, // Subtotal
        { wch: 15 }, // Taxable Amount
        { wch: 15 }, // Total
        { wch: 12 }, // Status
        { wch: 15 }, // Required Date
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Quotes");

      // Generate filename with current date
      const filename = `quotes_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      toast.success("Export completed successfully!");
    } catch (_error) {
      toast.error("Failed to export quotes");
    }
  }, [quotes]);

  // Register export callback with parent component
  useEffect(() => {
    if (setExportCallback) {
      setExportCallback(() => handleExport);
    }
  }, [handleExport, setExportCallback]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleFilterClick = () => {
    setIsDrawerOpen(true);
  };

  const handleAddTab = () => {
    setIsDrawerOpen(true);
  };

  const handleAddDrawerClose = () => {
    setIsAddDrawerOpen(false);
  };

  const handleSettingsClick = () => {
    toast.info("Settings functionality coming soon!");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0); // Reset to first page when changing tabs
    toast.info(`Switched to ${value} quotes`);
  };

  const handleQuoteFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0); // Reset to first page when applying filters
    toast.success("Filters have been applied successfully!");
  };

  const handleQuoteFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success("Filters have been reset successfully!");
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setPage(prevPage => Math.max(0, prevPage - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRowClick = (row: QuoteItem) => {
    router.push(`/${locale}/quotes/${row.quotationIdentifier}`);
  };

  // Define tabs with filter capabilities - only All tab initially
  const tabs = [
    {
      id: "all",
      label: "All",
      hasFilter: true,
      isFilterActive: !!filterData,
      ...(filterData && { count: 1 }),
    },
  ];

  return (
    <>
      <FilterDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={handleQuoteFilterSubmit}
        onReset={handleQuoteFilterReset}
        title="Quote Filters"
        filterType="Quote"
        activeTab={activeTab}
        statusOptions={[
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "expired", label: "Expired" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />

      <SideDrawer
        open={isAddDrawerOpen}
        onClose={handleAddDrawerClose}
        title="Add New Quote"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Add new quote functionality will be implemented here.
          </p>
        </div>
      </SideDrawer>

      <div className="h-full flex flex-col">
        {/* Add FilterTabs above the table */}
        <div className="flex-shrink-0">
          <FilterTabs
            tabs={tabs}
            defaultValue="all"
            onTabChange={handleTabChange}
            onAddTab={handleAddTab}
            onFilterClick={handleFilterClick}
            onSettingsClick={handleSettingsClick}
          />
        </div>

        <div className=" overflow-hidden">
          {loading ? (
            <SkeletonTable columns={columns.length} rows={rowPerPage} />
          ) : (
            <DashboardTable
              data={quotes}
              columns={columns}
              loading={false}
              totalDataCount={totalCount}
              pagination={pagination}
              setPagination={handlePaginationChange}
              setPage={setPage}
              pageOptions={[20, 50, 100]}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              page={page}
              rowPerPage={rowPerPage}
              setRowPerPage={value => {
                const newValue =
                  typeof value === "string" ? parseInt(value, 10) : value;
                // Validate that the value is one of the allowed options
                const validOptions = [20, 50, 100];
                if (validOptions.includes(newValue)) {
                  setRowPerPage(newValue);
                  setPage(0); // Reset to first page when changing page size
                } else {
                  // Default to 20 if invalid value
                  setRowPerPage(20);
                  setPage(0);
                }
              }}
              onRowClick={handleRowClick}
              tableHeight="h-full"
              enableColumnResizing={true}
              columnResizeMode="onChange"
            />
          )}
        </div>
      </div>

      {/* Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Items</DialogTitle>
            <DialogDescription>
              {selectedQuoteItems && (
                <>
                  Quote ID: {selectedQuoteItems.quotationIdentifier} -{" "}
                  {selectedQuoteItems.quoteName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="text-center text-gray-500 py-8">
              Quote items details will be displayed here.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuotesLandingTable;
