"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  priceStats?: {
    min?: number;
    max?: number;
  };
  onChange: (priceRange: { min?: number; max?: number } | undefined) => void;
  isLoading?: boolean;
}

/**
 * PriceFilter Component
 * Filter products by price range
 */
export function PriceFilter({
  minPrice,
  maxPrice,
  priceStats,
  onChange,
  isLoading = false,
}: PriceFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    minPrice !== undefined ? String(minPrice) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    maxPrice !== undefined ? String(maxPrice) : ""
  );

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice !== undefined ? String(minPrice) : "");
    setLocalMax(maxPrice !== undefined ? String(maxPrice) : "");
  }, [minPrice, maxPrice]);

  const handleMinChange = (value: string) => {
    setLocalMin(value);
    const numValue = value === "" ? undefined : parseFloat(value);
    if (numValue !== undefined && isNaN(numValue)) {
      return; // Don't update if invalid number
    }
    onChange({
      min: numValue,
      max: maxPrice,
    });
  };

  const handleMaxChange = (value: string) => {
    setLocalMax(value);
    const numValue = value === "" ? undefined : parseFloat(value);
    if (numValue !== undefined && isNaN(numValue)) {
      return; // Don't update if invalid number
    }
    onChange({
      min: minPrice,
      max: numValue,
    });
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          Price Range
        </h4>
        {(minPrice !== undefined || maxPrice !== undefined) && (
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="min-price" className="text-xs text-muted-foreground w-12 shrink-0">
            Min
          </Label>
          <Input
            id="min-price"
            type="number"
            placeholder={String(displayMin)}
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            className="h-8 text-sm"
            min={displayMin}
            max={displayMax}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="max-price" className="text-xs text-muted-foreground w-12 shrink-0">
            Max
          </Label>
          <Input
            id="max-price"
            type="number"
            placeholder={String(displayMax)}
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="h-8 text-sm"
            min={displayMin}
            max={displayMax}
          />
        </div>
      </div>

      {priceStats && (
        <div className="text-xs text-muted-foreground">
          Range: ₹{displayMin.toLocaleString()} - ₹{displayMax.toLocaleString()}
        </div>
      )}
    </div>
  );
}

