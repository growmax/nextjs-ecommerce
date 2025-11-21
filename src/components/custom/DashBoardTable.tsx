import React from "react";

import {
    Cell,
    ColumnDef,
    ColumnResizeMode,
    Header,
    HeaderGroup,
    Row,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
  onRowHover?: (row: T) => void;
  tableHeight?: string;
  enableColumnResizing?: boolean;
  columnResizeMode?: ColumnResizeMode;
};

const DashboardTable = <T,>({
  data,
  columns,
  loading,
  totalDataCount,
  handlePrevious,
  handleNext,
  page,
  rowPerPage,
  onRowClick,
  onRowHover,
  tableHeight = "h-[calc(100vh-250px)]",
  enableColumnResizing = false,
  columnResizeMode = "onChange",
  setPage: _setPage,
  pageOptions: _pageOptions,
  setRowPerPage: _setRowPerPage,
  pagination: _pagination,
  setPagination: _setPagination,
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

  return (
    <div
      className={cn(
        "border rounded-lg overflow-x-hidden flex flex-col w-full",
        tableHeight || ""
      )}
    >
      {/* Scrollable Table Container - Header and Body together */}
      <div
        className={cn(
          "overflow-x-auto overflow-y-visible relative scrollbar-thin-horizontal",
          tableHeight ? "flex-1" : ""
        )}
      >
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
        <Table className="min-w-full table-auto">
          <TableHeader className="bg-gray-100 sticky top-0 z-30 rounded-t-lg">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<T, unknown>) => {
                  const isSticky =
                    (header.column.columnDef.meta as { sticky?: boolean })
                      ?.sticky === true;
                  const alignCenter =
                    (header.column.columnDef.meta as { alignCenter?: boolean })
                      ?.alignCenter === true;
                  const alignRight =
                    (header.column.columnDef.meta as { alignRight?: boolean })
                      ?.alignRight === true;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-1 py-0.5 bg-gray-100 border-b relative align-middle",
                        alignCenter
                          ? "text-center"
                          : alignRight
                            ? "text-right"
                            : "text-left",
                        isSticky &&
                          "sticky left-0 z-[31] bg-gray-100 border-r border-gray-300"
                      )}
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
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: Row<T>, _index: number) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-gray-100 cursor-pointer"
                  onClick={() => onRowClick?.(row.original)}
                  onMouseEnter={() => onRowHover?.(row.original)}
                >
                  {row.getVisibleCells().map((cell: Cell<T, unknown>) => {
                    const isSticky =
                      (cell.column.columnDef.meta as { sticky?: boolean })
                        ?.sticky === true;
                    const alignCenter =
                      (cell.column.columnDef.meta as { alignCenter?: boolean })
                        ?.alignCenter === true;
                    const alignRight =
                      (cell.column.columnDef.meta as { alignRight?: boolean })
                        ?.alignRight === true;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-1 py-0.25 text-xs sm:text-sm align-middle",
                          alignCenter
                            ? "text-center"
                            : alignRight
                              ? "text-right"
                              : "text-left",
                          isSticky &&
                            "sticky left-0 z-20 bg-white border-r border-gray-300 group-hover:bg-gray-100"
                        )}
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
                    );
                  })}
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
      <div className="flex items-center justify-between px-4 py-2 border-t bg-background rounded-b-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs lg:text-sm text-muted-foreground">
            {Math.min(page * rowPerPage + 1, totalDataCount)} -{" "}
            {Math.min((page + 1) * rowPerPage, totalDataCount)} of{" "}
            {totalDataCount} row(s)
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={page === 0}
            className={cn(
              "px-4",
              page === 0
                ? "text-gray-400 bg-gray-100 border-gray-200"
                : "text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200"
            )}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={page >= pageCount - 1}
            className={cn(
              "px-4",
              page >= pageCount - 1
                ? "text-gray-400 bg-gray-100 border-gray-200"
                : "text-gray-900 bg-white border-gray-300 hover:bg-gray-50"
            )}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;
