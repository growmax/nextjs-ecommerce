"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardTable from "@/components/custom/DashBoardTable";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { toast } from "sonner";
import orderService, { OrdersParams } from "@/lib/api/services/OrdersService";
import PreferenceService, {
  FilterPreferenceResponse,
} from "@/lib/api/services/PreferenceService";
import { type Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { ColumnDef } from "@tanstack/react-table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { statusColor } from "@/components/custom/statuscolors";
import { FilterTabs } from "@/components/custom/FilterTabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

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

interface OrdersLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
}

function OrdersLandingTable({
  refreshTrigger,
  setExportCallback,
}: OrdersLandingTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [filterPreferences, setFilterPreferences] =
    useState<FilterPreferenceResponse | null>(null);
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

  const maxPage = Math.max(0, Math.ceil(totalCount / rowPerPage) - 1);

  // Load filter preferences
  const loadFilterPreferences = useCallback(async () => {
    try {
      const preferences =
        await PreferenceService.findFilterPreferences("order");
      setFilterPreferences(preferences);
    } catch {}
  }, []);

  // Load preferences on component mount
  useEffect(() => {
    loadFilterPreferences();
  }, [loadFilterPreferences]);

  const fetchOrders = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const calculatedOffset = page;

      // Apply filter preferences if available
      let orderParams: OrdersParams = {
        userId: user?.userId?.toString() || "",
        companyId: user?.companyId?.toString() || "",
        offset: calculatedOffset,
        limit: rowPerPage,
      };

      // Apply saved filter preferences
      if (filterPreferences?.preference?.filters) {
        const activeFilter =
          filterPreferences.preference.filters[
            filterPreferences.preference.selected
          ];
        if (activeFilter) {
          // Convert filter preference fields to OrdersParams format
          const convertedFilter: Partial<OrdersParams> = {};

          // Handle status array - join with comma or take first value
          if (
            activeFilter.status &&
            Array.isArray(activeFilter.status) &&
            activeFilter.status.length > 0
          ) {
            convertedFilter.status = activeFilter.status[0]; // Take first status for now
          }

          // Handle date fields
          if (activeFilter.startDate)
            convertedFilter.orderDateStart = activeFilter.startDate;
          if (activeFilter.endDate)
            convertedFilter.orderDateEnd = activeFilter.endDate;
          if (activeFilter.startCreatedDate)
            convertedFilter.lastUpdatedDateStart =
              activeFilter.startCreatedDate;
          if (activeFilter.endCreatedDate)
            convertedFilter.lastUpdatedDateEnd = activeFilter.endCreatedDate;

          // Handle amount fields
          if (
            activeFilter.startValue !== null &&
            activeFilter.startValue !== undefined
          ) {
            convertedFilter.subtotalStart = activeFilter.startValue.toString();
          }
          if (
            activeFilter.endValue !== null &&
            activeFilter.endValue !== undefined
          ) {
            convertedFilter.subtotalEnd = activeFilter.endValue.toString();
          }
          if (
            activeFilter.startTaxableAmount !== null &&
            activeFilter.startTaxableAmount !== undefined
          ) {
            convertedFilter.taxableStart =
              activeFilter.startTaxableAmount.toString();
          }
          if (
            activeFilter.endTaxableAmount !== null &&
            activeFilter.endTaxableAmount !== undefined
          ) {
            convertedFilter.taxableEnd =
              activeFilter.endTaxableAmount.toString();
          }
          if (
            activeFilter.startGrandTotal !== null &&
            activeFilter.startGrandTotal !== undefined
          ) {
            convertedFilter.totalStart =
              activeFilter.startGrandTotal.toString();
          }
          if (
            activeFilter.endGrandTotal !== null &&
            activeFilter.endGrandTotal !== undefined
          ) {
            convertedFilter.totalEnd = activeFilter.endGrandTotal.toString();
          }

          // Handle order identifier
          if (activeFilter.identifier)
            convertedFilter.orderId = activeFilter.identifier;
          if (activeFilter.name) convertedFilter.orderName = activeFilter.name;

          orderParams = {
            ...orderParams,
            ...convertedFilter,
          };
        }
      }

      // Apply current filter data (overrides saved preferences)
      if (filterData) {
        // Convert filter data to OrdersParams format
        const convertedCurrentFilter: Partial<OrdersParams> = {};

        // Handle status
        if (filterData.status)
          convertedCurrentFilter.status = filterData.status;

        // Handle order fields (map from quote fields to order fields)
        if (filterData.quoteId)
          convertedCurrentFilter.orderId = filterData.quoteId;
        if (filterData.quoteName)
          convertedCurrentFilter.orderName = filterData.quoteName;

        // Handle date fields - convert Date to string if needed
        if (filterData.quotedDateStart) {
          convertedCurrentFilter.orderDateStart =
            filterData.quotedDateStart instanceof Date
              ? filterData.quotedDateStart.toISOString().split("T")[0]
              : filterData.quotedDateStart;
        }
        if (filterData.quotedDateEnd) {
          convertedCurrentFilter.orderDateEnd =
            filterData.quotedDateEnd instanceof Date
              ? filterData.quotedDateEnd.toISOString().split("T")[0]
              : filterData.quotedDateEnd;
        }
        if (filterData.lastUpdatedDateStart) {
          convertedCurrentFilter.lastUpdatedDateStart =
            filterData.lastUpdatedDateStart instanceof Date
              ? filterData.lastUpdatedDateStart.toISOString().split("T")[0]
              : filterData.lastUpdatedDateStart;
        }
        if (filterData.lastUpdatedDateEnd) {
          convertedCurrentFilter.lastUpdatedDateEnd =
            filterData.lastUpdatedDateEnd instanceof Date
              ? filterData.lastUpdatedDateEnd.toISOString().split("T")[0]
              : filterData.lastUpdatedDateEnd;
        }

        // Handle amount fields
        if (filterData.subtotalStart)
          convertedCurrentFilter.subtotalStart = filterData.subtotalStart;
        if (filterData.subtotalEnd)
          convertedCurrentFilter.subtotalEnd = filterData.subtotalEnd;
        if (filterData.taxableStart)
          convertedCurrentFilter.taxableStart = filterData.taxableStart;
        if (filterData.taxableEnd)
          convertedCurrentFilter.taxableEnd = filterData.taxableEnd;
        if (filterData.totalStart)
          convertedCurrentFilter.totalStart = filterData.totalStart;
        if (filterData.totalEnd)
          convertedCurrentFilter.totalEnd = filterData.totalEnd;

        orderParams = {
          ...orderParams,
          ...convertedCurrentFilter,
        };
      }

      const response = await orderService.getOrders(orderParams);
      // Handle both possible response structures
      const apiResponse = response as {
        data: {
          ordersResponse?: Order[];
          orders?: Order[];
          totalOrderCount?: number;
          totalCount?: number;
        };
      };
      const ordersData =
        apiResponse.data.ordersResponse || apiResponse.data.orders || [];
      const totalOrders =
        apiResponse.data.totalOrderCount || apiResponse.data.totalCount || 0;

      setOrders(ordersData);
      setTotalCount(totalOrders);
    } catch {
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage, user, filterPreferences, filterData]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  const handleExport = useCallback(async () => {
    try {
      if (orders.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Dynamic import of xlsx to avoid SSR issues
      const XLSX = await import("xlsx");

      // Prepare data for export
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 15 }, // Order Id
        { wch: 20 }, // Order Name
        { wch: 15 }, // Order Date
        { wch: 15 }, // Last Modified Date
        { wch: 25 }, // Account Name
        { wch: 12 }, // Total Items
        { wch: 15 }, // Sub Total
        { wch: 15 }, // Taxable Amount
        { wch: 15 }, // Grand Total
        { wch: 12 }, // Status
        { wch: 15 }, // Required Date
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      // Generate filename with current date
      const filename = `orders_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      toast.success("Export completed successfully!");
    } catch {
      toast.error("Failed to export orders");
    }
  }, [orders]);

  // Register export callback with parent component
  useEffect(() => {
    if (setExportCallback) {
      setExportCallback(() => handleExport);
    }
  }, [handleExport, setExportCallback]);

  const handleOrderFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0);
    toast.success("Filters have been applied successfully!");
  };

  const handleOrderFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success("Filters have been reset successfully!");
  };

  const handlePrevious = useCallback(() => {
    if (page > 0 && !loading) {
      setPage(prevPage => prevPage - 1);
    }
  }, [page, loading]);

  const handleNext = useCallback(() => {
    if (page < maxPage && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [page, maxPage, loading]);

  const handleRowClick = (row: Order) => {
    const orderId = row.orderIdentifier;
    if (orderId) {
      router.push(`/${locale}/orders/${orderId}`);
    }
  };

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
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleOrderFilterSubmit}
        onReset={handleOrderFilterReset}
        title="Order Filters"
        filterType="Order"
        statusOptions={STATUS_OPTIONS}
      />

      <div className="flex flex-col h-[calc(100vh-140px)] ">
        {/* Add FilterTabs above the table */}
        <div className="flex-shrink-0 mb-1">
          <FilterTabs
            tabs={tabs}
            defaultValue="all"
            onTabChange={() => {}}
            onFilterClick={() => setIsDrawerOpen(true)}
            onSettingsClick={() =>
              toast.info("Settings functionality coming soon!")
            }
            filterType="Order"
            statusOptions={STATUS_OPTIONS}
            onFilterSubmit={handleOrderFilterSubmit}
            onFilterReset={handleOrderFilterReset}
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
            <div className="text-center text-gray-500 py-8"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersLandingTable;
