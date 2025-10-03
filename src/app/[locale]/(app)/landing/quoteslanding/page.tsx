"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import DashboardTable from "@/components/custom/DashBoardTable";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { QuotesService, type QuoteItem } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";

export default function QuotesLandingPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Define table columns
  const columns = useMemo<ColumnDef<QuoteItem>[]>(
    () => [
      {
        accessorKey: "quotationIdentifier",
        header: "Quote ID",
        cell: ({ getValue }) => (
          <span className="font-medium text-blue-600">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "quoteName",
        header: "Quote Name",
      },
      {
        accessorKey: "buyerCompanyName",
        header: "Buyer Company",
      },
      {
        accessorKey: "sellerCompanyName",
        header: "Seller Company",
      },
      {
        accessorKey: "itemCount",
        header: "Items",
        cell: ({ getValue }) => (
          <span className="text-center">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: "Total Amount",
        cell: ({ row }) => {
          const currencySymbol = row.original.curencySymbol?.symbol || "$";
          const amount = row.original.grandTotal;
          return (
            <span className="font-semibold">
              {currencySymbol} {amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: "updatedBuyerStatus",
        header: "Buyer Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusColors: Record<string, string> = {
            draft: "bg-gray-100 text-gray-800",
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            expired: "bg-orange-100 text-orange-800",
            cancelled: "bg-gray-100 text-gray-600",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[status.toLowerCase()] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return new Date(date).toLocaleDateString();
        },
      },
    ],
    []
  );

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        userId: 1032,
        companyId: 8690,
        offset: page * rowPerPage,
        limit: rowPerPage,
      };

      const filterRequest = {
        filter_index: 1,
        filter_name: "Second Filter",
        endCreatedDate: "",
        endDate: "",
        endValue: "",
        endTaxableAmount: "",
        endGrandTotal: "",
        identifier: "",
        limit: rowPerPage,
        offset: page * rowPerPage,
        name: "",
        pageNumber: 1,
        startDate: "",
        startCreatedDate: "",
        startValue: "",
        startTaxableAmount: "",
        startGrandTotal: "",
        status: [],
        selectedColumns: [],
        columnWidth: [],
        columnPosition: "",
        userDisplayName: "",
        userStatus: [],
        accountId: [],
        branchId: [],
      };

      const response = await QuotesService.getQuotes(
        queryParams,
        filterRequest
      );

      // eslint-disable-next-line no-console
      console.log("Quotes API Response:", response);

      setQuotes(response.data.quotesResponse || []);
      setTotalCount(response.data.totalQuoteCount || 0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching quotes:", error);
      toast.error("Failed to fetch quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);
  const handleExport = () => {
    // Handle export functionality here
    // console.log("Exporting quotes...");
    toast.success("Export has been completed successfully!");
  };

  const handleRefresh = () => {
    fetchQuotes();
    toast.success("Data has been refreshed successfully!");
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleQuoteFilterSubmit = (_data: QuoteFilterFormData) => {
    // Handle filter submission logic here
    // console.log("Quote Filter Data:", _data);
    setPage(0); // Reset to first page when applying filters
    fetchQuotes();
    toast.success("Filters have been applied successfully!");
  };

  const handleQuoteFilterReset = () => {
    setPage(0);
    fetchQuotes();
    toast.success("Filters have been reset successfully!");
  };

  const handlePrevious = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    const maxPage = Math.ceil(totalCount / rowPerPage) - 1;
    if (page < maxPage) setPage(page + 1);
  };

  const handleRowClick = (row: QuoteItem) => {
    // eslint-disable-next-line no-console
    console.log("Row clicked:", row);
    // You can add navigation or modal logic here
    toast.info(`Quote ${row.quotationIdentifier} selected`);
  };

  return (
    <>
      <DashboardToolbar
        title="Quotes"
        secondary={{
          condition: true,
          value: "Export",
          handleClick: handleExport,
          startIcon: <Download className="h-4 w-4" />,
        }}
        refresh={{
          condition: true,
          handleRefresh,
        }}
      />
      <FilterDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={handleQuoteFilterSubmit}
        onReset={handleQuoteFilterReset}
        title="Quote Filters"
        filterType="Quote"
        statusOptions={[
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "expired", label: "Expired" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />

      <div className="p-4 space-y-4">
        <Button onClick={handleOpenDrawer} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Open Filters
        </Button>

        <DashboardTable
          data={quotes}
          columns={columns}
          loading={loading}
          totalDataCount={totalCount}
          pagination={pagination}
          setPagination={setPagination}
          setPage={setPage}
          pageOptions={[10, 20, 50, 100]}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          page={page}
          rowPerPage={rowPerPage}
          setRowPerPage={value => {
            const newValue =
              typeof value === "string" ? parseInt(value, 10) : value;
            setRowPerPage(newValue);
            setPagination({ ...pagination, pageSize: newValue });
          }}
          onRowClick={handleRowClick}
          tableHeight="h-[calc(100vh-350px)]"
        />
      </div>
      <Toaster richColors />
    </>
  );
}
