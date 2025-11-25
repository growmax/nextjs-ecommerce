"use client";

import { Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface StockFilterProps {
  inStock?: boolean;
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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Package className="h-4 w-4" />
        Stock Status
      </h4>

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
        <div className="space-y-2">
          <div className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent/50">
            <RadioGroupItem value="all" id="stock-all" />
            <Label htmlFor="stock-all" className="flex-1 cursor-pointer text-sm font-normal">
              All Products
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent/50">
            <RadioGroupItem value="in_stock" id="stock-in" />
            <Label htmlFor="stock-in" className="flex-1 cursor-pointer text-sm font-normal">
              In Stock
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent/50">
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

