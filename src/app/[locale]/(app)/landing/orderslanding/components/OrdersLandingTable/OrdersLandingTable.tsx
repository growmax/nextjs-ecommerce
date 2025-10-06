"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardTable from "@/components/custom/DashBoardTable";
import FilterDrawer from "@/components/sales/FilterDrawer";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  QuoteFilterFormData,
  QuoteFilterForm,
} from "@/components/sales/QuoteFilterForm";
import { toast } from "sonner";
import orderService from "@/lib/api/services/OrdersService";
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
        <td key={cellIndex} className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <div
              className={`h-4 bg-gray-200 rounded animate-pulse ${
                cellIndex === 0
                  ? "w-24" // Order ID
                  : cellIndex === 1
                    ? "w-32" // Order Name
                    : cellIndex === 2
                      ? "w-20" // Order Date
                      : cellIndex === 3
                        ? "w-20" // Date
                        : cellIndex === 4
                          ? "w-28" // Account Name
                          : cellIndex === 5
                            ? "w-16" // Total Items
                            : cellIndex === 6
                              ? "w-20" // Sub total
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
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [, setActiveTab] = useState("all");
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Order | null>(
    null
  );

  // Define table columns
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderIdentifier",
        header: "Order Id",
        size: 150,
        cell: ({ row }) => {
          const orderId = row.original.orderIdentifier || "-";
          return <span className="font-medium text-blue-600">{orderId}</span>;
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
        cell: ({ row }) => {
          const date = row.original.createdDate;
          if (!date) return "-";
          try {
            return new Date(date).toLocaleDateString();
          } catch {
            return "-";
          }
        },
      },
      {
        accessorKey: "lastModifiedDate",
        header: "Date",
        size: 150,
        cell: ({ row }) => {
          const date = row.original.lastUpdatedDate;
          if (!date) return "-";
          try {
            return new Date(date).toLocaleDateString();
          } catch {
            return "-";
          }
        },
      },
      {
        accessorKey: "accountName",
        header: "Account Name",
        size: 250,
        cell: ({ row }) => (
          <div
            className="max-w-[250px] truncate"
            title={row.original.sellerCompanyName || "-"}
          >
            {row.original.sellerCompanyName || "-"}
          </div>
        ),
      },
      {
        accessorKey: "totalItems",
        header: () => <div className="text-center">Total Items</div>,
        size: 150,
        cell: ({ row }) => {
          const items = row.original.itemcount || 0;
          return (
            <div className="text-center">
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
            </div>
          );
        },
      },
      {
        accessorKey: "subTotal",
        header: () => <div className="text-center">Sub total</div>,
        size: 150,
        cell: ({ row }) => {
          const currencySymbol = row.original.currencySymbol?.symbol || "USD";
          const amount = row.original.subTotal ?? 0;
          return (
            <div className="text-center">
              {currencySymbol} {Number(amount).toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "taxableAmount",
        header: () => <div className="text-center">TaxableAmount</div>,
        size: 150,
        cell: ({ row }) => {
          const currencySymbol = row.original.currencySymbol?.symbol || "USD";
          const amount = row.original.taxableAmount ?? 0;
          return (
            <div className="text-center">
              {currencySymbol} {Number(amount).toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "grandTotal",
        header: () => <div className="text-center">Total</div>,
        size: 150,
        cell: ({ row }) => {
          const currencySymbol = row.original.currencySymbol?.symbol || "USD";
          const amount = row.original.grandTotal ?? 0;
          return (
            <div className="text-center">
              <span className="font-semibold">
                {currencySymbol} {Number(amount).toLocaleString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        size: 200,
        cell: ({ row }) => {
          const status = row.original.updatedBuyerStatus;
          if (!status) {
            return (
              <div className="text-center">
                <span className="text-gray-400">-</span>
              </div>
            );
          }
          const color = statusColor(status.toUpperCase());
          return (
            <div className="text-center">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: color }}
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
        cell: ({ row }) => {
          const date = row.original.requiredDate;
          if (!date) return <div className="text-center">-</div>;
          try {
            return (
              <div className="text-center">
                {new Date(date).toLocaleDateString()}
              </div>
            );
          } catch {
            return <div className="text-center">-</div>;
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

  const fetchOrders = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const calculatedOffset = page;
      const response = await orderService.getOrders({
        userId: user?.userId?.toString() || "",
        companyId: user?.companyId?.toString() || "",
        offset: calculatedOffset,
        limit: rowPerPage,
      });
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
        apiResponse.data.totalOrderCount || apiResponse.data.totalCount || 0; // Log first order to see actual field names
      if (ordersData.length > 0) {
      }

      setOrders(ordersData);
      setTotalCount(totalOrders);
    } catch {
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage, user]);

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
        "Order Date": order.createdDate
          ? new Date(order.createdDate).toLocaleDateString()
          : "-",
        "Last Modified Date": order.lastUpdatedDate
          ? new Date(order.lastUpdatedDate).toLocaleDateString()
          : "-",
        "Account Name": order.sellerCompanyName || "-",
        "Total Items": order.itemcount || 0,
        "Sub Total": `${order.currencySymbol?.symbol || "USD"} ${Number(order.subTotal || 0).toLocaleString()}`,
        "Taxable Amount": `${order.currencySymbol?.symbol || "USD"} ${Number(order.taxableAmount || 0).toLocaleString()}`,
        "Grand Total": `${order.currencySymbol?.symbol || "USD"} ${Number(order.grandTotal || 0).toLocaleString()}`,
        Status: order.updatedBuyerStatus || "-",
        "Required Date": order.requiredDate
          ? new Date(order.requiredDate).toLocaleDateString()
          : "-",
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

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOrderFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0); // Reset to first page when applying filters
    toast.success("Filters have been applied successfully!");
  };

  const handleOrderFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success("Filters have been reset successfully!");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0); // Reset to first page when changing tabs
    toast.info(`Switched to ${value} orders`);
  };

  const handleFilterClick = () => {
    setIsDrawerOpen(true);
  };

  const handleAddTab = () => {
    setIsAddDrawerOpen(true);
  };

  const handleAddDrawerClose = () => {
    setIsAddDrawerOpen(false);
  };

  const handleSettingsClick = () => {
    toast.info("Settings functionality coming soon!");
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRowClick = (row: Order) => {
    const orderId = row.orderIdentifier;
    if (orderId) {
      router.push(`/${locale}/orders/${orderId}`);
    }
  };

  // Define tabs with filter capabilities - only All tab initially
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
        onClose={handleDrawerClose}
        onSubmit={handleOrderFilterSubmit}
        onReset={handleOrderFilterReset}
        title="Order Filters"
        filterType="Order"
        statusOptions={[
          { value: "pending", label: "Pending" },
          { value: "processing", label: "Processing" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
          { value: "refunded", label: "Refunded" },
        ]}
      />

      <SideDrawer
        open={isAddDrawerOpen}
        onClose={handleAddDrawerClose}
        title="Order Filters"
      >
        <QuoteFilterForm
          onSubmit={handleOrderFilterSubmit}
          onReset={handleOrderFilterReset}
          filterType="Order"
          statusOptions={[
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
      </SideDrawer>

      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Add FilterTabs above the table */}
        <div className="flex-shrink-0 mb-4">
          <FilterTabs
            tabs={tabs}
            defaultValue="all"
            onTabChange={handleTabChange}
            onAddTab={handleAddTab}
            onFilterClick={handleFilterClick}
            onSettingsClick={handleSettingsClick}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <SkeletonTable columns={columns.length} rows={rowPerPage} />
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
                setPage(0); // Reset to first page when changing page size
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
