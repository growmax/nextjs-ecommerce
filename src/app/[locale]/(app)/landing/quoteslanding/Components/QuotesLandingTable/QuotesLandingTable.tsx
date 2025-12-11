"use client";

import PricingFormat from "@/components/PricingFormat";
import DashboardTable from "@/components/custom/DashBoardTable";
import SideDrawer from "@/components/custom/sidedrawer";
import { statusColor } from "@/components/custom/statuscolors";
import { MobileLandingCards } from "@/components/landing/MobileLandingCards";
import { QuoteMobileCard } from "@/components/landing/QuoteMobileCard";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import { usePostNavigationFetch } from "@/hooks/usePostNavigationFetch";
import { useRequestDeduplication } from "@/hooks/useRequestDeduplication";
import QuotesService, {
  type QuoteItem,
} from "@/lib/api/services/QuotesService/QuotesService";
import { cn } from "@/lib/utils";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface QuotesLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
  onTotalCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function QuotesLandingTable({
  refreshTrigger,
  setExportCallback,
  onTotalCountChange,
  onLoadingChange,
}: QuotesLandingTableProps) {
  // Use the page loader hook to ensure navigation spinner is hidden immediately
  usePageLoader();

  const { user } = useCurrentUser();
  const userId = user?.userId;
  const companyId = user?.companyId;
  const router = useNavigationWithLoader();
  const t = useTranslations("quotes");
  const { deduplicate } = useRequestDeduplication();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(16);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [filterPreferences] = useState<any>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Refs to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialFetchedRef = useRef(false);

  // Ref for scrollable container to reset scroll position
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Define table columns first (needed for skeleton)
  const columns = useMemo<ColumnDef<QuoteItem>[]>(
    () => [
      {
        accessorKey: "quotationIdentifier",
        header: () => <span className="pl-4">{t("quoteId")}</span>,
        size: 150,
        meta: {
          sticky: true,
        },
        cell: ({ row }) => (
          <div
            className="pl-4 break-words whitespace-normal"
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
        header: () => <span className="pl-4">{t("quoteName")}</span>,
        size: 200,
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate pl-4"
            title={row.original.quoteName || "-"}
          >
            {row.original.quoteName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "updatedBuyerStatus",
        header: () => <span className="text-center w-full block">{t("status")}</span>,
        size: 200,
        cell: ({ row }) => {
          const status = row.original.updatedBuyerStatus;
          if (!status)
            return <span className="text-muted-foreground pl-4">-</span>;
          const color = statusColor(status.toUpperCase());
          const titleCaseStatus = status
            .split(" ")
            .map(
              word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
          return (
            <div className="flex justify-center">
              <span
                className="px-2 py-1 rounded text-xs font-medium text-primary-foreground whitespace-nowrap border border-border/30"
                style={{ backgroundColor: color }}
              >
                {titleCaseStatus}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "sellerCompanyName",
        header: () => <span className="pl-4">{t("accountName")}</span>,
        size: 300,
        cell: ({ row }) => (
          <div
            className="max-w-[300px] pl-4"
            title={row.original.sellerCompanyName || "-"}
          >
            {row.original.sellerCompanyName || "-"}
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
            <span className="text-foreground">
              {items}
            </span>
          );
        },
      },
      {
        accessorKey: "subTotal",
        header: () => <span className="pr-4">{t("subtotal")}</span>,
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <span className="pr-4">
          <PricingFormat
            {...(row.original.curencySymbol && {
              buyerCurrency: row.original.curencySymbol,
            })}
            value={row.original.subTotal || row.original.grandTotal || 0}
          />
          </span>
        ),
      },
      {
        accessorKey: "taxableAmount",
        header: () => <span className="pr-4">{t("taxableAmount")}</span>,
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <span className="pr-4">
          <PricingFormat
            {...(row.original.curencySymbol && {
              buyerCurrency: row.original.curencySymbol,
            })}
            value={row.original.taxableAmount || 0}
          />
          </span>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: () => <span className="pr-4">{t("total")}</span>,
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <span className="pr-4">
            <PricingFormat
              {...(row.original.curencySymbol && {
                buyerCurrency: row.original.curencySymbol,
              })}
              value={row.original.grandTotal || 0}
            />
          </span>
        ),
      },
    ],
    [t]
  );

  // Generate skeleton based on actual columns - matches DashboardTable structure exactly
  const TableSkeleton = ({ rows = 10 }: { rows?: number }) => {
    const columnCount = columns.length;
    const tableHeight = "h-[calc(103vh-180px)] max-md:h-[calc(100vh-140px)]";

    // Map accessorKey to translation key for function headers
    const getHeaderText = (column: ColumnDef<QuoteItem>) => {
      if (typeof column.header === "string") {
        return column.header;
      }
      if (typeof column.header === "function") {
        // Map accessorKey to translation keys for function headers
        const headerMap: Record<string, string> = {
          quotationIdentifier: t("quoteId"),
          quoteName: t("quoteName"),
          updatedBuyerStatus: t("status"),
        };
        const accessorKey =
          "accessorKey" in column ? (column.accessorKey as string) : undefined;
        return accessorKey ? headerMap[accessorKey] || "" : "";
      }
      return "";
    };

    return (
      <div
        className={cn(
          "border overflow-x-hidden flex flex-col w-full z-0",
          tableHeight,
          "max-md:border-l-0 max-md:border-r-0 max-md:rounded-none"
        )}
        style={{
          borderRadius: "var(--radius)",
        }}
      >
        {/* Scrollable Table Container - Header and Body together */}
        <div
          className={cn(
            "overflow-x-auto overflow-y-auto relative scrollbar-thin-horizontal",
            "flex-1",
            "max-md:flex-none"
          )}
        >
          {/* Table structure matching DashboardTable */}
          <div className="min-w-full">
            {/* Table Header */}
            <div className="border-b border-border bg-muted sticky top-0 z-30">
              <div className="flex font-medium text-sm text-foreground">
                {columns.map((column, index) => {
                  const width = column.size || 150;
                  const headerContent = getHeaderText(column);
                  const isSticky = (column.meta as { sticky?: boolean })
                    ?.sticky;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "px-2 py-3 border-r border-border",
                        index === columnCount - 1 && "border-r-0",
                        index === 0 && "max-md:pl-0",
                        index === columnCount - 1 && "max-md:pr-0",
                        isSticky &&
                          "sticky left-0 bg-muted z-[31] border-r border-border"
                      )}
                      style={{ width: `${width}px`, minWidth: `${width}px` }}
                    >
                      {headerContent || <Skeleton className="h-4 w-20" />}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Table Body - Only values show skeleton */}
            <div className="bg-background">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={cn(
                    "border-b border-border flex bg-background hover:bg-muted/50 transition-colors",
                    rowIndex === rows - 1 && "max-md:border-b-0"
                  )}
                >
                  {columns.map((column, colIndex) => {
                    const width = column.size || 150;
                    const alignCenter = (
                      column.meta as { alignCenter?: boolean }
                    )?.alignCenter;
                    const alignRight = (column.meta as { alignRight?: boolean })
                      ?.alignRight;
                    const isSticky = (column.meta as { sticky?: boolean })
                      ?.sticky;
                    // Determine skeleton width based on alignment and column type
                    const skeletonWidth =
                      alignCenter || alignRight
                        ? "w-20" // Fixed width for centered/right-aligned
                        : "w-full max-w-[80%]"; // Full width with max constraint for left-aligned
                    return (
                      <div
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={cn(
                          "px-2 py-3 flex items-center border-r border-border min-h-[44px]",
                          colIndex === columnCount - 1 && "border-r-0",
                          alignCenter && "justify-center",
                          alignRight && "justify-end",
                          colIndex === 0 && "max-md:pl-0",
                          colIndex === columnCount - 1 && "max-md:pr-0",
                          isSticky &&
                            "sticky left-0 z-20 bg-muted border-r border-border"
                        )}
                        style={{ width: `${width}px`, minWidth: `${width}px` }}
                      >
                        <Skeleton
                          className={cn(
                            "h-4 bg-muted animate-pulse",
                            skeletonWidth,
                            "min-w-[60px]"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Pagination Footer - matches DashboardTable */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-background rounded-b-lg flex-shrink-0 max-md:px-0">
          <div className="flex items-center gap-2">
            <span className="text-xs lg:text-sm text-muted-foreground">
              <Skeleton className="h-3 w-24 inline-block" />
            </span>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    );
  };

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

  const fetchQuotes = useCallback(async () => {
    // Don't fetch if we don't have user info yet

    // Create a unique key for this fetch request
    const fetchKey = `quotes-${JSON.stringify({
      page,
      rowPerPage,
      userId,
      companyId,
      filterData,
      filterPreferences: filterPreferences?.preference?.selected,
    })}`;

    // Use deduplication to prevent concurrent duplicate requests
    return deduplicate(async () => {
      // Prevent duplicate calls with same parameters - check BEFORE starting
      if (isFetchingRef.current && lastFetchParamsRef.current === fetchKey) {
        return;
      }

      // Double-check after deduplication wrapper (race condition protection)
      if (isFetchingRef.current && lastFetchParamsRef.current === fetchKey) {
        return;
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Mark as fetching and store params
      isFetchingRef.current = true;
      lastFetchParamsRef.current = fetchKey;

      setLoading(true);

      // Add timeout safety mechanism (30 seconds)
      const timeoutId = setTimeout(() => {
        if (
          isFetchingRef.current &&
          abortControllerRef.current?.signal === signal
        ) {
          abortControllerRef.current.abort();
          isFetchingRef.current = false;
          setLoading(false);
          if (initialLoad) {
            setInitialLoad(false);
          }
          toast.error(
            t("requestTimeout") || "Request timed out. Please try again."
          );
        }
      }, 30000);

      try {
        // Early return if userId or companyId are undefined
        if (userId === undefined || companyId === undefined) {
          return;
        }

        // 0-based offset: Calculate proper starting record number
        const calculatedOffset = page;

        const queryParams = {
          userId,
          companyId,
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
                  (s: any) => s !== null && s !== undefined
                );
              }

              // Handle date fields - ensure proper format
              if (
                activeFilter.startDate &&
                typeof activeFilter.startDate === "string"
              ) {
                // If it's already in YYYY-MM-DD format, use it; otherwise format it
                const dateValue = activeFilter.startDate.includes("T")
                  ? activeFilter.startDate.split("T")[0] ||
                    activeFilter.startDate
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
                filterRequest.startValue = isNaN(parsed)
                  ? ""
                  : parsed.toString();
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
                const parsed = parseFloat(
                  activeFilter.endGrandTotal.toString()
                );
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
              identifier:
                filterData?.quoteId?.trim() || filterRequest.identifier,
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

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          setQuotes(response.data.quotesResponse || []);
          const newTotalCount = response.data.totalQuoteCount || 0;
          setTotalCount(newTotalCount);
          onTotalCountChange?.(newTotalCount);
        }
      } catch (error: any) {
        // Don't show error if request was aborted
        if (error?.name === "AbortError" || signal.aborted) {
          // Still reset state even for aborted requests
          // Check if this is still the current request
          if (abortControllerRef.current?.signal === signal) {
            isFetchingRef.current = false;
            setLoading(false);
            if (initialLoad) {
              setInitialLoad(false);
            }
          }
          return;
        }
        toast.error(t("failedToFetch"));
        if (!signal.aborted) {
          setQuotes([]);
        }
      } finally {
        // Clear timeout
        clearTimeout(timeoutId);

        // Always reset loading state and fetching ref
        // Check if this is still the current request to avoid race conditions
        if (abortControllerRef.current?.signal === signal || !signal.aborted) {
          setLoading(false);
          if (initialLoad) {
            setInitialLoad(false);
          }
          isFetchingRef.current = false;
        }
      }
    }, fetchKey); // Close deduplicate call
  }, [
    page,
    rowPerPage,
    userId,
    companyId,
    filterPreferences,
    filterData,
    initialLoad,
    t,
    deduplicate,
    onTotalCountChange,
  ]);
  // Store fetchQuotes in a ref to avoid dependency issues
  const fetchQuotesRef = useRef(fetchQuotes);
  useEffect(() => {
    fetchQuotesRef.current = fetchQuotes;
  }, [fetchQuotes]);

  useEffect(() => {
    if (userId !== undefined && companyId !== undefined) {
      fetchQuotesRef.current();
    }
  }, [userId, companyId]);

  // Fetch quotes after navigation completes - ensures instant navigation
  // This is the primary fetch mechanism - it handles both initial load and navigation
  usePostNavigationFetch(() => {
    if (userId && companyId && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchQuotesRef.current();
    }
  }, [userId, companyId]); // Removed fetchQuotes from deps to prevent re-triggers

  // Fallback useEffect to ensure fetch happens on page reload when user data becomes available
  // This handles the case where usePostNavigationFetch doesn't trigger on reload
  useEffect(() => {
    if (user?.userId && user?.companyId && !hasInitialFetchedRef.current) {
      // Add a small delay to ensure usePostNavigationFetch has a chance to run first
      const timer = setTimeout(() => {
        if (!hasInitialFetchedRef.current) {
          hasInitialFetchedRef.current = true;
          fetchQuotesRef.current();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user?.userId, user?.companyId]);

  // Trigger fetch when page or rowPerPage changes (only after initial load)
  useEffect(() => {
    if (userId && companyId && hasInitialFetchedRef.current) {
      fetchQuotesRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowPerPage]);
  useEffect(() => {
    if (userId && companyId) {
      hasInitialFetchedRef.current = true;
    }
  }, [userId, companyId]);
  // Trigger fetch when filterData changes (only after initial load)
  useEffect(() => {
    if (userId && companyId && hasInitialFetchedRef.current) {
      fetchQuotesRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData]);

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Cleanup on unmount to prevent stuck loading states
  useEffect(() => {
    return () => {
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Reset fetching state
      isFetchingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchQuotesRef.current();
      toast.success(t("quotesRefreshed"));
    }
  }, [refreshTrigger, t]);

  // Cleanup: abort any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
        [t("accountName")]: q.sellerCompanyName || "",
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
    } catch {
      toast.error(t("filterSaveFailed"));
    }
  };

  const handlePrevious = () => {
    setPage(prev => prev - 1);
    // Reset scroll to top and left with smooth behavior
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    // Also reset window scroll
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    setPage(prev => prev + 1);
    // Reset scroll to top and left with smooth behavior
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    // Also reset window scroll
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
        userId={userId}
        companyId={companyId}
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
          <p className="text-muted-foreground">{t("addNewQuoteDescription")}</p>
        </div>
      </SideDrawer>

      <div className="flex flex-col max-md:w-full">
        <div className="w-full overflow-x-hidden max-md:overflow-x-visible">
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scrollbar-thin-horizontal max-md:overflow-x-visible"
          >
            {loading ? (
              <>
                {/* Desktop Skeleton */}
                <div className="hidden md:block">
                <DashboardTable
                data={[]}
                columns={columns}
                loading={true}
                totalDataCount={totalCount}
                pagination={pagination}
                setPagination={handlePaginationChange}
                setPage={setPage}
                pageOptions={[20, 50, 75, 100]}
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
                    tableHeight="h-[calc(103vh-180px)]"
                  />
                </div>
                {/* Mobile Skeleton */}
                <div className="md:hidden">
                  <MobileLandingCards
                    items={[]}
                    loading={true}
                    renderCard={() => null}
                    skeletonCount={rowPerPage}
                  />
                   <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
                      <div className="flex items-center justify-center px-4 py-3">
                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                          <button
                           
                            disabled={true}
                            className="px-3 py-2 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors min-h-[44px] flex items-center justify-center"
                            aria-label="Previous page"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                          </button>
                          <span className="text-xs text-muted-foreground px-2 min-w-[80px] text-center">
                           <Skeleton className="h-4 w-16" />
                          </span>
                          <button
                          
                            disabled={true}
                            className="px-3 py-2 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors min-h-[44px] flex items-center justify-center"
                            aria-label="Next page"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
              </>
            ) : quotes.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                {t("noQuotes")}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
              <DashboardTable
                data={quotes}
                columns={columns}
                loading={false}
                totalDataCount={totalCount}
                pagination={pagination}
                setPagination={handlePaginationChange}
                setPage={setPage}
                pageOptions={[20, 50, 75, 100]}
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
                    tableHeight="h-[calc(103vh-180px)]"
                  />
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden relative">
                  {/* Scrollable Cards Area with bottom padding for fixed bar */}
                  <div className="pb-20">
                    <MobileLandingCards
                      items={quotes}
                      loading={false}
                      renderCard={(quote) => (
                        <QuoteMobileCard
                          quote={quote}
                          onClick={() => {
                            if (quote.quotationIdentifier) {
                              router.push(
                                `/details/quoteDetails/${quote.quotationIdentifier}`
                              );
                            }
                          }}
                        />
                      )}
                      emptyMessage={t("noQuotes")}
                      skeletonCount={rowPerPage}
                    />
                  </div>
                  
                  {/* Fixed Bottom Bar with Pagination Only */}
                  {totalCount > rowPerPage && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
                      <div className="flex items-center justify-center px-4 py-3">
                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handlePrevious();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={page === 0}
                            className="px-3 py-2 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors min-h-[44px] flex items-center justify-center"
                            aria-label="Previous page"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                          </button>
                          <span className="text-xs text-muted-foreground px-2 min-w-[80px] text-center">
                            {page + 1} / {Math.ceil(totalCount / rowPerPage)}
                          </span>
                          <button
                            onClick={() => {
                              handleNext();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={(page + 1) * rowPerPage >= totalCount}
                            className="px-3 py-2 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors min-h-[44px] flex items-center justify-center"
                            aria-label="Next page"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default QuotesLandingTable;
