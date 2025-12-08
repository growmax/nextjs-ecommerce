"use client";

import { ActiveFiltersBar } from "@/components/ActiveFiltersBar";
import { TrendingBrands } from "@/components/TrendingBrands";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import type { BrandFilterOption } from "@/types/category-filters";

interface ProductListTopBarProps {
  brands: BrandFilterOption[];
  selectedBrands?: string[];
  onBrandClick?: (brandValue: string) => void;
  isBrandPage?: boolean;
}

/**
 * ProductListTopBar Component
 * Smart wrapper that switches between TrendingBrands and ActiveFiltersBar
 * based on the current page context and filter state
 */
export function ProductListTopBar({
  brands,
  selectedBrands = [],
  onBrandClick,
  isBrandPage = false,
}: ProductListTopBarProps) {
  const { activeFilterCount } = useCategoryFilters();

  // Determine which component to show
  const showActiveFilters =
    isBrandPage || // Always show active filters on brand pages
    selectedBrands.length > 0 || // Show when a brand is selected
    activeFilterCount > 0; // Show when any filters are active

  // Show active filters if conditions are met
  if (showActiveFilters) {
    return <ActiveFiltersBar />;
  }

  // Otherwise show trending brands
  return (
    <TrendingBrands
      brands={brands}
      selectedBrands={selectedBrands}
      {...(onBrandClick && { onBrandClick })}
    />
  );
}
