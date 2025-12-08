"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StockFilterProps {
  inStock?: boolean | undefined;
  onChange: (inStock: boolean | undefined) => void;
  isLoading?: boolean;
}

/**
 * StockFilter Component
 * Filter by stock/inventory status
 */
export function StockFilter({
  inStock,
  onChange,
  isLoading,
}: StockFilterProps) {
  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <RadioGroup
        value={
          inStock === true
            ? "in_stock"
            : inStock === false
            ? "out_of_stock"
            : "all"
        }
        onValueChange={(value) => {
          if (value === "in_stock") {
            onChange(true);
          } else if (value === "out_of_stock") {
            onChange(false);
          } else {
            onChange(undefined);
          }
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-2 rounded-md p-1.5 transition-colors hover:bg-accent/50">
            <RadioGroupItem value="all" id="stock-all" />
            <Label htmlFor="stock-all" className="flex-1 cursor-pointer text-sm font-normal">
              All Products
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md p-1.5 transition-colors hover:bg-accent/50">
            <RadioGroupItem value="in_stock" id="stock-in" />
            <Label htmlFor="stock-in" className="flex-1 cursor-pointer text-sm font-normal">
              In Stock
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md p-1.5 transition-colors hover:bg-accent/50">
            <RadioGroupItem value="out_of_stock" id="stock-out" />
            <Label htmlFor="stock-out" className="flex-1 cursor-pointer text-sm font-normal">
              Out of Stock
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}

