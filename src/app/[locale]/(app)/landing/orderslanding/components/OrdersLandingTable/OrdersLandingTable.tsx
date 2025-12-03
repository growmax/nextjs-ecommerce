"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import PricingFormat from "@/components/PricingFormat";
import DashboardTable from "@/components/custom/DashBoardTable";
import SideDrawer from "@/components/custom/sidedrawer";
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
  refreshTrigger,
  setExportCallback,
  onTotalCountChange,
}: OrdersLandingTableProps) {
  // Use the page loader hook to ensure navigation spinner is hidden immediately
  usePageLoader();

  const { user } = useCurrentUser();
  const router = useNavigationWithLoader();
  const t = useTranslations("orders");
  const { deduplicate } = useRequestDeduplication();

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
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Order | null>(
    null
  );

  // Define table columns first (needed for skeleton)
  // Define table columns first (needed for skeleton)
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderIdentifier",
        header: () => <span className="pl-2">{t("orderId")}</span>,
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
            {row.original.orderIdentifier || "-"}
          </div>
        ),
      },
      {
        accessorKey: "orderName",
        header: () => <span className="pl-2">{t("orderName")}</span>,
        size: 200,
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate pl-2"
            title={row.original.orderName || "-"}
          >
            {row.original.orderName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span className="pl-[30px]">{t("status")}</span>,
        size: 200,
        cell: ({ row }) => {
          const status = row.original.updatedBuyerStatus;
          if (!status)
            return <span className="text-muted-foreground pl-[30px]">-</span>;
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
        header: t("orderDate"),
        size: 150,
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        accessorKey: "accountName",
        header: t("accountName"),
        size: 300,
        cell: ({ row }) => (
          <div
            className="max-w-[300px]"
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
            <button
              onClick={e => {
                e.stopPropagation();
                setSelectedOrderItems(row.original);
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
            {...(row.original.currencySymbol && {
              buyerCurrency: row.original.currencySymbol,
            })}
            value={row.original.subTotal || 0}
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
            {...(row.original.currencySymbol && {
              buyerCurrency: row.original.currencySymbol,
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
              {...(row.original.currencySymbol && {
                buyerCurrency: row.original.currencySymbol,
              })}
              value={row.original.grandTotal || 0}
            />
          </span>
        ),
      },
      {
        accessorKey: "requiredDate",
        header: t("requiredDate"),
        size: 150,
        cell: ({ row }) => formatDate(row.original.requiredDate),
      },
    ],
    [t]
  );

  // Generate skeleton based on actual columns - matches DashboardTable structure exactly
  const TableSkeleton = ({ rows = 10 }: { rows?: number }) => {
    const columnCount = columns.length;
    const tableHeight = "h-[calc(103vh-180px)]";
    return (
      <div
        className={cn(
          "border overflow-x-hidden flex flex-col w-full z-0",
          tableHeight
        )}
        style={{
          borderRadius: "var(--radius)",
        }}
      >
        {/* Scrollable Table Container - Header and Body together */}
        <div
          className={cn(
            "overflow-x-auto overflow-y-auto relative scrollbar-thin-horizontal",
            "flex-1"
          )}
        >
          {/* Table structure matching DashboardTable */}
          <div className="min-w-full">
            {/* Table Header */}
            <div className="border-b border-border bg-muted sticky top-0 z-20">
              <div className="flex font-medium text-sm text-foreground">
                {columns.map((column, index) => {
                  const width = column.size || 150;
                  const headerContent =
                    typeof column.header === "function"
                      ? "" // Skeleton placeholder - header function requires context
                      : column.header || "";
                  return (
                    <div
                      key={index}
                      className={cn(
                        "px-2 py-3 border-r border-border",
                        index === columnCount - 1 && "border-r-0"
                      )}
                      style={{ width: `${width}px`, minWidth: `${width}px` }}
                    >
                      {headerContent}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Table Body - Only values show skeleton */}
            <div>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="border-b border-border flex"
                >
                  {columns.map((column, colIndex) => {
                    const width = column.size || 150;
                    const alignCenter = (column.meta as any)?.alignCenter;
                    const alignRight = (column.meta as any)?.alignRight;
                    return (
                      <div
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={cn(
                          "px-2 py-3 flex items-center border-r border-border",
                          colIndex === columnCount - 1 && "border-r-0",
                          alignCenter && "justify-center",
                          alignRight && "justify-end"
                        )}
                        style={{ width: `${width}px`, minWidth: `${width}px` }}
                      >
                        <Skeleton className="h-4 w-3/4 bg-muted" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Pagination Footer - matches DashboardTable */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-background rounded-b-lg flex-shrink-0">
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
        "requiredDate",
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
        { id: "requiredDate", width: 260 },
      ],
      columnPosition:
        '["orderName","lastUpdatedDate","orderIdentifier","createdDate","sellerCompanyName","itemcount","subTotal","taxableAmount","grandTotal","updatedBuyerStatus","requiredDate"]',
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
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      // Keep loading true while waiting for user data
      return;
    }

    // Create a unique key for this fetch request
    const fetchKey = `orders-${JSON.stringify({
      page,
      rowPerPage,
      userId: user.userId,
      companyId: user.companyId,
      filterData,
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

      const calculatedOffset = page;
      const userId = parseInt(user.userId.toString());
      const companyId = parseInt(user.companyId.toString());

      try {
        let response;

        if (filterData) {
          const isSimpleStatusFilter =
            filterData.status &&
            filterData.status.length === 1 &&
            !filterData.quoteId &&
            !filterData.quoteName &&
            !filterData.quotedDateStart &&
            !filterData.quotedDateEnd &&
            !filterData.lastUpdatedDateStart &&
            !filterData.lastUpdatedDateEnd &&
            !filterData.subtotalStart &&
            !filterData.subtotalEnd &&
            !filterData.taxableStart &&
            !filterData.taxableEnd &&
            !filterData.totalStart &&
            !filterData.totalEnd;

          if (isSimpleStatusFilter) {
            const status = filterData.status?.[0];
            if (status) {
              response = await ordersFilterService.getOrdersByStatus(
                userId,
                companyId,
                status,
                calculatedOffset,
                rowPerPage
              );
            } else {
              throw new Error("Status is undefined");
            }
          } else {
            const filter = createFilterFromData(filterData, calculatedOffset);
            response = await ordersFilterService.getOrdersWithCustomFilters(
              userId,
              companyId,
              filter
            );
          }
        } else {
          response = await ordersFilterService.getAllOrders(
            userId,
            companyId,
            calculatedOffset,
            rowPerPage
          );
        }

        const apiResponse = response as {
          data?: {
            ordersResponse?: Order[];
            orders?: Order[];
            totalOrderCount?: number;
            totalCount?: number;
          };
          ordersResponse?: Order[];
          orders?: Order[];
          totalOrderCount?: number;
          totalCount?: number;
        };

        const ordersData =
          apiResponse.data?.ordersResponse ||
          apiResponse.data?.orders ||
          apiResponse.ordersResponse ||
          apiResponse.orders ||
          [];
        const totalCountData =
          apiResponse.data?.totalOrderCount ||
          apiResponse.data?.totalCount ||
          apiResponse.totalOrderCount ||
          apiResponse.totalCount ||
          0;

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          setOrders(ordersData);
          setTotalCount(totalCountData);
          onTotalCountChange?.(totalCountData);
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
          setOrders([]);
          setTotalCount(0);
          onTotalCountChange?.(0);
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
    user?.userId,
    user?.companyId,
    page,
    rowPerPage,
    filterData,
    createFilterFromData,
    initialLoad,
    t,
    deduplicate,
    onTotalCountChange,
  ]);

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
        [t("requiredDate")]: formatDate(order.requiredDate),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = Array.from({ length: 11 }, () => ({ wch: 15 }));
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
      if (!user?.userId || !user?.companyId) {
        toast.error(t("userInfoNotAvailable"));
        return;
      }

      try {
        const userId = parseInt(user.userId.toString());
        const companyId = parseInt(user.companyId.toString());
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
    [user?.userId, user?.companyId, createFilterFromData, t]
  );

  // Effects
  useEffect(() => {
    setPagination({ pageIndex: page, pageSize: rowPerPage });
  }, [page, rowPerPage]);

  useEffect(() => {
    setExportCallback?.(() => handleExport);
  }, [handleExport, setExportCallback]);

  // Store fetchOrders in a ref to avoid dependency issues
  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => {
    fetchOrdersRef.current = fetchOrders;
  }, [fetchOrders]);

  // Fetch orders after navigation completes - ensures instant navigation
  // This is the primary fetch mechanism - it handles both initial load and navigation
  usePostNavigationFetch(() => {
    if (user?.userId && user?.companyId && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchOrdersRef.current();
    }
  }, [user?.userId, user?.companyId]); // Removed fetchOrders from deps to prevent re-triggers

  // Trigger fetch when page or rowPerPage changes (only after initial load)
  useEffect(() => {
    if (
      user?.userId &&
      user?.companyId &&
      !initialLoad &&
      hasInitialFetchedRef.current
    ) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowPerPage]);

  // Trigger fetch when filterData changes (only after initial load)
  useEffect(() => {
    if (
      user?.userId &&
      user?.companyId &&
      !initialLoad &&
      hasInitialFetchedRef.current
    ) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterData]);

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
      fetchOrders();
      toast.success(t("ordersRefreshed"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, t]);

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
        userId={user?.userId}
        companyId={user?.companyId}
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
              <TableSkeleton rows={rowPerPage} />
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                {t("noOrders")}
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("orderItems")}</DialogTitle>
            <DialogDescription>
              {selectedOrderItems &&
                t("orderItemsDescription", {
                  orderId: selectedOrderItems.orderIdentifier,
                  orderName: selectedOrderItems.orderName,
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center text-muted-foreground py-8">
              {t("noItemsToDisplay")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersLandingTable;
