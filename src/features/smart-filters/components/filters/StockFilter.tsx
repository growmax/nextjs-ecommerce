/**
 * StockFilter Component
 * 
 * Simple toggle filter for stock availability.
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StockFilterProps {
  /** Is "in stock" filter active */
  inStock?: boolean;
  
  /** Change handler */
  onChange: (inStock: boolean | undefined) => void;
  
  /** Product count when filtered by stock */
  count?: number;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * StockFilter
 * 
 * Toggle to show only in-stock products.
 */
export function StockFilter({
  inStock,
  onChange,
  count,
  isLoading = false,
}: StockFilterProps) {
  const handleToggle = () => {
    onChange(inStock ? undefined : true);
  };
  
  if (isLoading) {
    return (
      <div className="h-8 bg-muted animate-pulse rounded" />
    );
  }
  
  return (
    <div className="flex items-center space-x-3 py-2">
      <Checkbox
        id="stock-filter"
        checked={inStock || false}
        onCheckedChange={handleToggle}
        className="shrink-0"
      />
      <Label
        htmlFor="stock-filter"
        className="flex-1 cursor-pointer text-sm font-normal flex items-center justify-between"
      >
        <span>In Stock Only</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">
            ({count})
          </span>
        )}
      </Label>
    </div>
  );
}
