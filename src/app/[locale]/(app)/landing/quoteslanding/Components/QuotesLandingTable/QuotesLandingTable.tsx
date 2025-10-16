"use client";

import DashboardTable from "@/components/custom/DashBoardTable";
import { FilterTabs } from "@/components/custom/FilterTabs";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PreferenceService, {
  type FilterPreferenceResponse,
  type FilterPreference,
} from "@/lib/api/services/PreferenceService";
import QuotesService, {
  type QuoteItem,
} from "@/lib/api/services/QuotesService";
import { ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  const [drawerMode, setDrawerMode] = useState<"filter" | "create">("filter");
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20); // Default to first valid option
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [initialFilterData, setInitialFilterData] = useState<
    QuoteFilterFormData | undefined
  >(undefined);
  const [filterPreferences, setFilterPreferences] =
    useState<FilterPreferenceResponse | null>(null);
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
    } catch (_error) {
      toast.error("Failed to fetch quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage, user, filterPreferences, filterData]);

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

      // Helper functions for export
      const formatDate = (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString() : "";
      const formatCurrency = (amount: number | undefined, symbol = "$") =>
        `${symbol} ${Number(amount || 0).toLocaleString()}`;

      // Prepare data for export
      const exportData = quotes.map(q => ({
        "Quote Id": q.quotationIdentifier,
        Name: q.quoteName || "",
        "Quoted Date": formatDate(q.createdDate),
        Date: formatDate(q.lastUpdatedDate),
        "Account Name": q.buyerCompanyName || "",
        "Total Items": q.itemCount || 0,
        Subtotal: formatCurrency(
          q.subTotal || q.grandTotal,
          q.curencySymbol?.symbol || "$"
        ),
        "Taxable Amount": formatCurrency(
          q.taxableAmount,
          q.curencySymbol?.symbol || "$"
        ),
        Total: formatCurrency(q.grandTotal, q.curencySymbol?.symbol || "$"),
        Status: q.updatedBuyerStatus || "",
        "Required Date": formatDate(q.customerRequiredDate || undefined),
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

  const handleDrawerClose = () => setIsDrawerOpen(false);

  // Convert saved filter to form data format
  const convertToFormData = (
    filter: FilterPreference
  ): QuoteFilterFormData => ({
    filterName: filter.filter_name || "", // ← Add filter_name mapping
    status: filter.status || [],
    quoteId: filter.identifier || "",
    quoteName: filter.name || "",
    quotedDateStart: filter.startDate ? new Date(filter.startDate) : undefined,
    quotedDateEnd: filter.endDate ? new Date(filter.endDate) : undefined,
    lastUpdatedDateStart: filter.startCreatedDate
      ? new Date(filter.startCreatedDate)
      : undefined,
    lastUpdatedDateEnd: filter.endCreatedDate
      ? new Date(filter.endCreatedDate)
      : undefined,
    subtotalStart: filter.startValue?.toString() || "",
    subtotalEnd: filter.endValue?.toString() || "",
    taxableStart: filter.startTaxableAmount?.toString() || "",
    taxableEnd: filter.endTaxableAmount?.toString() || "",
    totalStart: filter.startGrandTotal?.toString() || "",
    totalEnd: filter.endGrandTotal?.toString() || "",
  });

  const handleFilterClick = () => {
    let initialData: QuoteFilterFormData | undefined;

    if (activeTab !== "all" && filterPreferences?.preference?.filters) {
      const tabIndex = parseInt(activeTab.replace("filter-", ""));
      const filter = filterPreferences.preference.filters.find(
        f => f.filter_index === tabIndex
      );
      if (filter) initialData = convertToFormData(filter);
    }

    setInitialFilterData(initialData);
    setDrawerMode("filter");
    setIsDrawerOpen(true);
  };

  const handleAddTab = () => {
    // Set empty initial data for creating new custom filter
    setInitialFilterData(undefined);
    setDrawerMode("create");
    setIsDrawerOpen(true);
  };
  const handleAddDrawerClose = () => setIsAddDrawerOpen(false);
  const handleSettingsClick = () =>
    toast.info("Settings functionality coming soon!");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0); // Reset to first page when changing tabs

    // Find the tab and update selected filter preference
    const selectedTab = tabs.find(tab => tab.id === value);
    if (
      selectedTab &&
      filterPreferences &&
      selectedTab.filterIndex !== undefined &&
      typeof selectedTab.filterIndex === "number"
    ) {
      // Update the selected filter index in preferences
      const updatedPreferences = {
        ...filterPreferences,
        preference: {
          ...filterPreferences.preference,
          selected: selectedTab.filterIndex,
        },
      };
      setFilterPreferences(updatedPreferences);

      // Auto-apply the filter for this tab
      const selectedFilter =
        filterPreferences.preference.filters[selectedTab.filterIndex];
      if (selectedFilter) {
        const formData: QuoteFilterFormData = {
          status: selectedFilter.status || [],
          quoteId: selectedFilter.identifier || "",
          quoteName: selectedFilter.name || "",
          quotedDateStart: selectedFilter.startDate
            ? new Date(selectedFilter.startDate)
            : undefined,
          quotedDateEnd: selectedFilter.endDate
            ? new Date(selectedFilter.endDate)
            : undefined,
          lastUpdatedDateStart: selectedFilter.startCreatedDate
            ? new Date(selectedFilter.startCreatedDate)
            : undefined,
          lastUpdatedDateEnd: selectedFilter.endCreatedDate
            ? new Date(selectedFilter.endCreatedDate)
            : undefined,
          subtotalStart: selectedFilter.startValue?.toString() || "",
          subtotalEnd: selectedFilter.endValue?.toString() || "",
          taxableStart: selectedFilter.startTaxableAmount?.toString() || "",
          taxableEnd: selectedFilter.endTaxableAmount?.toString() || "",
          totalStart: selectedFilter.startGrandTotal?.toString() || "",
          totalEnd: selectedFilter.endGrandTotal?.toString() || "",
        };
        setFilterData(formData);
        toast.success(`Applied "${selectedTab.label}" filter successfully`);
      }
    } else if (selectedTab) {
      // Clear filters when switching to a tab without saved filters
      setFilterData(null);
      toast.success(`Switched to "${selectedTab.label}" view`);
    } else {
      toast.info("Filter view changed");
    }
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

  const handleQuoteFilterSave = async (data: QuoteFilterFormData) => {
    try {
      if (!data.filterName || data.filterName.trim() === "") {
        toast.error("Please enter a filter name");
        return;
      }

      // Here you would implement the save functionality
      // For now, just show success message
      toast.success(`Filter "${data.filterName}" saved successfully!`);

      // Apply the filter immediately
      setFilterData(data);
      setPage(0);

      // Refresh filter preferences to show the new filter
      await loadFilterPreferences();
    } catch {
      toast.error("Failed to save filter");
    }
  };

  const handlePrevious = () =>
    canGoPrevious && setPage(p => Math.max(0, p - 1));
  const handleNext = () => canGoNext && setPage(p => p + 1);

  const handleRowClick = (row: QuoteItem) =>
    router.push(`/${locale}/quotes/${row.quotationIdentifier}`);

  // Define tabs dynamically from filter preferences
  const tabs = useMemo(() => {
    if (
      !filterPreferences?.preference?.filters ||
      filterPreferences.preference.filters.length === 0
    ) {
      // Fallback to default "All" tab if no preferences loaded
      return [
        {
          id: "all",
          label: "All",
          hasFilter: true,
          isFilterActive: !!filterData,
          filterIndex: undefined,
          ...(filterData && { count: 1 }),
        },
      ];
    }

    // Generate tabs from filter preferences
    return filterPreferences.preference.filters.map((filter, index) => ({
      id: `filter-${index}`,
      label: filter.filter_name,
      hasFilter: true,
      isFilterActive:
        filterPreferences.preference.selected === index || !!filterData,
      filterIndex: index,
    }));
  }, [filterPreferences, filterData]);

  return (
    <>
      <FilterDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={handleQuoteFilterSubmit}
        onReset={handleQuoteFilterReset}
        onSave={handleQuoteFilterSave}
        title={
          drawerMode === "create" ? "Create Custom Filter" : "Quote Filters"
        }
        filterType="Quote"
        activeTab={activeTab}
        userId={user?.userId}
        companyId={user?.companyId}
        module="quote"
        initialFilterData={initialFilterData}
        mode={drawerMode}
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
            defaultValue={
              filterPreferences?.preference?.filters &&
              filterPreferences.preference.filters.length > 0
                ? `filter-${filterPreferences.preference.selected}`
                : "all"
            }
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
                const validOptions = [20, 50, 100];
                setRowPerPage(validOptions.includes(newValue) ? newValue : 20);
                setPage(0);
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
