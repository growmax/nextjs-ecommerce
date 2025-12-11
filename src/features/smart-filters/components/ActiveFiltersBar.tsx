/**
 * ActiveFiltersBar Component
 * 
 * Displays active filter chips with remove functionality.
 * Shows "Clear All" button when filters are active.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ActiveFilters } from "../types";

export interface ActiveFilterChip {
  /** Unique identifier for this filter */
  id: string;
  
  /** Filter type/category */
  type: string;
  
  /** Display label */
  label: string;
  
  /** Remove handler */
  onRemove: () => void;
}

interface ActiveFiltersBarProps {
  /** Current active filters */
  filters: ActiveFilters;
  
  /** Clear all filters */
  onClearAll: () => void;
  
  /** Remove individual filter */
  onRemoveFilter: (type: string, key?: string, value?: string) => void;
  
  /** Custom className */
  className?: string;
  
  /** Show filter count */
  showCount?: boolean;
}

/**
 * ActiveFiltersBar
 * 
 * Displays active filters as removable chips.
 * Provides clear all and individual remove functionality.
 */
export function ActiveFiltersBar({
  filters,
  onClearAll,
  onRemoveFilter,
  className,
  showCount = true,
}: ActiveFiltersBarProps) {
  const chips = buildFilterChips(filters, onRemoveFilter);
  
  if (chips.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Filter Count */}
      {showCount && (
        <span className="text-sm font-medium text-muted-foreground">
          {chips.length} {chips.length === 1 ? "Filter" : "Filters"}:
        </span>
      )}
      
      {/* Filter Chips */}
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="pl-3 pr-1 py-1.5 gap-1.5 hover:bg-secondary/80 transition-colors"
        >
          <span className="text-xs font-medium">{chip.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={chip.onRemove}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {chip.label}</span>
          </Button>
        </Badge>
      ))}
      
      {/* Clear All */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Clear All
      </Button>
    </div>
  );
}

/**
 * Build filter chips from active filters
 */
function buildFilterChips(
  filters: ActiveFilters,
  onRemoveFilter: (type: string, key?: string, value?: string) => void
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  
  // Brand filter
  if (filters.brand) {
    chips.push({
      id: "brand",
      type: "Brand",
      label: `Brand: ${filters.brand}`,
      onRemove: () => onRemoveFilter("brand"),
    });
  }
  
  // Search query
  if (filters.searchQuery) {
    chips.push({
      id: "search",
      type: "Search",
      label: `Search: "${filters.searchQuery}"`,
      onRemove: () => onRemoveFilter("searchQuery"),
    });
  }
  
  // Price range
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    let label = "Price: ";
    if (min !== undefined && max !== undefined) {
      label += `$${min} - $${max}`;
    } else if (min !== undefined) {
      label += `> $${min}`;
    } else if (max !== undefined) {
      label += `< $${max}`;
    }
    
    chips.push({
      id: "price",
      type: "Price",
      label,
      onRemove: () => onRemoveFilter("priceRange"),
    });
  }
  
  // Stock filter
  if (filters.inStock !== undefined) {
    chips.push({
      id: "stock",
      type: "Stock",
      label: "In Stock Only",
      onRemove: () => onRemoveFilter("inStock"),
    });
  }
  
  // Variant attributes
  Object.entries(filters.variantAttributes).forEach(
    ([attrName, values]: [string, string[]]) => {
      values.forEach((value: string) => {
        chips.push({
          id: `variant-${attrName}-${value}`,
          type: attrName,
          label: `${attrName}: ${value}`,
          onRemove: () => onRemoveFilter("variantAttributes", attrName, value),
        });
      });
    }
  );
  
  // Product specifications
  Object.entries(filters.productSpecifications).forEach(
    ([specKey, values]: [string, string[]]) => {
      values.forEach((value: string) => {
        chips.push({
          id: `spec-${specKey}-${value}`,
          type: specKey,
          label: `${specKey}: ${value}`,
          onRemove: () => onRemoveFilter("productSpecifications", specKey, value),
        });
      });
    }
  );
  
  // Catalog codes
  if (filters.catalogCodes && filters.catalogCodes.length > 0) {
    filters.catalogCodes.forEach((code: string) => {
      chips.push({
        id: `catalog-${code}`,
        type: "Catalog",
        label: `Catalog: ${code}`,
        onRemove: () => onRemoveFilter("catalogCodes", undefined, code),
      });
    });
  }
  
  // Equipment codes
  if (filters.equipmentCodes && filters.equipmentCodes.length > 0) {
    filters.equipmentCodes.forEach((code: string) => {
      chips.push({
        id: `equipment-${code}`,
        type: "Equipment",
        label: `Equipment: ${code}`,
        onRemove: () => onRemoveFilter("equipmentCodes", undefined, code),
      });
    });
  }
  
  return chips;
}
