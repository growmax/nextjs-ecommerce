import React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";

type TablePagination = {
  pageIndex: number;
  pageSize: number;
};

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading: boolean;
  totalDataCount: number;
  pagination: TablePagination;
  setPagination: React.Dispatch<React.SetStateAction<TablePagination>>;
  setPage: (page: number | ((prev: number) => number)) => void;
  pageOptions: number[];
  handlePrevious: () => void;
  handleNext: () => void;
  page: number;
  rowPerPage: number;
  setRowPerPage: (rowPerPage: number | string) => void;
  onRowClick?: (row: T) => void;
  tableHeight?: string;
};

const DashboardTable = <T,>({
  data,
  columns,
  loading,
  totalDataCount,

  setPage,
  pageOptions,
  handlePrevious,
  handleNext,
  page,
  rowPerPage,
  setRowPerPage,
  onRowClick,
  tableHeight = "h-[calc(100vh-250px)]",
}: TableProps<T>) => {
  const pageCount = Math.ceil(totalDataCount / rowPerPage);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(0);
    setRowPerPage(e.target.value);
  };

  return (
    <div
      className={`rounded-md border shadow-sm overflow-hidden flex flex-col ${tableHeight} w-full`}
    >
      {/* Fixed Header */}
      <div className="bg-gray-100 border-b">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<T, unknown>) => (
                  <TableHead key={header.id} className="text-left px-3 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Loading overlay - covers table content for both initial load and filter changes */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="bg-background border shadow-lg rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        <Table className="min-w-full">
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: Row<T>, index: number) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-100 cursor-pointer animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                    <TableCell
                      key={cell.id}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4 text-xs sm:text-sm text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-4 border-t bg-background">
        <div className="flex items-center gap-3">
          <span className=" text-xs lg:text-sm text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <label className="text-xs lg:text-sm text-muted-foreground">
            Rows per page:{" "}
            <select
              className="border rounded px-2 py-1 ml-1"
              value={rowPerPage}
              onChange={handlePageSizeChange}
            >
              {pageOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs lg:text-sm"
            onClick={handlePrevious}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs lg:text-sm"
            onClick={handleNext}
            disabled={page >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;
