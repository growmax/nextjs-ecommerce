"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryFilterState } from "@/types/category-filters";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: CategoryFilterState;
  onRemoveVariantAttribute: (attributeName: string, value: string) => void;
  onRemoveProductSpecification: (specKey: string, value: string) => void;
  onRemoveStockFilter: () => void;
  onClearAll: () => void;
}

/**
 * ActiveFilters Component
 * Shows active filter badges with remove buttons
 */
export function ActiveFilters({
  filters,
  onRemoveVariantAttribute,
  onRemoveProductSpecification,
  onRemoveStockFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: Array<{
    id: string;
    label: string;
    onRemove: () => void;
  }> = [];

  // Add variant attribute filters
  Object.entries(filters.variantAttributes).forEach(([attrName, values]) => {
    values.forEach((value) => {
      activeFilters.push({
        id: `variant-${attrName}-${value}`,
        label: `${attrName}: ${value}`,
        onRemove: () => onRemoveVariantAttribute(attrName, value),
      });
    });
  });

  // Add product specification filters
  Object.entries(filters.productSpecifications).forEach(([specKey, values]) => {
    values.forEach((value) => {
      activeFilters.push({
        id: `spec-${specKey}-${value}`,
        label: `${specKey}: ${value}`,
        onRemove: () => onRemoveProductSpecification(specKey, value),
      });
    });
  });

  // Add stock filter
  if (filters.inStock !== undefined) {
    activeFilters.push({
      id: "stock",
      label: filters.inStock ? "In Stock" : "Out of Stock",
      onRemove: onRemoveStockFilter,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Active Filters</h3>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-0.5 text-xs"
          >
            <span className="text-xs">{filter.label}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={filter.onRemove}
              className="h-3 w-3 p-0 hover:bg-transparent -mr-1"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

