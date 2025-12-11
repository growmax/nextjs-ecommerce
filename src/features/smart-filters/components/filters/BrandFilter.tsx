/**
 * BrandFilter Component
 * 
 * Filter by brand with navigation support.
 * Integrates with useSmartFilters hook.
 */

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FilterOption, FilterOptionList } from "../FilterOptionList";

export interface BrandFilterOption {
  /** Brand slug/value */
  value: string;
  
  /** Brand display name */
  label: string;
  
  /** Product count for this brand */
  count?: number;
  
  /** Is this brand currently selected */
  selected?: boolean;
  
  /** Navigation path to brand page */
  navigationPath: string;
}

interface BrandFilterProps {
  /** Available brands */
  brands: BrandFilterOption[];
  
  /** Path to navigate when deselecting brand */
  brandRemovalPath?: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom navigation handler (optional) */
  onNavigate?: (brand: BrandFilterOption) => void;
}

/**
 * BrandFilter
 * 
 * Shows brands with navigation to brand pages.
 * Clicking selected brand navigates to removal path (unselect).
 */
export function BrandFilter({
  brands,
  brandRemovalPath,
  isLoading = false,
  onNavigate,
}: BrandFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleBrandToggle = (value: string) => {
    const brand = brands.find((b) => b.value === value);
    if (!brand) return;
    
    // Custom navigation handler
    if (onNavigate) {
      onNavigate(brand);
      return;
    }
    
    // Default navigation logic
    if (brand.selected && brandRemovalPath) {
      // UNSELECT: Navigate away from brand
      startTransition(() => {
        router.push(brandRemovalPath);
      });
    } else {
      // SELECT: Navigate to brand page
      startTransition(() => {
        router.push(brand.navigationPath);
      });
    }
  };
  
  // Convert to FilterOption format
  const options: FilterOption[] = brands.map((brand) => {
    const option: FilterOption = {
      value: brand.value,
      label: brand.label,
      disabled: isPending,
    };
    if (brand.selected !== undefined) {
      option.selected = brand.selected;
    }
    if (brand.count !== undefined) {
      option.count = brand.count;
    }
    return option;
  });
  
  return (
    <FilterOptionList
      options={options}
      onToggle={handleBrandToggle}
      multiple={false}
      searchable={brands.length > 5}
      searchPlaceholder="Search brands..."
      showCounts={true}
      isLoading={isLoading}
      emptyMessage="No brands available"
    />
  );
}
