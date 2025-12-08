"use client";

import { cn } from "@/lib/utils";
import type { BrandFilterOption } from "@/types/category-filters";
import { TrendingUp } from "lucide-react";

interface TrendingBrandsProps {
  brands: BrandFilterOption[];
  selectedBrands?: string[];
  onBrandClick?: (brandValue: string) => void;
}

export function TrendingBrands({
  brands,
  selectedBrands = [],
  onBrandClick,
}: TrendingBrandsProps) {
  // Show top brands (limit to 10 for better UX)
  const displayBrands = brands.slice(0, 10);

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {/* Trending Label */}
      <div className="flex items-center gap-1.5 px-3 h-10 border border-border rounded-md bg-background shrink-0">
        <TrendingUp className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground">Trending</span>
      </div>

      {/* Brand Buttons */}
      {displayBrands.map((brand) => {
        const isSelected = selectedBrands?.includes(brand.value);

        return (
          <button
            key={brand.value}
            onClick={() => onBrandClick?.(brand.value)}
            className={cn(
              "min-w-[80px] h-10 px-3 py-2",
              "border rounded-md",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:border-primary hover:shadow-sm",
              "shrink-0",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-foreground"
            )}
          >
            {/* Brand Name (logo not available in BrandFilterOption) */}
            <span className="text-sm font-medium truncate">{brand.label}</span>
          </button>
        );
      })}
    </div>
  );
}
