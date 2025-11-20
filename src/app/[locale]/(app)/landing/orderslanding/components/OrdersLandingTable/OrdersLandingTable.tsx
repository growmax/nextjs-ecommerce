"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import ordersFilterService, {
  OrderFilter,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
import { type Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { OrdersLandingTableProps } from "../../types/ordertypes";

// Helper functions
const formatDate = (date: string | null | undefined): string =>
  date ? new Date(date).toLocaleDateString() : "-";

const formatCurrency = (
  amount: number | null | undefined,
  symbol?: string
): string => `${symbol || "USD"} ${Number(amount || 0).toLocaleString()}`;

const convertDateToString = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";
  return date instanceof Date
    ? date.toISOString().split("T")[0] || ""
    : String(date);
};

// Table Skeleton Component
const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
  <div className="rounded-md border shadow-sm overflow-hidden flex flex-col">
    <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <div className="flex font-medium text-sm text-gray-700">
        <div className="px-2 py-3 w-[150px]">Order Id</div>
        <div className="px-2 py-3 w-[200px]">Order Name</div>
        <div className="px-2 py-3 w-[150px]">Order Date</div>
        <div className="px-2 py-3 w-[150px]">Date</div>
        <div className="px-2 py-3 w-[300px]">Account Name</div>
        <div className="px-2 py-3 w-[150px]">Total Items</div>
        <div className="px-2 py-3 w-[150px]">Sub total</div>
        <div className="px-2 py-3 w-[150px]">TaxableAmount</div>
        <div className="px-2 py-3 w-[150px]">Total</div>
        <div className="px-2 py-3 w-[200px]">Status</div>
        <div className="px-2 py-3 w-[150px]">Required Date</div>
      </div>
    </div>
    <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="border-b border-gray-100 flex ">
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

function OrdersLandingTable({
  refreshTrigger,
  setExportCallback,
}: OrdersLandingTableProps) {
  const { user } = useCurrentUser();
  const { prefetch, prefetchMultiple, prefetchAndNavigate } =
    useRoutePrefetch();

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
        header: () => <span className="pl-2">Order Id</span>,
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
        header: () => <span className="pl-2">Order Name</span>,
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
        header: "Date",
        size: 150,
        cell: ({ row }) => formatDate(row.original.lastUpdatedDate),
      },
      {
        accessorKey: "orderDate",
        header: "Order Date",
        size: 150,
        cell: ({ row }) => formatDate(row.original.createdDate),
      },

      {
        accessorKey: "accountName",
        header: "Account Name",
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
        header: "Total Items",
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
        header: "Sub total",
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) =>
          formatCurrency(
            row.original.subTotal,
            row.original.currencySymbol?.symbol
          ),
      },
      {
        accessorKey: "taxableAmount",
        header: "TaxableAmount",
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) =>
          formatCurrency(
            row.original.taxableAmount,
            row.original.currencySymbol?.symbol
          ),
      },
      {
        accessorKey: "grandTotal",
        header: "Total",
        size: 150,
        meta: {
          alignRight: true,
        },
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(
              row.original.grandTotal,
              row.original.currencySymbol?.symbol
            )}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span className="pl-[30px]">Status</span>,
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
        header: "Required Date",
        size: 150,
        cell: ({ row }) => formatDate(row.original.requiredDate),
      },
    ],
    []
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
      toast.error("Failed to fetch orders");
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
  ]);

  // Export functionality
  const handleExport = useCallback(async () => {
    if (orders.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const exportData = orders.map(order => ({
        "Order Id": order.orderIdentifier || "-",
        "Order Name": order.orderName || "-",
        "Order Date": formatDate(order.createdDate),
        "Last Modified Date": formatDate(order.lastUpdatedDate),
        "Account Name": order.sellerCompanyName || "-",
        "Total Items": order.itemcount || 0,
        "Sub Total": formatCurrency(
          order.subTotal,
          order.currencySymbol?.symbol
        ),
        "Taxable Amount": formatCurrency(
          order.taxableAmount,
          order.currencySymbol?.symbol
        ),
        "Grand Total": formatCurrency(
          order.grandTotal,
          order.currencySymbol?.symbol
        ),
        Status: order.updatedBuyerStatus || "-",
        "Required Date": formatDate(order.requiredDate),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = Array.from({ length: 11 }, () => ({ wch: 15 }));
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(
        wb,
        `orders_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Export completed successfully!");
    } catch {
      toast.error("Failed to export orders");
    }
  }, [orders]);

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
        toast.error("User information not available");
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
        toast.success("Filter saved successfully!");
      } catch {
        toast.error("Failed to save filter");
      }
    },
    [user?.userId, user?.companyId, createFilterFromData]
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
      toast.success("Orders refreshed");
    }
  }, [refreshTrigger, fetchOrders]);
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
          toast.success("Filters applied successfully!");
        }}
        onReset={() => {
          setFilterData(null);
          setPage(0);
          toast.success("Filters reset successfully!");
        }}
        onSave={handleSaveFilter}
        title="Order Filters"
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
        title="Add New Order"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Add new order functionality will be implemented here.
          </p>
        </div>
      </SideDrawer>

      <div className="flex flex-col">
        <div className="w-full overflow-x-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin-horizontal">
            {initialLoad && loading ? (
              <TableSkeleton rows={rowPerPage} />
            ) : !initialLoad && orders.length === 0 ? (
              <div className="flex items-center justify-center text-gray-500 py-8">
                No orders found
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
            <DialogTitle>Order Items</DialogTitle>
            <DialogDescription>
              {selectedOrderItems &&
                `Order ID: ${selectedOrderItems.orderIdentifier} - ${selectedOrderItems.orderName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center text-gray-500 py-8">
              No items to display
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersLandingTable;
