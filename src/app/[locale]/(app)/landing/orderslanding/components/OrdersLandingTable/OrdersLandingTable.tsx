"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import ordersFilterService, {
  OrderFilter,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
import { type Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import { OrdersLandingTableProps } from "@/app/[locale]/(app)/landing/orderslanding/types/ordertypes";

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

// Table Skeleton Component
const TableSkeleton = ({ rows = 10 }: { rows?: number }) => {
  const t = useTranslations("orders");
  return (
    <div className="rounded-md border shadow-sm overflow-hidden flex flex-col">
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex font-medium text-sm text-gray-700">
          <div className="px-2 py-3 w-[150px]">{t("orderId")}</div>
          <div className="px-2 py-3 w-[200px]">{t("orderName")}</div>
          <div className="px-2 py-3 w-[150px]">{t("orderDate")}</div>
          <div className="px-2 py-3 w-[150px]">{t("date")}</div>
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
            className="border-b border-gray-100 flex "
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
};

function OrdersLandingTable({
  refreshTrigger,
  setExportCallback,
}: OrdersLandingTableProps) {
  const { user } = useCurrentUser();
  const { prefetch, prefetchMultiple, prefetchAndNavigate } =
    useRoutePrefetch();
  const t = useTranslations("orders");

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Order | null>(
    null
  );

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
        accessorKey: "lastModifiedDate",
        header: t("date"),
        size: 150,
        cell: ({ row }) => formatDate(row.original.lastUpdatedDate),
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
        accessorKey: "status",
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
        cell: ({ row }) => formatDate(row.original.requiredDate),
      },
    ],
    [t]
  );
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
    if (!user?.userId || !user?.companyId) {
      setOrders([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

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

      setOrders(ordersData);
      setTotalCount(totalCountData);
    } catch {
      toast.error(t("failedToFetch"));
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [
    user?.userId,
    user?.companyId,
    page,
    rowPerPage,
    filterData,
    createFilterFromData,
    initialLoad,
    t,
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
        // await loadFilterPreferences(); // Temporarily removed
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchOrders();
      toast.success(t("ordersRefreshed"));
    }
  }, [refreshTrigger, fetchOrders, t]);
  const handlePrevious = () => {
    setPage(prev => prev - 1);
  };

  const handleNext = () => {
    setPage(prev => prev + 1);
  };

  // Prefetch routes for visible orders (only first page for performance)
  // More aggressive prefetching happens on hover
  useEffect(() => {
    if (orders.length > 0 && !loading && page === 0) {
      // Only prefetch first 10 orders on initial load to avoid overwhelming
      const routes = orders
        .slice(0, 10)
        .map(order => order.orderIdentifier)
        .filter((id): id is string => Boolean(id))
        .map(id => `/details/orderDetails/${id}`);
      if (routes.length > 0) {
        prefetchMultiple(routes, 5);
      }
    }
  }, [orders, loading, page, prefetchMultiple]);

  // Handle row hover to prefetch route
  const handleRowHover = useCallback(
    (row: Order) => {
      if (row.orderIdentifier) {
        prefetch(`/details/orderDetails/${row.orderIdentifier}`);
      }
    },
    [prefetch]
  );

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
          <p className="text-gray-600">{t("addNewOrderDescription")}</p>
        </div>
      </SideDrawer>

      <div className="flex flex-col">
        <div className="w-full overflow-x-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin-horizontal">
            {initialLoad && loading ? (
              <TableSkeleton rows={rowPerPage} />
            ) : !initialLoad && orders.length === 0 ? (
              <div className="flex items-center justify-center text-gray-500 py-8">
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
                    prefetchAndNavigate(`/details/orderDetails/${orderId}`);
                  }
                }}
                onRowHover={handleRowHover}
                tableHeight=""
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
            <div className="text-center text-gray-500 py-8">
              {t("noItemsToDisplay")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersLandingTable;
