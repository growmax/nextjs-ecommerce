"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardTable from "@/components/custom/DashBoardTable";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { toast } from "sonner";
import orderService, { OrdersParams } from "@/lib/api/services/OrdersService";
import ordersFilterService, {
  OrderFilter,
} from "@/lib/api/services/OrdersFilterService";
import PreferenceService, {
  FilterPreferenceResponse,
  FilterPreference,
} from "@/lib/api/services/PreferenceService";
import { type Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { ColumnDef } from "@tanstack/react-table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { statusColor } from "@/components/custom/statuscolors";
import { FilterTabs } from "@/components/custom/FilterTabs";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersLandingTableProps } from "../../types/ordertypes";

// Helper functions
const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "-";
  }
};

const formatCurrency = (
  amount: number | null | undefined,
  symbol?: string
): string => {
  const currencySymbol = symbol || "USD";
  return `${currencySymbol} ${Number(amount || 0).toLocaleString()}`;
};

// Table Skeleton Component
const TableSkeleton = ({ rows = 10 }: { rows?: number }) => {
  return (
    <div className="rounded-md border shadow-sm overflow-hidden h-full flex flex-col">
      {/* Skeleton Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex">
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-2 py-0.5 w-[200px]">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-2 py-0.5 w-[300px]">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-2 py-0.5 w-[200px]">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-2 py-0.5 w-[150px]">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Skeleton Table Body */}
      <div className="flex-1 overflow-auto">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-b border-gray-100 flex animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: `${rowIndex * 50}ms` }}
          >
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[200px]">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[300px]">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[200px]">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="px-1 sm:px-2 py-1 w-[150px]">
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Pagination */}
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
};

function OrdersLandingTable({
  refreshTrigger,
  setExportCallback,
}: OrdersLandingTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();
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

  // Define table columns
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderIdentifier",
        header: () => <span className="pl-2">Order Id</span>,
        size: 150,
        cell: ({ row }) => {
          const orderId = row.original.orderIdentifier || "-";
          return (
            <span className="font-medium text-blue-600 pl-2">{orderId}</span>
          );
        },
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
          if (!status) {
            return <span className="text-gray-400">-</span>;
          }
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

  useEffect(() => {
    setPagination({ pageIndex: page, pageSize: rowPerPage });
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

  // Handle previous page navigation
  const handlePrevious = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page]);

  // Handle next page navigation
  const handleNext = useCallback(() => {
    const maxPage = Math.ceil(totalCount / rowPerPage) - 1;
    if (page < maxPage) {
      setPage(page + 1);
    }
  }, [page, totalCount, rowPerPage]);

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

  // Load preferences on component mount
  useEffect(() => {
    loadFilterPreferences();
  }, [loadFilterPreferences]);

  // Convert saved filter to form data format
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

  const convertDateToString = useCallback(
    (date: Date | string | null | undefined): string => {
      if (!date) return "";
      // TypeScript now knows date is not null/undefined
      if (date instanceof Date) {
        const isoString = (date as Date).toISOString();
        return isoString.split("T")[0] || "";
      }
      return String(date);
    },
    []
  );

  const fetchOrders = useCallback(async () => {
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const calculatedOffset = page;
      const orderParams: OrdersParams = {
        userId: user.userId.toString(),
        companyId: user.companyId.toString(),
        offset: calculatedOffset,
        limit: rowPerPage,
      };

      let response;

      if (filterData) {
        try {
          const filter = {
            filter_index: 1,
            filter_name: "Order Filter",
            endCreatedDate:
              convertDateToString(filterData?.lastUpdatedDateEnd) || "",
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
            selectedColumns: [],
            columnWidth: [],
            columnPosition: "",
            userDisplayName: "",
            userStatus: [],
            accountId: [],
            branchId: [],
          };

          response = await ordersFilterService.getOrdersWithFilter({
            userId: parseInt(user.userId.toString()),
            companyId: parseInt(user.companyId.toString()),
            offset: calculatedOffset,
            pgLimit: rowPerPage,
            filters: [filter],
            selected: 0,
          });
        } catch {
          response = await orderService.getOrders(orderParams);
        }
      } else {
        response = await orderService.getOrders(orderParams);
      }

      const apiResponse = response as {
        data: {
          ordersResponse?: Order[];
          orders?: Order[];
          totalOrderCount?: number;
          totalCount?: number;
        };
      };

      setOrders(
        apiResponse.data.ordersResponse || apiResponse.data.orders || []
      );
      setTotalCount(
        apiResponse.data.totalOrderCount || apiResponse.data.totalCount || 0
      );
    } catch {
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [
    user?.userId,
    user?.companyId,
    page,
    rowPerPage,
    filterData,
    convertDateToString,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

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

      ws["!cols"] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
      ];

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

  useEffect(() => {
    setExportCallback?.(() => handleExport);
  }, [handleExport, setExportCallback]);

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
        const formData = convertToFormData(selectedFilter);
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

  const handleOrderFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0);
    toast.success("Filters applied successfully!");
  };

  const handleOrderFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success("Filters reset successfully!");
  };

  const handleSaveFilter = useCallback(
    async (filterData: QuoteFilterFormData) => {
      if (!user?.userId || !user?.companyId) {
        toast.error("User information not available");
        return;
      }

      const filterName = filterData.filterName || "Custom Filter";

      try {
        // Convert filter data to OrderFilter format
        const orderFilter: OrderFilter = {
          filter_index: 1,
          filter_name: filterName,
          endCreatedDate:
            convertDateToString(filterData?.lastUpdatedDateEnd) || "",
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
          pageNumber: Math.floor(page / rowPerPage) + 1,
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
          status: filterData?.status
            ? Array.isArray(filterData.status)
              ? filterData.status
              : [filterData.status]
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
          userDisplayName: "",
          userStatus: [],
          accountId: [],
          branchId: [],
        };

        // Save the filter using the OrdersFilterService
        await ordersFilterService.saveCustomOrderFilter(
          parseInt(user.userId.toString()),
          parseInt(user.companyId.toString()),
          orderFilter
        );

        toast.success(`Filter "${filterName}" saved successfully!`);
      } catch {
        toast.error("Failed to save filter");
      }
    },
    [user?.userId, user?.companyId, rowPerPage, page, convertDateToString]
  );

  const handleRowClick = (row: Order) => {
    const orderId = row.orderIdentifier;
    if (orderId) {
      router.push(`/${locale}/orders/${orderId}`);
    }
  };

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
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleOrderFilterSubmit}
        onReset={handleOrderFilterReset}
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

      <div className="flex flex-col h-[calc(100vh-140px)] ">
        {/* Add FilterTabs above the table */}
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
            onAddTab={handleAddTab}
            onFilterClick={handleFilterClick}
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
              onRowClick={handleRowClick}
              tableHeight="h-full"
            />
          )}
        </div>
      </div>

      {/* Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Items</DialogTitle>
            <DialogDescription>
              {selectedOrderItems && (
                <>
                  Order ID: {selectedOrderItems.orderIdentifier} -{" "}
                  {selectedOrderItems.orderName}
                </>
              )}
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
