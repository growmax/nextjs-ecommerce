import React, { useRef, useEffect, useState, useCallback } from "react";

import {
  Cell,
  ColumnDef,
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
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

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

  // Initialize column widths from column definitions
  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach(column => {
      if (column.id && column.size) {
        initialWidths[column.id] = column.size as number;
      }
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  // Handle column resizing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnId: string) => {
      e.preventDefault();
      setIsResizing(true);
      setResizingColumn(columnId);
      setStartX(e.clientX);
      setStartWidth(columnWidths[columnId] || 150);
    },
    [columnWidths]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizingColumn) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    },
    [isResizing, resizingColumn, startX, startWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Get column width
  const getColumnWidth = (columnId: string, defaultSize?: number) => {
    return columnWidths[columnId] || defaultSize || 150;
  };

  return (
    <div className={`overflow-hidden flex flex-col ${tableHeight} w-full`}>
      {/* Single Scrollable Table Container */}
      <div
        ref={tableScrollRef}
        className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
        <Table className="min-w-full table-fixed table-layout-fixed border-collapse border-separate border-spacing-0">
          {/* Sticky Header */}
          <TableHeader className="bg-gray-100 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<T, unknown>) => (
                  <TableHead
                    key={header.id}
                    className="text-center px-3 py-2 bg-gray-100 align-middle whitespace-normal relative group"
                    style={{
                      width: `${getColumnWidth(header.id, header.column.columnDef.size as number)}px`,
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* Resize Handle */}
                    <div
                      className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500 transition-colors group-hover:bg-gray-300"
                      onMouseDown={e => handleMouseDown(e, header.id)}
                      style={{
                        background:
                          resizingColumn === header.id ? "#3b82f6" : undefined,
                      }}
                    />
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
                  className="hover:bg-gray-100 cursor-pointer animate-in fade-in slide-in-from-bottom-1 border-b border-gray-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                    <TableCell
                      key={cell.id}
                      className="px-3 py-2 text-xs sm:text-sm align-middle whitespace-normal text-center"
                      style={{
                        width: `${getColumnWidth(cell.column.id, cell.column.columnDef.size as number)}px`,
                        wordWrap: "break-word",
                        wordBreak: "break-word",
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
                  className="text-center py-4 text-xs sm:text-sm text-muted-foreground align-middle"
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
