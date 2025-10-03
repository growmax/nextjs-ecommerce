"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardTable from "@/components/custom/DashBoardTable";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import { QuotesService, type QuoteItem } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { statusColor } from "@/components/custom/statuscolors";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface QuotesLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
}

function QuotesLandingTable({
  refreshTrigger,
  setExportCallback,
}: QuotesLandingTableProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );

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
          if (!status) return null;

          // Get color from the centralized statusColor function
          const bgColor = statusColor(status.toUpperCase());

          return (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                backgroundColor: bgColor,
                display: "inline-block",
                minWidth: "100px",
                textAlign: "center",
              }}
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

  // Sync pagination state
  useEffect(() => {
    setPagination({
      pageIndex: page,
      pageSize: rowPerPage,
    });
  }, [page, rowPerPage]);

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
  const currentRangeStart = useMemo(
    () => page * rowPerPage + 1,
    [page, rowPerPage]
  );
  const currentRangeEnd = useMemo(
    () => Math.min((page + 1) * rowPerPage, totalCount),
    [page, rowPerPage, totalCount]
  );

  const fetchQuotes = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = {
        userId: user.userId,
        companyId: user.companyId,
        offset: page * rowPerPage,
        limit: rowPerPage,
      };

      const filterRequest = {
        filter_index: 1,
        filter_name: "Quote Filter",
        endCreatedDate: filterData?.quotedDateEnd
          ? filterData.quotedDateEnd.toISOString()
          : "",
        endDate: filterData?.lastUpdatedDateEnd
          ? filterData.lastUpdatedDateEnd.toISOString()
          : "",
        endValue: filterData?.subtotalEnd || "",
        endTaxableAmount: filterData?.taxableEnd || "",
        endGrandTotal: filterData?.totalEnd || "",
        identifier: filterData?.quoteId || "",
        limit: rowPerPage,
        offset: page * rowPerPage,
        name: filterData?.quoteName || "",
        pageNumber: page + 1,
        startDate: filterData?.lastUpdatedDateStart
          ? filterData.lastUpdatedDateStart.toISOString()
          : "",
        startCreatedDate: filterData?.quotedDateStart
          ? filterData.quotedDateStart.toISOString()
          : "",
        startValue: filterData?.subtotalStart || "",
        startTaxableAmount: filterData?.taxableStart || "",
        startGrandTotal: filterData?.totalStart || "",
        status: filterData?.status ? [filterData.status] : [],
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

      setQuotes(response.data.quotesResponse || []);
      setTotalCount(response.data.totalQuoteCount || 0);
    } catch (_error) {
      toast.error("Failed to fetch quotes");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowPerPage, user, filterData]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes, refreshTrigger]);

  const handleExport = useCallback(async () => {
    try {
      if (quotes.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Prepare data for export
      const exportData = quotes.map(quote => ({
        "Quote ID": quote.quotationIdentifier,
        "Quote Name": quote.quoteName || "",
        "Buyer Company": quote.buyerCompanyName || "",
        "Seller Company": quote.sellerCompanyName || "",
        Items: quote.itemCount || 0,
        "Total Amount": `${quote.curencySymbol?.symbol || "$"} ${quote.grandTotal || 0}`,
        Status: quote.updatedBuyerStatus || "",
        "Created Date": quote.createdDate
          ? new Date(quote.createdDate).toLocaleDateString()
          : "",
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(","),
        ...exportData.map(row =>
          headers
            .map(header => {
              const value = (row as Record<string, string | number>)[header];
              // Escape quotes and wrap in quotes if contains comma
              const escaped = String(value).replace(/"/g, '""');
              return escaped.includes(",") ? `"${escaped}"` : escaped;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `quotes_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export completed successfully!");
    } catch (_error) {
      toast.error("Failed to export quotes");
    }
  }, [quotes]);

  // Register export callback with parent component
  useEffect(() => {
    if (setExportCallback) {
      setExportCallback(() => handleExport);
    }
  }, [handleExport, setExportCallback]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleQuoteFilterSubmit = (data: QuoteFilterFormData) => {
    setFilterData(data);
    setPage(0); // Reset to first page when applying filters
    toast.success("Filters have been applied successfully!");
  };

  const handleQuoteFilterReset = () => {
    setFilterData(null);
    setPage(0);
    toast.success("Filters have been reset successfully!");
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

  const handleRowClick = (row: QuoteItem) => {
    router.push(`/${locale}/quotes/${row.quotationIdentifier}`);
  };

  return (
    <>
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
        <div className="flex justify-between items-center">
          <Button onClick={handleOpenDrawer} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Open Filters
          </Button>
          {totalCount > 0 && (
            <div className="text-sm text-gray-600">
              Showing {currentRangeStart}-{currentRangeEnd} of {totalCount}{" "}
              quotes
              {maxPage > 0 && ` | Page ${page + 1} of ${maxPage + 1}`}
            </div>
          )}
        </div>
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
    </>
  );
}

export default QuotesLandingTable;
