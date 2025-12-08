"use client";

import { ActiveFiltersBar } from "@/components/ActiveFiltersBar";
import { TrendingBrands } from "@/components/TrendingBrands";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import type { BrandFilterOption } from "@/types/category-filters";
import { useRouter } from "next/navigation";

interface ProductListTopBarProps {
  brands: BrandFilterOption[];
  selectedBrands?: string[];
  onBrandClick?: (brandValue: string) => void;
  isBrandPage?: boolean;
  brandName?: string;
  brandRemovalPath?: string;
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
  brandName,
  brandRemovalPath,
}: ProductListTopBarProps) {
  const { activeFilterCount } = useCategoryFilters();
  const router = useRouter();

  // Determine which component to show
  const showActiveFilters =
    isBrandPage || // Always show active filters on brand pages
    selectedBrands.length > 0 || // Show when a brand is selected
    activeFilterCount > 0; // Show when any filters are active

  // Handler to remove brand filter (navigate away from brand page)
  const handleRemoveBrand = () => {
    if (brandRemovalPath) {
      router.push(brandRemovalPath);
    }
  };

  // Show active filters if conditions are met
  if (showActiveFilters) {
    return (
      <ActiveFiltersBar
        selectedBrandName={brandName}
        onRemoveBrand={brandName ? handleRemoveBrand : undefined}
      />
    );
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
