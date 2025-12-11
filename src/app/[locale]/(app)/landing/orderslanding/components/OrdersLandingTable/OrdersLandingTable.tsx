"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import PricingFormat from "@/components/PricingFormat";
import DashboardTable from "@/components/custom/DashBoardTable";
import SideDrawer from "@/components/custom/sidedrawer";
import { MobileLandingCards } from "@/components/landing/MobileLandingCards";
import { OrderMobileCard } from "@/components/landing/OrderMobileCard";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderItemsPopover } from "./OrderItemsPopover";

import { statusColor } from "@/components/custom/statuscolors";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import { usePostNavigationFetch } from "@/hooks/usePostNavigationFetch";
import { useRequestDeduplication } from "@/hooks/useRequestDeduplication";
import ordersFilterService, {
  OrderFilter,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
import { cn } from "@/lib/utils";
import { type Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import { OrdersLandingTableProps } from "../../types/ordertypes";

// Helper functions
const formatDate = (date: string | null | undefined): string =>
  date ? new Date(date).toLocaleDateString() : "-";

const convertDateToString = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";
  return date instanceof Date
    ? date.toISOString().split("T")[0] || ""
    : String(date);
};

function OrdersLandingTable({
  setExportCallback,
  onTotalCountChange,
  onLoadingChange,
}: OrdersLandingTableProps) {
  // Use the page loader hook to ensure navigation spinner is hidden immediately
  usePageLoader();

  const { user } = useCurrentUser();
  const router = useNavigationWithLoader();
  const t = useTranslations("orders");
  const { deduplicate } = useRequestDeduplication();
  const userId = user?.userId;
  const companyId = user?.companyId;
  // Refs to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialFetchedRef = useRef(false);

  // Ref for scrollable container to reset scroll position
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(16);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Define table columns first (needed for skeleton)
  // Define table columns first (needed for skeleton)
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderIdentifier",
        header: () => <span className="pl-4">{t("orderId")}</span>,
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
            {row.original.orderIdentifier || "-"}
          </div>
        ),
      },
      {
        accessorKey: "orderName",
        header: () => <span className="pl-4">{t("orderName")}</span>,
        size: 200,
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate pl-4"
            title={row.original.orderName || "-"}
          >
            {row.original.orderName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
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
        accessorKey: "orderDate",
        header: () => <span className="pl-4">{t("orderDate")}</span>,
        size: 150,
        cell: ({ row }) => (
          <div
            className="max-w-[300px] pl-4"
            title={formatDate(row.original.createdDate) || "-"}
          >
            {formatDate(row.original.createdDate) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "accountName",
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
        accessorKey: "totalItems",
        header: t("totalItems"),
        size: 150,
        meta: {
          alignCenter: true,
        },
        cell: ({ row }) => {
          const items = row.original.itemcount || 0;
          return (
            <OrderItemsPopover
              orderIdentifier={row.original.orderIdentifier}
              itemCount={items}
            />
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
              {...(row.original.currencySymbol && {
                buyerCurrency: row.original.currencySymbol,
              })}
              value={row.original.subTotal || 0}
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
              {...(row.original.currencySymbol && {
                buyerCurrency: row.original.currencySymbol,
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
              {...(row.original.currencySymbol && {
                buyerCurrency: row.original.currencySymbol,
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
    const tableHeight = "h-[calc(103vh-180px)]";

    // Map accessorKey to translation key for function headers
    const getHeaderText = (column: ColumnDef<Order>) => {
      if (typeof column.header === "string") {
        return column.header;
      }
      if (typeof column.header === "function") {
        // Map accessorKey to translation keys for function headers
        const headerMap: Record<string, string> = {
          orderIdentifier: t("orderId"),
          orderName: t("orderName"),
          status: t("status"),
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
  // Create filter from form data
  const createFilterFromData = useCallback(
    (
      filterData: QuoteFilterFormData,
      calculatedOffset: number
    ): OrderFilter => ({
      filter_index: 1,
      filter_name: "Order Filter",
      endCreatedDate: convertDateToString(filterData?.lastUpdatedDateEnd) || "",
      endDate: convertDateToString(filterData?.quotedDateEnd) || "",
      endValue: filterData?.subtotalEnd
        ? parseFloat(filterData.subtotalEnd)
        : null,
      endTaxableAmount: filterData?.taxableEnd
        ? parseFloat(filterData.taxableEnd)
        : null,
      endGrandTotal: filterData?.totalEnd
        ? parseFloat(filterData.totalEnd)
        : null,
      identifier: filterData?.quoteId || "",
      limit: rowPerPage,
      offset: page,
      name: filterData?.quoteName || "",
      pageNumber: Math.floor(calculatedOffset / rowPerPage) + 1,
      startDate: convertDateToString(filterData?.quotedDateStart) || "",
      startCreatedDate:
        convertDateToString(filterData?.lastUpdatedDateStart) || "",
      startValue: filterData?.subtotalStart
        ? parseFloat(filterData.subtotalStart)
        : null,
      startTaxableAmount: filterData?.taxableStart
        ? parseFloat(filterData.taxableStart)
        : null,
      startGrandTotal: filterData?.totalStart
        ? parseFloat(filterData.totalStart)
        : null,
      status: Array.isArray(filterData.status)
        ? filterData.status
        : filterData.status
          ? [filterData.status]
          : [],
      selectedColumns: [
        "createdDate",
        "sellerCompanyName",
        "itemcount",
        "subTotal",
        "grandTotal",
        "updatedBuyerStatus",
        "taxableAmount",
        "orderIdentifier",
        "orderName",
        "lastUpdatedDate",
      ],
      columnWidth: [
        { id: "orderName", width: 210 },
        { id: "orderIdentifier", width: 240 },
        { id: "createdDate", width: 200 },
        { id: "lastUpdatedDate", width: 200 },
        { id: "sellerCompanyName", width: 260 },
        { id: "itemcount", width: 160 },
        { id: "subTotal", width: 225 },
        { id: "taxableAmount", width: 245 },
        { id: "grandTotal", width: 245 },
        { id: "updatedBuyerStatus", width: 270 },
      ],
      columnPosition:
        '["orderName","lastUpdatedDate","orderIdentifier","createdDate","sellerCompanyName","itemcount","subTotal","taxableAmount","grandTotal","updatedBuyerStatus"]',
      accountId: [],
      accountOwners: [],
      approvalAwaiting: [],
      quoteUsers: [],
      tagsList: [],
      options: ["ByBranch"],
      branchId: [],
      businessUnitId: [],
      userDisplayName: "",
      userStatus: [],
    }),
    [rowPerPage, page]
  );

  // Fetch orders

  const fetchOrders = useCallback(async () => {
    console.log(userId, companyId);

    const fetchKey = `orders-${JSON.stringify({
      page,
      rowPerPage,
      userId,
      companyId,
      filterData,
    })}`;

    return deduplicate(async () => {
      // If same request already running → skip
      if (isFetchingRef.current && lastFetchParamsRef.current === fetchKey) {
        return;
      }

      // Abort any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      isFetchingRef.current = true;
      lastFetchParamsRef.current = fetchKey;
      setLoading(true);

      // Timeout fallback
      const timeoutId = setTimeout(() => {
        if (!signal.aborted) {
          controller.abort();
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

        const offset = page;
        let response: any;

        // SIMPLE STATUS FILTER
        const isSimpleStatus =
          filterData &&
          filterData.status?.length === 1 &&
          (Object.keys(filterData) as Array<keyof typeof filterData>).every(
            k => k === "status" || !filterData[k] // all others undefined/falsy
          );

        if (!filterData) {
          response = await ordersFilterService.getAllOrders(
            userId,
            companyId,
            offset,
            rowPerPage
          );
        } else if (
          isSimpleStatus &&
          filterData.status &&
          filterData.status.length > 0
        ) {
          const statusValue = Array.isArray(filterData.status)
            ? filterData.status[0]
            : filterData.status;
          if (statusValue) {
            response = await ordersFilterService.getOrdersByStatus(
              userId,
              companyId,
              statusValue,
              offset,
              rowPerPage
            );
          }
        } else {
          const filter = createFilterFromData(filterData, offset);
          response = await ordersFilterService.getOrdersWithCustomFilters(
            userId,
            companyId,
            filter
          );
        }

        if (signal.aborted) return;

        const res = (response as any)?.data || response;

        const ordersList = res?.ordersResponse || res?.orders || [];

        const total = res?.totalOrderCount || res?.totalCount || 0;

        setOrders(ordersList);
        setTotalCount(total);
        onTotalCountChange?.(total);
      } catch (err: any) {
        if (err?.name === "AbortError") return;

        toast.error(t("failedToFetch"));
        setOrders([]);
        setTotalCount(0);
        onTotalCountChange?.(0);
      } finally {
        clearTimeout(timeoutId);

        if (abortControllerRef.current?.signal === signal) {
          isFetchingRef.current = false;
          setLoading(false);
          if (initialLoad) setInitialLoad(false);
        }
      }
    }, fetchKey);
  }, [
    userId,
    companyId,
    page,
    rowPerPage,
    filterData,
    createFilterFromData,
    deduplicate,
    t,
    onTotalCountChange,
    initialLoad,
  ]);
  // Store fetchOrders in a ref to avoid dependency issues
  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  useEffect(() => {
    if (userId !== undefined && companyId !== undefined) {
      fetchOrdersRef.current();
    }
  }, [userId, companyId]);
  useEffect(() => {
    if (userId && companyId && hasInitialFetchedRef.current) {
      fetchOrdersRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowPerPage]);
  useEffect(() => {
    if (userId && companyId && hasInitialFetchedRef.current) {
      setPage(0); // Reset to first page when filter changes
      fetchOrdersRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData]);
  // Export functionality
  const handleExport = useCallback(async () => {
    if (orders.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const exportData = orders.map(order => ({
        [t("orderId")]: order.orderIdentifier || "-",
        [t("orderName")]: order.orderName || "-",
        [t("orderDate")]: formatDate(order.createdDate),
        [t("lastModifiedDate")]: formatDate(order.lastUpdatedDate),
        [t("accountName")]: order.sellerCompanyName || "-",
        [t("totalItems")]: order.itemcount || 0,
        [t("subTotal")]: getAccounting(
          order.currencySymbol || null,
          order.subTotal || 0,
          order.currencySymbol || undefined
        ),
        [t("taxableAmount")]: getAccounting(
          order.currencySymbol || null,
          order.taxableAmount || 0,
          order.currencySymbol || undefined
        ),
        [t("grandTotal")]: getAccounting(
          order.currencySymbol || null,
          order.grandTotal || 0,
          order.currencySymbol || undefined
        ),
        [t("status")]: order.updatedBuyerStatus || "-",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = Array.from({ length: 10 }, () => ({ wch: 15 }));
      XLSX.utils.book_append_sheet(wb, ws, t("title"));
      XLSX.writeFile(
        wb,
        `orders_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success(t("exportCompleted"));
    } catch {
      toast.error(t("exportFailed"));
    }
  }, [orders, t]);

  // Event handlers
  const handlePaginationChange = useCallback(
    (
      value:
        | { pageIndex: number; pageSize: number }
        | ((prev: { pageIndex: number; pageSize: number }) => {
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

  const handleSaveFilter = useCallback(
    async (filterData: QuoteFilterFormData) => {
      if (!userId || !companyId) {
        toast.error(t("userInfoNotAvailable"));
        return;
      }

      try {
        const filter = createFilterFromData(filterData, 0);

        await ordersFilterService.saveCustomOrderFilter(
          userId,
          companyId,
          filter
        );
        toast.success(t("filterSaved"));
      } catch {
        toast.error(t("filterSaveFailed"));
      }
    },
    [userId, companyId, createFilterFromData, t]
  );

  // Effects
  useEffect(() => {
    setPagination({ pageIndex: page, pageSize: rowPerPage });
  }, [page, rowPerPage]);

  useEffect(() => {
    setExportCallback?.(() => handleExport);
  }, [handleExport, setExportCallback]);

  // Fetch orders after navigation completes - ensures instant navigation
  // This is the primary fetch mechanism - it handles both initial load and navigation
  usePostNavigationFetch(() => {
    if (userId && companyId && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchOrdersRef.current();
    }
  }, [userId, companyId]); // Removed fetchOrders from deps to prevent re-triggers

  // Fallback useEffect to ensure fetch happens on page reload when user data becomes available
  // This handles the case where usePostNavigationFetch doesn't trigger on reload
  useEffect(() => {
    if (user?.userId && user?.companyId && !hasInitialFetchedRef.current) {
      // Add a small delay to ensure usePostNavigationFetch has a chance to run first
      const timer = setTimeout(() => {
        if (!hasInitialFetchedRef.current) {
          hasInitialFetchedRef.current = true;
          fetchOrdersRef.current();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user?.userId, user?.companyId]);

  // Trigger fetch when page or rowPerPage changes (only after initial load)

  // Trigger fetch when filterData changes (only after initial load)

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
    if (userId && companyId) {
      hasInitialFetchedRef.current = true;
    }
  }, [userId, companyId]);

  // Cleanup: abort any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
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
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={data => {
          setFilterData(data);
          setPage(0);
          toast.success(t("filtersApplied"));
        }}
        onReset={() => {
          setFilterData(null);
          setPage(0);
          toast.success(t("filtersReset"));
        }}
        onSave={handleSaveFilter}
        title={t("orderFilters")}
        filterType="Order"
        activeTab="all"
        userId={userId}
        companyId={companyId}
        module="order"
        initialFilterData={undefined}
        mode="filter"
      />

      <SideDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={t("addNewOrder")}
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">{t("addNewOrderDescription")}</p>
        </div>
      </SideDrawer>

      <div className="flex flex-col">
        <div className="w-full overflow-x-hidden">
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scrollbar-thin-horizontal"
          >
            {loading ? (
              <>
                {/* Desktop Skeleton */}
                <div className="hidden md:block">
                  <TableSkeleton rows={rowPerPage} />
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
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                {t("noOrders")}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <DashboardTable
                    data={orders}
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
                      const orderId = row.orderIdentifier;
                      if (orderId) {
                        router.push(`/details/orderDetails/${orderId}`);
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
                      items={orders}
                      loading={false}
                      renderCard={(order) => (
                        <OrderMobileCard
                          order={order}
                          onClick={() => {
                            if (order.orderIdentifier) {
                              router.push(
                                `/details/orderDetails/${order.orderIdentifier}`
                              );
                            }
                          }}
                        />
                      )}
                      emptyMessage={t("noOrders")}
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

export default OrdersLandingTable;
