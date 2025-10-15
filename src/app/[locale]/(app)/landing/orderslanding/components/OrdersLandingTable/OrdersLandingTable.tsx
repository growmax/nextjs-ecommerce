"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import DashboardTable from "@/components/custom/DashBoardTable";
import { FilterTabs } from "@/components/custom/FilterTabs";
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
import ordersFilterService, {
  OrderFilter,
} from "@/lib/api/services/OrdersFilterService";
import orderService, { OrdersParams } from "@/lib/api/services/OrdersService";
import PreferenceService, {
  FilterPreference,
  FilterPreferenceResponse,
} from "@/lib/api/services/PreferenceService";
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
  <div className="rounded-md border shadow-sm overflow-hidden h-full flex flex-col">
    <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <div className="flex">
        {Array.from({ length: 11 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`header-${index}`} className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 overflow-auto">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={`row-${rowIndex}`}
          className="border-b border-gray-100 flex animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: `${rowIndex * 50}ms` }}
        >
          {Array.from({ length: 11 }).map((_, colIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="px-1 sm:px-2 py-1 w-[150px]"
            >
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="flex items-center justify-end gap-4 px-4 py-2 border-t bg-gray-50/50 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-6 h-6" />
      </div>
    </div>
  </div>
);

function OrdersLandingTable({
  refreshTrigger,
  setExportCallback,
}: OrdersLandingTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"filter" | "create">("filter");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
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
  const [selectedOrderItems, setSelectedOrderItems] = useState<Order | null>(
    null
  );

  // Table columns
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderIdentifier",
        header: () => <span className="pl-2">Order Id</span>,
        size: 150,
        cell: ({ row }) => (
          <span className="font-medium text-blue-600 pl-2">
            {row.original.orderIdentifier || "-"}
          </span>
        ),
      },
      {
        accessorKey: "orderName",
        header: "Order Name",
        size: 200,
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.original.orderName || "-"}
          >
            {row.original.orderName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "orderDate",
        header: "Order Date",
        size: 150,
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        accessorKey: "lastModifiedDate",
        header: "Date",
        size: 150,
        cell: ({ row }) => formatDate(row.original.lastUpdatedDate),
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
        header: "Status",
        size: 200,
        cell: ({ row }) => {
          const status = row.original.updatedBuyerStatus;
          if (!status) return <span className="text-gray-400">-</span>;
          const color = statusColor(status.toUpperCase());
          return (
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {status}
            </span>
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
      offset: calculatedOffset,
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
    [rowPerPage]
  );

  // Convert saved filter to form data
  const convertToFormData = useCallback(
    (filter: FilterPreference): QuoteFilterFormData => ({
      filterName: filter.filter_name || "",
      status: filter.status || [],
      quoteId: filter.identifier || "",
      quoteName: filter.name || "",
      quotedDateStart: filter.startDate
        ? new Date(filter.startDate)
        : undefined,
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
    }),
    []
  );

  // Load filter preferences
  const loadFilterPreferences = useCallback(async () => {
    try {
      const preferences =
        await PreferenceService.findFilterPreferences("order");
      setFilterPreferences(preferences);
      return preferences;
    } catch {
      return null;
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const calculatedOffset = page * rowPerPage;
      const userId = parseInt(user.userId.toString());
      const companyId = parseInt(user.companyId.toString());

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

      // Fallback to regular service
      try {
        const orderParams: OrdersParams = {
          userId: user.userId.toString(),
          companyId: user.companyId.toString(),
          offset: page * rowPerPage,
          limit: rowPerPage,
        };
        const fallbackResponse = await orderService.getOrders(orderParams);
        const fallbackData = fallbackResponse as {
          data?: {
            ordersResponse?: Order[];
            orders?: Order[];
            totalOrderCount?: number;
            totalCount?: number;
          };
        };
        setOrders(
          fallbackData.data?.ordersResponse || fallbackData.data?.orders || []
        );
        setTotalCount(
          fallbackData.data?.totalOrderCount ||
            fallbackData.data?.totalCount ||
            0
        );
      } catch {
        // If even fallback fails, keep empty state
      }
    } finally {
      setLoading(false);
    }
  }, [
    user?.userId,
    user?.companyId,
    page,
    rowPerPage,
    filterData,
    createFilterFromData,
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

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setPage(0);

      const currentTabs =
        !filterPreferences?.preference?.filters ||
        filterPreferences.preference.filters.length === 0
          ? [
              {
                id: "all",
                label: "All",
                hasFilter: true,
                isFilterActive: !!filterData,
                filterIndex: undefined,
              },
            ]
          : filterPreferences.preference.filters.map((filter, index) => ({
              id: `filter-${index}`,
              label: filter.filter_name,
              hasFilter: true,
              isFilterActive:
                filterPreferences.preference.selected === index || !!filterData,
              filterIndex: index,
            }));

      const selectedTab = currentTabs.find(tab => tab.id === value);
      if (
        selectedTab &&
        filterPreferences &&
        selectedTab.filterIndex !== undefined
      ) {
        const selectedFilter =
          filterPreferences.preference.filters[selectedTab.filterIndex];
        if (selectedFilter) {
          const formData = convertToFormData(selectedFilter);
          setFilterData(formData);
          toast.success(`Applied "${selectedTab.label}" filter successfully`);
        }
      } else {
        setFilterData(null);
        toast.success(`Switched to "${selectedTab?.label || "All"}" view`);
      }
    },
    [filterPreferences, filterData, convertToFormData]
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
        await loadFilterPreferences();
        toast.success("Filter saved successfully!");
      } catch {
        toast.error("Failed to save filter");
      }
    },
    [user?.userId, user?.companyId, createFilterFromData, loadFilterPreferences]
  );

  // Define tabs
  const tabs = useMemo(() => {
    if (
      !filterPreferences?.preference?.filters ||
      filterPreferences.preference.filters.length === 0
    ) {
      return [
        {
          id: "all",
          label: "All",
          hasFilter: true,
          isFilterActive: !!filterData,
          filterIndex: undefined,
        },
      ];
    }
    return filterPreferences.preference.filters.map((filter, index) => ({
      id: `filter-${index}`,
      label: filter.filter_name,
      hasFilter: true,
      isFilterActive:
        filterPreferences.preference.selected === index || !!filterData,
      filterIndex: index,
    }));
  }, [filterPreferences, filterData]);

  // Effects
  useEffect(() => {
    setPagination({ pageIndex: page, pageSize: rowPerPage });
  }, [page, rowPerPage]);

  useEffect(() => {
    loadFilterPreferences();
  }, [loadFilterPreferences]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  useEffect(() => {
    setExportCallback?.(() => handleExport);
  }, [handleExport, setExportCallback]);

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
        title={
          drawerMode === "create" ? "Create Custom Filter" : "Order Filters"
        }
        filterType="Order"
        activeTab={activeTab}
        userId={user?.userId}
        companyId={user?.companyId}
        module="order"
        initialFilterData={initialFilterData}
        mode={drawerMode}
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

      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex-shrink-0 mb-1">
          <FilterTabs
            tabs={tabs}
            defaultValue={
              filterPreferences?.preference?.filters &&
              filterPreferences.preference.filters.length > 0
                ? `filter-${filterPreferences.preference.selected}`
                : "all"
            }
            onTabChange={handleTabChange}
            onAddTab={() => {
              setInitialFilterData(undefined);
              setDrawerMode("create");
              setIsDrawerOpen(true);
            }}
            onFilterClick={() => {
              let initialData: QuoteFilterFormData | undefined;
              if (
                activeTab !== "all" &&
                filterPreferences?.preference?.filters
              ) {
                const tabIndex = parseInt(activeTab.replace("filter-", ""));
                const filter = filterPreferences.preference.filters.find(
                  f => f.filter_index === tabIndex
                );
                if (filter) initialData = convertToFormData(filter);
              }
              setInitialFilterData(initialData);
              setDrawerMode("filter");
              setIsDrawerOpen(true);
            }}
            onSettingsClick={() =>
              toast.info("Settings functionality coming soon!")
            }
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={rowPerPage} />
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
              handlePrevious={() => page > 0 && setPage(page - 1)}
              handleNext={() => {
                const maxPage = Math.ceil(totalCount / rowPerPage) - 1;
                if (page < maxPage) setPage(page + 1);
              }}
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
                if (orderId) router.push(`/${locale}/orders/${orderId}`);
              }}
              tableHeight="h-full"
            />
          )}
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
