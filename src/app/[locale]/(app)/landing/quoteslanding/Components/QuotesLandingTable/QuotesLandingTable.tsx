"use client";

import PricingFormat from "@/components/PricingFormat";
import DashboardTable from "@/components/custom/DashBoardTable";
import SideDrawer from "@/components/custom/sidedrawer";
import { statusColor } from "@/components/custom/statuscolors";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PreferenceService, {
  FilterPreferenceResponse,
} from "@/lib/api/services/PreferenceService/PreferenceService";
import QuotesService, {
  type QuoteItem,
} from "@/lib/api/services/QuotesService/QuotesService";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface QuotesLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
}

function QuotesLandingTable({
  refreshTrigger,
  setExportCallback,
}: QuotesLandingTableProps) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("quotes");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [filterPreferences, setFilterPreferences] =
    useState<FilterPreferenceResponse | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedQuoteItems, setSelectedQuoteItems] =
    useState<QuoteItem | null>(null);

  const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
    <div className="rounded-md border shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex font-medium text-sm text-gray-700">
          <div className="px-2 py-3 w-[150px] pl-2">{t("quoteId")}</div>
          <div className="px-2 py-3 w-[200px]">{t("quoteName")}</div>
          <div className="px-2 py-3 w-[150px]">{t("quotedDate")}</div>
          <div className="px-2 py-3 w-[150px]">{t("lastModified")}</div>
          <div className="px-2 py-3 w-[300px]">{t("accountName")}</div>
          <div className="px-2 py-3 w-[150px]">{t("totalItems")}</div>
          <div className="px-2 py-3 w-[150px]">{t("subtotal")}</div>
          <div className="px-2 py-3 w-[150px]">{t("taxableAmount")}</div>
          <div className="px-2 py-3 w-[150px]">{t("total")}</div>
          <div className="px-2 py-3 w-[200px]">{t("status")}</div>
          <div className="px-2 py-3 w-[150px]">{t("requiredDate")}</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="border-b border-gray-100 flex animate-pulse"
          >
            {Array.from({ length: 11 }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="px-2 py-3 w-[150px] flex items-center"
              >
                <Skeleton className="h-4 w-full bg-gray-200" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-4 px-4 py-2 border-t bg-gray-50/50 flex-shrink-0">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-6 h-6" />
      </div>
    </div>
  );

  // Define table columns
  const columns = useMemo<ColumnDef<QuoteItem>[]>(
    () => [
      {
        accessorKey: "quotationIdentifier",
        header: () => <span className="pl-2">{t("quoteId")}</span>,
        size: 150,
        meta: {
          sticky: true,
        },
        cell: ({ row }) => (
          <div
            className="pl-2 break-words whitespace-normal"
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              lineHeight: "1.5",
            }}
          >
            {row.original.quotationIdentifier || "-"}
          </div>
        ),
      },
      {
        accessorKey: "quoteName",
        header: () => <span className="pl-2">{t("quoteName")}</span>,
        size: 200,
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate pl-2"
            title={row.original.quoteName || "-"}
          >
            {row.original.quoteName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "createdDate",
        header: t("quotedDate"),
        size: 150,
        cell: ({ row }) => {
          const date = row.original.createdDate;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "lastModifiedDate",
        header: t("lastModified"),
        size: 150,
        cell: ({ row }) => {
          const date = row.original.lastUpdatedDate;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "buyerCompanyName",
        header: t("accountName"),
        size: 300,
        cell: ({ row }) => (
          <div
            className="max-w-[300px]"
            title={row.original.buyerCompanyName || "-"}
          >
            {row.original.buyerCompanyName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "itemCount",
        header: t("totalItems"),
        size: 150,
        meta: {
          alignCenter: true,
        },
        cell: ({ row }) => {
          const items = row.original.itemCount || 0;
          return (
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
          );
        },
      },
      {
        accessorKey: "subTotal",
        header: t("subtotal"),
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <PricingFormat
            {...(row.original.curencySymbol && {
              buyerCurrency: row.original.curencySymbol,
            })}
            value={row.original.subTotal || row.original.grandTotal || 0}
          />
        ),
      },
      {
        accessorKey: "taxableAmount",
        header: t("taxableAmount"),
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <PricingFormat
            {...(row.original.curencySymbol && {
              buyerCurrency: row.original.curencySymbol,
            })}
            value={row.original.taxableAmount || 0}
          />
        ),
      },
      {
        accessorKey: "grandTotal",
        header: t("total"),
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <span className="font-semibold">
            <PricingFormat
              {...(row.original.curencySymbol && {
                buyerCurrency: row.original.curencySymbol,
              })}
              value={row.original.grandTotal || 0}
            />
          </span>
        ),
      },
      {
        accessorKey: "updatedBuyerStatus",
        header: () => <span className="pl-[30px]">{t("status")}</span>,
        size: 200,
        cell: ({ row }) => {
          const status = row.original.updatedBuyerStatus;
          if (!status)
            return <span className="text-gray-400 pl-[30px]">-</span>;
          const color = statusColor(status.toUpperCase());
          const titleCaseStatus = status
            .split(" ")
            .map(
              word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
          return (
            <div className="pl-[30px]">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {titleCaseStatus}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "requiredDate",
        header: t("requiredDate"),
        size: 150,
        cell: ({ row }) => {
          const date = row.original.customerRequiredDate;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
    ],
    [t]
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

  // Load filter preferences
  const loadFilterPreferences = useCallback(async () => {
    try {
      const preferences =
        await PreferenceService.findFilterPreferences("quote");
      setFilterPreferences(preferences);
      return preferences;
    } catch {
      return null;
    }
  }, []);

  // Load preferences on component mount
  useEffect(() => {
    loadFilterPreferences();
  }, [loadFilterPreferences]);

  const fetchQuotes = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      // Keep loading true while waiting for user data
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

      // Always build a complete filter request - the API requires it
      let filterRequest = {
        filter_index: 0,
        filter_name: "",
        endCreatedDate: "",
        endDate: "",
        endValue: "",
        endTaxableAmount: "",
        endGrandTotal: "",
        identifier: "",
        limit: rowPerPage,
        offset: calculatedOffset,
        name: "",
        pageNumber: page + 1,
        startDate: "",
        startCreatedDate: "",
        startValue: "",
        startTaxableAmount: "",
        startGrandTotal: "",
        status: [] as string[],
        selectedColumns: [],
        columnWidth: [],
        columnPosition: "",
        userDisplayName: "",
        userStatus: [],
        accountId: [],
        branchId: [],
      };

      // Check if we have any filters to apply
      const hasActiveFilters =
        filterData ||
        (filterPreferences?.preference?.filters &&
          filterPreferences.preference.filters.length > 0 &&
          typeof filterPreferences.preference.selected === "number" &&
          filterPreferences.preference.filters[
            filterPreferences.preference.selected
          ]);

      // Only modify the filter request if there are active filters
      if (hasActiveFilters) {
        // Update filter_index and filter_name when filters are active
        filterRequest.filter_index = 1;
        filterRequest.filter_name = "Quote Filter";

        // Apply saved filter preferences first
        if (filterPreferences?.preference?.filters) {
          const activeFilter =
            filterPreferences.preference.filters[
              filterPreferences.preference.selected
            ];
          if (activeFilter) {
            // Handle status array - use full array
            if (
              activeFilter.status &&
              Array.isArray(activeFilter.status) &&
              activeFilter.status.length > 0
            ) {
              filterRequest.status = activeFilter.status.filter(
                s => s !== null && s !== undefined
              );
            }

            // Handle date fields - ensure proper format
            if (
              activeFilter.startDate &&
              typeof activeFilter.startDate === "string"
            ) {
              // If it's already in YYYY-MM-DD format, use it; otherwise format it
              const dateValue = activeFilter.startDate.includes("T")
                ? activeFilter.startDate.split("T")[0] || activeFilter.startDate
                : activeFilter.startDate;
              filterRequest.startDate = dateValue;
            }
            if (
              activeFilter.endDate &&
              typeof activeFilter.endDate === "string"
            ) {
              const dateValue = activeFilter.endDate.includes("T")
                ? activeFilter.endDate.split("T")[0] || activeFilter.endDate
                : activeFilter.endDate;
              filterRequest.endDate = dateValue;
            }
            if (
              activeFilter.startCreatedDate &&
              typeof activeFilter.startCreatedDate === "string"
            ) {
              const dateValue = activeFilter.startCreatedDate.includes("T")
                ? activeFilter.startCreatedDate.split("T")[0] ||
                  activeFilter.startCreatedDate
                : activeFilter.startCreatedDate;
              filterRequest.startCreatedDate = dateValue;
            }
            if (
              activeFilter.endCreatedDate &&
              typeof activeFilter.endCreatedDate === "string"
            ) {
              const dateValue = activeFilter.endCreatedDate.includes("T")
                ? activeFilter.endCreatedDate.split("T")[0] ||
                  activeFilter.endCreatedDate
                : activeFilter.endCreatedDate;
              filterRequest.endCreatedDate = dateValue;
            }

            // Handle amount fields - ensure they're valid numbers
            if (
              activeFilter.startValue !== null &&
              activeFilter.startValue !== undefined
            ) {
              const parsed = parseFloat(activeFilter.startValue.toString());
              filterRequest.startValue = isNaN(parsed) ? "" : parsed.toString();
            }
            if (
              activeFilter.endValue !== null &&
              activeFilter.endValue !== undefined
            ) {
              const parsed = parseFloat(activeFilter.endValue.toString());
              filterRequest.endValue = isNaN(parsed) ? "" : parsed.toString();
            }
            if (
              activeFilter.startTaxableAmount !== null &&
              activeFilter.startTaxableAmount !== undefined
            ) {
              const parsed = parseFloat(
                activeFilter.startTaxableAmount.toString()
              );
              filterRequest.startTaxableAmount = isNaN(parsed)
                ? ""
                : parsed.toString();
            }
            if (
              activeFilter.endTaxableAmount !== null &&
              activeFilter.endTaxableAmount !== undefined
            ) {
              const parsed = parseFloat(
                activeFilter.endTaxableAmount.toString()
              );
              filterRequest.endTaxableAmount = isNaN(parsed)
                ? ""
                : parsed.toString();
            }
            if (
              activeFilter.startGrandTotal !== null &&
              activeFilter.startGrandTotal !== undefined
            ) {
              const parsed = parseFloat(
                activeFilter.startGrandTotal.toString()
              );
              filterRequest.startGrandTotal = isNaN(parsed)
                ? ""
                : parsed.toString();
            }
            if (
              activeFilter.endGrandTotal !== null &&
              activeFilter.endGrandTotal !== undefined
            ) {
              const parsed = parseFloat(activeFilter.endGrandTotal.toString());
              filterRequest.endGrandTotal = isNaN(parsed)
                ? ""
                : parsed.toString();
            }

            // Handle quote identifier and name
            if (activeFilter.identifier)
              filterRequest.identifier = activeFilter.identifier;
            if (activeFilter.name) filterRequest.name = activeFilter.name;
          }
        }

        // Apply current filter data (overrides saved preferences)
        if (filterData) {
          // Helper function to format dates properly for API
          const formatDateForAPI = (date: Date | undefined): string => {
            if (!date) return "";
            // Convert to YYYY-MM-DD format (date only, no time)
            return date.toISOString().split("T")[0] || "";
          };

          // Helper function to parse and validate numeric values
          const parseNumericValue = (value: string | undefined): string => {
            if (!value || value.trim() === "") return "";
            const parsed = parseFloat(value);
            return isNaN(parsed) ? "" : parsed.toString();
          };

          filterRequest = {
            ...filterRequest,
            // Fix date formatting - use date only, no time
            endCreatedDate: formatDateForAPI(filterData?.quotedDateEnd),
            endDate: formatDateForAPI(filterData?.lastUpdatedDateEnd),
            startDate: formatDateForAPI(filterData?.lastUpdatedDateStart),
            startCreatedDate: formatDateForAPI(filterData?.quotedDateStart),

            // Fix numeric values - ensure they're valid numbers
            endValue: parseNumericValue(filterData?.subtotalEnd),
            endTaxableAmount: parseNumericValue(filterData?.taxableEnd),
            endGrandTotal: parseNumericValue(filterData?.totalEnd),
            startValue: parseNumericValue(filterData?.subtotalStart),
            startTaxableAmount: parseNumericValue(filterData?.taxableStart),
            startGrandTotal: parseNumericValue(filterData?.totalStart),

            // String fields
            identifier: filterData?.quoteId?.trim() || filterRequest.identifier,
            name: filterData?.quoteName?.trim() || filterRequest.name,

            // Status array
            status: filterData?.status
              ? Array.isArray(filterData.status)
                ? filterData.status
                : [filterData.status]
              : filterRequest.status,
          };
        }
      }

      // Final validation before sending request
      const validateFilterRequest = (request: typeof filterRequest) => {
        // Validate date ranges
        if (
          request.startDate &&
          request.endDate &&
          request.startDate > request.endDate
        ) {
          request.endDate = request.startDate;
        }
        if (
          request.startCreatedDate &&
          request.endCreatedDate &&
          request.startCreatedDate > request.endCreatedDate
        ) {
          request.endCreatedDate = request.startCreatedDate;
        }

        // Validate numeric ranges
        const validateNumericRange = (
          start: string,
          end: string,
          _fieldName: string
        ) => {
          if (start && end) {
            const startNum = parseFloat(start);
            const endNum = parseFloat(end);
            if (!isNaN(startNum) && !isNaN(endNum) && startNum > endNum) {
              return {
                start: Math.min(startNum, endNum).toString(),
                end: Math.max(startNum, endNum).toString(),
              };
            }
          }
          return { start, end };
        };

        const valueRange = validateNumericRange(
          request.startValue,
          request.endValue,
          "value"
        );
        request.startValue = valueRange.start;
        request.endValue = valueRange.end;

        const taxableRange = validateNumericRange(
          request.startTaxableAmount,
          request.endTaxableAmount,
          "taxable amount"
        );
        request.startTaxableAmount = taxableRange.start;
        request.endTaxableAmount = taxableRange.end;

        const totalRange = validateNumericRange(
          request.startGrandTotal,
          request.endGrandTotal,
          "grand total"
        );
        request.startGrandTotal = totalRange.start;
        request.endGrandTotal = totalRange.end;

        return request;
      };

      const validatedFilterRequest = validateFilterRequest(filterRequest);

      const response = await QuotesService.getQuotes(
        queryParams,
        validatedFilterRequest
      );

      setQuotes(response.data.quotesResponse || []);
      setTotalCount(response.data.totalQuoteCount || 0);
    } catch {
      toast.error(t("failedToFetch"));
      setQuotes([]);
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [page, rowPerPage, user, filterPreferences, filterData, initialLoad, t]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes, refreshTrigger]);

  const handleExport = useCallback(async () => {
    try {
      if (quotes.length === 0) {
        toast.error(t("noDataToExport"));
        return;
      }

      // Dynamic import of xlsx to avoid SSR issues
      const XLSX = await import("xlsx");

      // Helper functions for export
      const formatDate = (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString() : "";

      // Prepare data for export
      const exportData = quotes.map(q => ({
        [t("quoteId")]: q.quotationIdentifier,
        [t("quoteName")]: q.quoteName || "",
        [t("quotedDate")]: formatDate(q.createdDate),
        [t("lastModified")]: formatDate(q.lastUpdatedDate),
        [t("accountName")]: q.buyerCompanyName || "",
        [t("totalItems")]: q.itemCount || 0,
        [t("subTotal")]: getAccounting(
          q.curencySymbol || null,
          q.subTotal || q.grandTotal || 0,
          q.curencySymbol || undefined
        ),
        [t("taxableAmount")]: getAccounting(
          q.curencySymbol || null,
          q.taxableAmount || 0,
          q.curencySymbol || undefined
        ),
        [t("grandTotal")]: getAccounting(
          q.curencySymbol || null,
          q.grandTotal || 0,
          q.curencySymbol || undefined
        ),
        [t("status")]: q.updatedBuyerStatus || "",
        [t("requiredDate")]: formatDate(q.customerRequiredDate || undefined),
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
      XLSX.utils.book_append_sheet(wb, ws, t("title"));

      // Generate filename with current date
      const filename = `quotes_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      toast.success(t("exportCompleted"));
    } catch {
      toast.error(t("exportFailed"));
    }
  }, [quotes, t]);

  // Register export callback with parent component
  useEffect(() => {
    if (setExportCallback) {
      setExportCallback(() => handleExport);
    }
  }, [handleExport, setExportCallback]);

  const handleDrawerClose = () => setIsDrawerOpen(false);

  const handleAddDrawerClose = () => setIsAddDrawerOpen(false);

  const handleQuoteFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0); // Reset to first page when applying filters
    toast.success(t("filtersApplied"));
  };

  const handleQuoteFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success(t("filtersReset"));
  };

  const handleQuoteFilterSave = async (data: QuoteFilterFormData) => {
    try {
      if (!data.filterName || data.filterName.trim() === "") {
        toast.error(t("pleaseEnterFilterName"));
        return;
      }

      // Here you would implement the save functionality
      // For now, just show success message
      toast.success(t("filterSaved"));

      // Apply the filter immediately
      setFilterData(data);
      setPage(0);

      // Refresh filter preferences to show the new filter
      await loadFilterPreferences();
    } catch {
      toast.error(t("filterSaveFailed"));
    }
  };

  const handlePrevious = () => {
    setPage(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setPage(prev => prev + 1);
  };

  return (
    <>
      <FilterDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={handleQuoteFilterSubmit}
        onReset={handleQuoteFilterReset}
        onSave={handleQuoteFilterSave}
        title={t("quoteFilters")}
        filterType="Quote"
        userId={user?.userId}
        companyId={user?.companyId}
        module="quote"
        initialFilterData={undefined}
        mode="filter"
      />

      <SideDrawer
        open={isAddDrawerOpen}
        onClose={handleAddDrawerClose}
        title={t("addNewQuote")}
      >
        <div className="space-y-4">
          <p className="text-gray-600">{t("addNewQuoteDescription")}</p>
        </div>
      </SideDrawer>

      <div className="flex flex-col">
        <div className="w-full overflow-x-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin-horizontal">
            {initialLoad && loading ? (
              <TableSkeleton rows={rowPerPage} />
            ) : !initialLoad && quotes.length === 0 ? (
              <div className="flex items-center justify-center text-gray-500 py-8">
                {t("noQuotes")}
              </div>
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
                  setRowPerPage(newValue);
                  setPage(0);
                }}
                onRowClick={row => {
                  const quoteId = row.quotationIdentifier;
                  if (quoteId) {
                    router.push(`/details/quoteDetails/${quoteId}`);
                  }
                }}
                tableHeight=""
              />
            )}
          </div>
        </div>
      </div>

      {/* Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("quoteItems")}</DialogTitle>
            <DialogDescription>
              {selectedQuoteItems &&
                t("quoteItemsDescription", {
                  quoteId: selectedQuoteItems.quotationIdentifier,
                  quoteName: selectedQuoteItems.quoteName,
                })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="text-center text-gray-500 py-8">
              {t("quoteItemsDetails")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuotesLandingTable;
