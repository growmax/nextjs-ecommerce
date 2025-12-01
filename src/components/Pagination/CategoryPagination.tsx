"use client";

import { CustomPagination } from "@/components/ui/custom-pagination";
import { cn } from "@/lib/utils";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/**
 * CategoryPagination Component
 * Handles pagination with URL updates (no page reload)
 * Wraps CustomPagination with disabled state support
 */
export function CategoryPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: CategoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (!disabled) {
      onPageChange(page);
    }
  };

  return (
    <div className={cn(disabled && "pointer-events-none opacity-50")}>
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

