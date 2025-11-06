"use client";

import { Button } from "@/components/ui/button";
import React, { useMemo } from "react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (items: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 12,
  onItemsPerPageChange,
}) => {
  // Generate page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between py-4 px-6 min-h-20">
      {/* View Selector */}
      <div className="flex items-center gap-4">
        <span className="text-base font-medium">View:</span>
        <select
          value={itemsPerPage}
          onChange={e => onItemsPerPageChange?.(parseInt(e.target.value))}
          className="border rounded-md px-4 py-3 text-base font-medium"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Page Info */}
        <span className="text-base font-medium mr-6">
          Page <span className="font-bold">{currentPage}</span> /{" "}
          <span className="font-bold">{totalPages}</span>
        </span>

        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-6 py-3"
        >
          ‹ Previous Page
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {pageNumbers.map(pageNum => (
            <React.Fragment key={`page-${pageNum}`}>
              {pageNum === "..." ? (
                <span className="px-3 py-3 text-lg">···</span>
              ) : (
                <Button
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => onPageChange(pageNum as number)}
                  size="sm"
                  className="px-4 py-3 h-10"
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-6 py-3"
        >
          Next Page ›
        </Button>
      </div>
    </div>
  );
};

export default PaginationControl;
