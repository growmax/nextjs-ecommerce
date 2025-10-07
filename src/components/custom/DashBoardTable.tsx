import React from "react";

import {
  Cell,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
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
  enableColumnResizing?: boolean;
  columnResizeMode?: ColumnResizeMode;
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
  enableColumnResizing = false,
  columnResizeMode = "onChange",
}: TableProps<T>) => {
  const pageCount = Math.ceil(totalDataCount / rowPerPage);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    enableColumnResizing,
    columnResizeMode,
  });

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(0);
    setRowPerPage(e.target.value);
  };

  return (
    <div
      className={`border overflow-hidden flex flex-col ${tableHeight} w-full`}
    >
      {/* Scrollable Table Container - Header and Body together */}
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
        <Table className="min-w-full table-fixed w-full">
          <TableHeader className="bg-gray-100 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<T, unknown>) => (
                  <TableHead
                    key={header.id}
                    className="text-left px-3 py-3 bg-gray-100 border-b relative align-top"
                    style={{
                      width: header.getSize(),
                      maxWidth: header.getSize(),
                      minWidth: header.getSize(),
                      wordBreak: "break-word",
                      lineHeight: "1.4",
                      overflow: "hidden",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {enableColumnResizing && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none hover:bg-blue-500 ${
                          header.column.getIsResizing() ? "bg-blue-500" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
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
                      className="px-2 sm:px-3 py-3 text-xs sm:text-sm align-top"
                      style={{
                        width: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        wordBreak: "break-word",
                        lineHeight: "1",
                        overflow: "hidden",
                        whiteSpace: "normal",
                      }}
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
      <div className="flex items-center justify-between px-4 py-1 border-t bg-background">
        <div className="flex items-center gap-2">
          <span className=" text-xs lg:text-sm text-muted-foreground">
            Showing {Math.min(page * rowPerPage + 1, totalDataCount)} -{" "}
            {Math.min((page + 1) * rowPerPage, totalDataCount)} of{" "}
            {totalDataCount} | Page {page + 1} of {pageCount}
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
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handlePrevious}
            disabled={page === 0}
          >
            &lt;
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleNext}
            disabled={page >= pageCount - 1}
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;
