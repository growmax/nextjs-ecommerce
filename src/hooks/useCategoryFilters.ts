/**
 * useCategoryFilters Hook (Adapter)
 * 
 * Wrapper around useSmartFilters for backward compatibility.
 * Provides the same API as before but uses smart-filters internally.
 */

import type { CategoryContext } from "@/features/smart-filters";
import { useSmartFilters } from "@/features/smart-filters";
import type { CategoryFilterState } from "@/types/category-filters";
import { useCallback, useMemo } from "react";

/**
 * Hook to manage category filters
 * Now uses smart-filters module internally
 */
export function useCategoryFilters(categoryContext?: CategoryContext | null) {
  const {
    filters,
    updateFilters,
    toggleVariantAttribute,
    toggleProductSpecification,
    toggleCatalogCode,
    toggleEquipmentCode,
    setStockFilter,
    clearFilters,
    isPending,
  } = useSmartFilters({ categoryContext: categoryContext ?? null });

  /**
   * Calculate active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Count variant attributes
    Object.values(filters.variantAttributes || {}).forEach((values) => {
      count += values.length;
    });

    // Count product specifications
    Object.values(filters.productSpecifications || {}).forEach((values) => {
      count += values.length;
    });

    // Count stock filter
    if (filters.inStock !== undefined) {
      count += 1;
    }

    // Count catalog codes
    if (filters.catalogCodes?.length) {
      count += filters.catalogCodes.length;
    }

    // Count equipment codes
    if (filters.equipmentCodes?.length) {
      count += filters.equipmentCodes.length;
    }

    return count;
  }, [filters]);

  /**
   * Remove a specific variant attribute value
   */
  const removeVariantAttribute = useCallback(
    (attributeName: string, value: string) => {
      const currentValues = filters.variantAttributes?.[attributeName] || [];
      const newValues = currentValues.filter((v) => v !== value);

      const newAttrs = { ...filters.variantAttributes };
      if (newValues.length > 0) {
        newAttrs[attributeName] = newValues;
      } else {
        delete newAttrs[attributeName];
      }

      updateFilters({ variantAttributes: newAttrs });
    },
    [filters.variantAttributes, updateFilters]
  );

  /**
   * Remove a specific product specification value
   */
  const removeProductSpecification = useCallback(
    (specKey: string, value: string) => {
      const currentValues = filters.productSpecifications?.[specKey] || [];
      const newValues = currentValues.filter((v) => v !== value);

      const newSpecs = { ...filters.productSpecifications };
      if (newValues.length > 0) {
        newSpecs[specKey] = newValues;
      } else {
        delete newSpecs[specKey];
      }

      updateFilters({ productSpecifications: newSpecs });
    },
    [filters.productSpecifications, updateFilters]
  );

  /**
   * Return backward-compatible API
   */
  return {
    filters: {
      variantAttributes: filters.variantAttributes || {},
      productSpecifications: filters.productSpecifications || {},
      inStock: filters.inStock,
      catalogCodes: filters.catalogCodes,
      equipmentCodes: filters.equipmentCodes,
    } as CategoryFilterState,
    updateFilters,
    toggleVariantAttribute,
    toggleProductSpecification,
    setStockFilter,
    toggleCatalogCode,
    toggleEquipmentCode,
    clearAllFilters: clearFilters,
    removeVariantAttribute,
    removeProductSpecification,
    activeFilterCount,
    isPending,
  };
}


