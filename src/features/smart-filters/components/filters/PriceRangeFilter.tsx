/**
 * PriceRangeFilter Component
 * 
 * Filter products by price range with min/max inputs.
 * Integrates with useSmartFilters hook.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PriceRange } from "../../types";

interface PriceRangeFilterProps {
  /** Current price range */
  priceRange?: PriceRange;
  
  /** Price statistics from aggregations */
  priceStats?: {
    min?: number;
    max?: number;
  };
  
  /** Change handler */
  onChange: (range: PriceRange | undefined) => void;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * PriceRangeFilter
 * 
 * Allows users to set min/max price with instant feedback.
 */
export function PriceRangeFilter({
  priceRange,
  priceStats,
  onChange,
  isLoading = false,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    priceRange?.min !== undefined ? String(priceRange.min) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    priceRange?.max !== undefined ? String(priceRange.max) : ""
  );
  
  // Update local state when props change
  useEffect(() => {
    setLocalMin(priceRange?.min !== undefined ? String(priceRange.min) : "");
    setLocalMax(priceRange?.max !== undefined ? String(priceRange.max) : "");
  }, [priceRange]);
  
  const handleMinChange = (value: string) => {
    setLocalMin(value);
    
    const numValue = value === "" ? undefined : parseFloat(value);
    if (numValue !== undefined && isNaN(numValue)) {
      return; // Invalid number
    }
    
    const newRange: PriceRange = {};
    if (numValue !== undefined) newRange.min = numValue;
    if (priceRange?.max !== undefined) newRange.max = priceRange.max;
    
    onChange(Object.keys(newRange).length > 0 ? newRange : undefined);
  };
  
  const handleMaxChange = (value: string) => {
    setLocalMax(value);
    
    const numValue = value === "" ? undefined : parseFloat(value);
    if (numValue !== undefined && isNaN(numValue)) {
      return; // Invalid number
    }
    
    const newRange: PriceRange = {};
    if (priceRange?.min !== undefined) newRange.min = priceRange.min;
    if (numValue !== undefined) newRange.max = numValue;
    
    onChange(Object.keys(newRange).length > 0 ? newRange : undefined);
  };
  
  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    onChange(undefined);
  };
  
  const statsMin = priceStats?.min ?? 0;
  const statsMax = priceStats?.max ?? 100000;
  const displayMin = Math.floor(statsMin);
  const displayMax = Math.ceil(statsMax);
  
  const hasValue = localMin !== "" || localMax !== "";
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Price Range Info */}
      {priceStats && (
        <div className="text-xs text-muted-foreground">
          Range: ${displayMin.toLocaleString()} - ${displayMax.toLocaleString()}
        </div>
      )}
      
      {/* Min/Max Inputs */}
      <div className="grid grid-cols-2 gap-2">
        {/* Min Price */}
        <div className="space-y-1.5">
          <Label htmlFor="min-price" className="text-xs">
            Min
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              className="pl-8 h-9"
              min={0}
              max={displayMax}
            />
          </div>
        </div>
        
        {/* Max Price */}
        <div className="space-y-1.5">
          <Label htmlFor="max-price" className="text-xs">
            Max
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="max-price"
              type="number"
              placeholder={String(displayMax)}
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="pl-8 h-9"
              min={localMin ? parseFloat(localMin) : 0}
            />
          </div>
        </div>
      </div>
      
      {/* Clear Button */}
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="w-full h-8 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear Price
        </Button>
      )}
    </div>
  );
}
