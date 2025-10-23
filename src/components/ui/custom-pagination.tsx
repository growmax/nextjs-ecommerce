"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: CustomPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-center gap-0", className)}>
      {/* First page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-6 w-6 p-0 min-w-[24px] min-h-[24px]"
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-3 w-3" />
      </Button>

      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-6 w-6 p-0 min-w-[24px] min-h-[24px]"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>

      {/* Page numbers */}
      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="px-0 py-0 text-xs text-muted-foreground leading-none"
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "h-6 w-6 p-0 text-sm font-medium leading-none min-w-[24px] min-h-[24px]",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted"
            )}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-6 w-6 p-0 min-w-[24px] min-h-[24px]"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>

      {/* Last page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-6 w-6 p-0 min-w-[24px] min-h-[24px]"
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
