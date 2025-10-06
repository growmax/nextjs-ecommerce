"use client";

import DashboardTable from "@/components/custom/DashBoardTable";
import { statusColor } from "@/components/custom/statuscolors";
import FilterDrawer from "@/components/sales/FilterDrawer";
import { QuoteFilterFormData } from "@/components/sales/QuoteFilterForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import QuotesService, {
  type QuoteItem,
} from "@/lib/api/services/QuotesService";
import { ColumnDef } from "@tanstack/react-table";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TableHeaderBar from "./TableHeaderBar";

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
  const [rowPerPage, setRowPerPage] = useState(20); // Default to first valid option
  const [filterData, setFilterData] = useState<QuoteFilterFormData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("ALL");

  // Define table columns
  const columns = useMemo<ColumnDef<QuoteItem>[]>(
    () => [
      {
        accessorKey: "quotationIdentifier",
        header: "Quote ID",
        size: 150,
        cell: ({ getValue }) => (
          <span className="font-medium text-blue-600 block truncate">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "quoteName",
        header: "Quote Name",
        size: 200,
        cell: ({ getValue }) => (
          <span className="block truncate">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "buyerCompanyName",
        header: "Buyer Company",
        size: 180,
        cell: ({ getValue }) => (
          <span className="block truncate">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "sellerCompanyName",
        header: "Seller Company",
        size: 180,
        cell: ({ getValue }) => (
          <span className="block truncate">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "itemCount",
        header: "Items",
        size: 80,
        cell: ({ getValue }) => (
          <span className="text-center block">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: "Total Amount",
        size: 140,
        cell: ({ row }) => {
          const currencySymbol = row.original.curencySymbol?.symbol || "$";
          const amount = row.original.grandTotal;
          return (
            <span className="font-semibold block truncate">
              {currencySymbol} {amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: "updatedBuyerStatus",
        header: "Buyer Status",
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue() as string;
          if (!status) return null;

          // Get color from the centralized statusColor function
          const bgColor = statusColor(status.toUpperCase());

          return (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white inline-block"
              style={{
                backgroundColor: bgColor,
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
        size: 120,
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return (
            <span className="block">{new Date(date).toLocaleDateString()}</span>
          );
        },
      },
    ],
    []
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

  const fetchQuotes = useCallback(async () => {
    // Don't fetch if we don't have user info yet
    if (!user?.userId || !user?.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 0-based offset: Calculate proper starting record number
      const calculatedOffset = page;

      const queryParams = {
        userId: user.userId,
        companyId: user.companyId,
        offset: calculatedOffset,
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
        offset: calculatedOffset, // Now using 0-based offset
        name: filterData?.quoteName || "",
        pageNumber: page + 1, // Backend uses 1-based pageNumber for pagination
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
      setPage(prevPage => Math.max(0, prevPage - 1));
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

      <div className="h-full flex flex-col">
        <TableHeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleOpenDrawer={handleOpenDrawer}
          handleExport={handleExport}
          setRowPerPage={setRowPerPage}
        />
        <div className="flex-1 overflow-hidden">
          <DashboardTable
            data={quotes}
            columns={columns}
            loading={loading}
            totalDataCount={totalCount}
            pagination={{ pageIndex: page, pageSize: rowPerPage }}
            setPagination={() => {}}
            setPage={setPage}
            pageOptions={[20, 50, 100]}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            page={page}
            rowPerPage={rowPerPage}
            setRowPerPage={value => {
              const newValue =
                typeof value === "string" ? parseInt(value, 10) : value;
              // Validate that the value is one of the allowed options
              const validOptions = [20, 50, 100];
              if (validOptions.includes(newValue)) {
                setRowPerPage(newValue);
                setPage(0); // Reset to first page when changing page size
              } else {
                // Default to 20 if invalid value
                setRowPerPage(20);
                setPage(0);
              }
            }}
            onRowClick={handleRowClick}
            tableHeight="h-full"
          />
        </div>
      </div>
    </>
  );
}

export default QuotesLandingTable;
