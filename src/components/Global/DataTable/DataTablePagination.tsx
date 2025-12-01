"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  showPageSizeSelector?: boolean;
  showFirstLastButtons?: boolean;
  pageSizeOptions?: number[];
}

function DataTablePaginationComponent<TData>({
  table,
  showPageSizeSelector = true,
  showFirstLastButtons = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const t = useTranslations("table");
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-center px-4 py-4">
      <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
        {selectedCount} {t("of")} {totalCount} {t("rows")} {t("selected")}.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        {showPageSizeSelector && (
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {t("rowsPerPage")}
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
          {table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {showFirstLastButtons && (
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t("goToFirstPage")}</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("goToPreviousPage")}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("goToNextPage")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {showFirstLastButtons && (
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t("goToLastPage")}</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when table state changes
export const DataTablePagination = React.memo(
  DataTablePaginationComponent
) as typeof DataTablePaginationComponent;
