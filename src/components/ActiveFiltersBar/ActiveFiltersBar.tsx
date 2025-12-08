"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * ActiveFiltersBar Component
 * Displays active filters in a horizontal scrollable bar
 * Similar to TrendingBrands but shows selected filters instead
 */
export function ActiveFiltersBar() {
  const {
    filters,
    removeVariantAttribute,
    removeProductSpecification,
    setStockFilter,
    clearAllFilters,
    activeFilterCount,
  } = useCategoryFilters();

  // Build active filters array with category names
  const activeFilters: Array<{
    id: string;
    category: string;
    value: string;
    onRemove: () => void;
  }> = [];

  // Add variant attribute filters
  Object.entries(filters.variantAttributes).forEach(([attrName, values]) => {
    values.forEach((value) => {
      activeFilters.push({
        id: `variant-${attrName}-${value}`,
        category: attrName,
        value: value,
        onRemove: () => removeVariantAttribute(attrName, value),
      });
    });
  });

  // Add product specification filters
  Object.entries(filters.productSpecifications).forEach(([specKey, values]) => {
    values.forEach((value) => {
      activeFilters.push({
        id: `spec-${specKey}-${value}`,
        category: specKey,
        value: value,
        onRemove: () => removeProductSpecification(specKey, value),
      });
    });
  });

  // Add stock filter
  if (filters.inStock !== undefined) {
    activeFilters.push({
      id: "stock",
      category: "Stock",
      value: filters.inStock ? "In Stock" : "Out of Stock",
      onRemove: () => setStockFilter(undefined),
    });
  }

  // Don't render if no active filters
  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {/* Active Filters Label with Count and Clear All */}
      <div className="flex items-center gap-2 px-3 h-10 border border-border rounded-md bg-background shrink-0">
        <span className="text-sm font-medium text-foreground">
          Active Filters
        </span>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className={cn(
              "text-xs font-medium text-muted-foreground",
              "hover:text-destructive transition-colors",
              "ml-1"
            )}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Badges with Category Names */}
      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className={cn(
            "h-10 px-3 py-2",
            "flex items-center gap-2",
            "border border-border rounded-md",
            "shrink-0",
            "bg-primary/10 text-foreground border-primary/20"
          )}
        >
          <span className="text-sm font-medium">
            {filter.category}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={filter.onRemove}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}

