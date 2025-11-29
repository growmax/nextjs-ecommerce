/**
 * useCategoryFilters Hook
 * 
 * Manages filter state for category page filters
 * Handles URL synchronization and filter updates
 */

import type { CategoryFilterState } from "@/types/category-filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

/**
 * Parse variant attributes from URL
 * Format: ?color=Red&color=Blue&size=Large
 */
function parseVariantAttributesFromURL(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const variantAttrs: Record<string, string[]> = {};

  // Get all keys that might be variant attributes
  // We'll need to determine this based on known attributes or pass them as a prop
  // For now, we'll parse any key that's not a known filter key
  const knownKeys = new Set([
    "page",
    "sort",
    "in_stock",
    "min_price",
    "max_price",
    "catalog_code",
    "equipment_code",
    // Add other known filter keys here
  ]);

  searchParams.forEach((value, key) => {
    if (!knownKeys.has(key)) {
      // Assume this is a variant attribute or product specification
      if (!variantAttrs[key]) {
        variantAttrs[key] = [];
      }
      variantAttrs[key].push(value);
    }
  });

  return variantAttrs;
}

/**
 * Parse product specifications from URL
 * Format: ?spec_key=value1&spec_key=value2
 * We'll use a prefix to distinguish specs from variant attributes
 */
function parseProductSpecificationsFromURL(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const specs: Record<string, string[]> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith("spec_")) {
      const specKey = key.replace("spec_", "");
      if (!specs[specKey]) {
        specs[specKey] = [];
      }
      specs[specKey].push(value);
    }
  });

  return specs;
}

/**
 * Build URL search params from filter state
 */
function buildURLParams(
  filters: CategoryFilterState,
  existingParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existingParams);

  // Remove existing filter params
  const keysToRemove: string[] = [];
  params.forEach((_, key) => {
    if (
      key !== "page" &&
      key !== "sort" &&
      !key.startsWith("spec_") &&
      key !== "in_stock" &&
      key !== "min_price" &&
      key !== "max_price" &&
      key !== "catalog_code" &&
      key !== "equipment_code"
    ) {
      keysToRemove.push(key);
    }
  });
  keysToRemove.forEach((key) => params.delete(key));

  // Add variant attributes
  Object.entries(filters.variantAttributes).forEach(([attrName, values]) => {
    values.forEach((value) => {
      params.append(attrName, value);
    });
  });

  // Add product specifications
  Object.entries(filters.productSpecifications).forEach(([specKey, values]) => {
    values.forEach((value) => {
      params.append(`spec_${specKey}`, value);
    });
  });

  // Add stock filter
  if (filters.inStock !== undefined) {
    params.set("in_stock", String(filters.inStock));
  } else {
    params.delete("in_stock");
  }

  // Add price range filter
  if (filters.priceRange?.min !== undefined) {
    params.set("min_price", String(filters.priceRange.min));
  } else {
    params.delete("min_price");
  }
  if (filters.priceRange?.max !== undefined) {
    params.set("max_price", String(filters.priceRange.max));
  } else {
    params.delete("max_price");
  }

  // Add catalog codes
  if (filters.catalogCodes && filters.catalogCodes.length > 0) {
    // Remove existing catalog_code params
    params.delete("catalog_code");
    filters.catalogCodes.forEach((code) => {
      params.append("catalog_code", code);
    });
  } else {
    params.delete("catalog_code");
  }

  // Add equipment codes
  if (filters.equipmentCodes && filters.equipmentCodes.length > 0) {
    // Remove existing equipment_code params
    params.delete("equipment_code");
    filters.equipmentCodes.forEach((code) => {
      params.append("equipment_code", code);
    });
  } else {
    params.delete("equipment_code");
  }

  return params;
}

/**
 * Hook to manage category filters
 */
export function useCategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current filters from URL
  const currentFilters = useMemo<CategoryFilterState>(() => {
    const variantAttributes = parseVariantAttributesFromURL(searchParams);
    const productSpecifications = parseProductSpecificationsFromURL(searchParams);
    const inStockParam = searchParams.get("in_stock");
    const inStock =
      inStockParam === "true"
        ? true
        : inStockParam === "false"
        ? false
        : undefined;

    // Parse price range
    const minPriceParam = searchParams.get("min_price");
    const maxPriceParam = searchParams.get("max_price");
    let priceRange: { min?: number; max?: number } | undefined = undefined;
    if (minPriceParam || maxPriceParam) {
      priceRange = {};
      if (minPriceParam) {
        const minPrice = parseFloat(minPriceParam);
        if (!isNaN(minPrice)) priceRange.min = minPrice;
      }
      if (maxPriceParam) {
        const maxPrice = parseFloat(maxPriceParam);
        if (!isNaN(maxPrice)) priceRange.max = maxPrice;
      }
      // If no valid prices were parsed, set to undefined
      if (Object.keys(priceRange).length === 0) {
        priceRange = undefined;
      }
    }

    // Parse catalog codes
    const catalogCodes = searchParams.getAll("catalog_code").filter(Boolean);

    // Parse equipment codes
    const equipmentCodes = searchParams.getAll("equipment_code").filter(Boolean);

    return {
      variantAttributes,
      productSpecifications,
      inStock: inStock as boolean | undefined,
      priceRange,
      catalogCodes: catalogCodes.length > 0 ? catalogCodes : undefined,
      equipmentCodes: equipmentCodes.length > 0 ? equipmentCodes : undefined,
    };
  }, [searchParams]);

  /**
   * Update filters in URL
   */
  const updateFilters = useCallback(
    (newFilters: Partial<CategoryFilterState>) => {
      const updatedFilters: CategoryFilterState = {
        ...currentFilters,
        ...newFilters,
      };

      // Merge variant attributes
      if (newFilters.variantAttributes !== undefined) {
        updatedFilters.variantAttributes = newFilters.variantAttributes;
      }

      // Merge product specifications
      if (newFilters.productSpecifications !== undefined) {
        updatedFilters.productSpecifications = newFilters.productSpecifications;
      }

      const params = buildURLParams(updatedFilters, searchParams);

      // Reset page to 1 when filters change
      params.delete("page");

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, router, searchParams, currentFilters]
  );

  /**
   * Toggle variant attribute value
   */
  const toggleVariantAttribute = useCallback(
    (attributeName: string, value: string) => {
      const currentValues = currentFilters.variantAttributes[attributeName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      updateFilters({
        variantAttributes: {
          ...currentFilters.variantAttributes,
          ...(newValues.length > 0 ? { [attributeName]: newValues } : {}),
        },
      });
    },
    [currentFilters.variantAttributes, updateFilters]
  );

  /**
   * Toggle product specification value
   */
  const toggleProductSpecification = useCallback(
    (specKey: string, value: string) => {
      const currentValues =
        currentFilters.productSpecifications[specKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      updateFilters({
        productSpecifications: {
          ...currentFilters.productSpecifications,
          ...(newValues.length > 0 ? { [specKey]: newValues } : {}),
        },
      });
    },
    [currentFilters.productSpecifications, updateFilters]
  );

  /**
   * Set stock filter
   */
  const setStockFilter = useCallback(
    (inStock: boolean | undefined) => {
      updateFilters({ inStock: inStock as boolean | undefined });
    },
    [updateFilters]
  );

  /**
   * Set price range filter
   */
  const setPriceRange = useCallback(
    (priceRange: { min?: number; max?: number } | undefined) => {
      updateFilters({ priceRange });
    },
    [updateFilters]
  );

  /**
   * Toggle catalog code
   */
  const toggleCatalogCode = useCallback(
    (code: string) => {
      const currentCodes = currentFilters.catalogCodes || [];
      const newCodes = currentCodes.includes(code)
        ? currentCodes.filter((c) => c !== code)
        : [...currentCodes, code];

      updateFilters({
        catalogCodes: newCodes.length > 0 ? newCodes : undefined,
      });
    },
    [currentFilters.catalogCodes, updateFilters]
  );

  /**
   * Toggle equipment code
   */
  const toggleEquipmentCode = useCallback(
    (code: string) => {
      const currentCodes = currentFilters.equipmentCodes || [];
      const newCodes = currentCodes.includes(code)
        ? currentCodes.filter((c) => c !== code)
        : [...currentCodes, code];

      updateFilters({
        equipmentCodes: newCodes.length > 0 ? newCodes : undefined,
      });
    },
    [currentFilters.equipmentCodes, updateFilters]
  );

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Remove all filter params except page and sort
    const keysToRemove: string[] = [];
    params.forEach((_, key) => {
      if (key !== "page" && key !== "sort") {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => params.delete(key));

    const newURL = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    startTransition(() => {
      router.replace(newURL, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  /**
   * Remove a specific variant attribute filter
   */
  const removeVariantAttribute = useCallback(
    (attributeName: string, value: string) => {
      const currentValues = currentFilters.variantAttributes[attributeName] || [];
      const newValues = currentValues.filter((v) => v !== value);

      const newVariantAttrs = { ...currentFilters.variantAttributes };
      if (newValues.length > 0) {
        newVariantAttrs[attributeName] = newValues;
      } else {
        delete newVariantAttrs[attributeName];
      }

      updateFilters({
        variantAttributes: newVariantAttrs,
      });
    },
    [currentFilters.variantAttributes, updateFilters]
  );

  /**
   * Remove a specific product specification filter
   */
  const removeProductSpecification = useCallback(
    (specKey: string, value: string) => {
      const currentValues =
        currentFilters.productSpecifications[specKey] || [];
      const newValues = currentValues.filter((v) => v !== value);

      const newSpecs = { ...currentFilters.productSpecifications };
      if (newValues.length > 0) {
        newSpecs[specKey] = newValues;
      } else {
        delete newSpecs[specKey];
      }

      updateFilters({
        productSpecifications: newSpecs,
      });
    },
    [currentFilters.productSpecifications, updateFilters]
  );

  /**
   * Get count of active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Count variant attributes
    Object.values(currentFilters.variantAttributes).forEach((values) => {
      count += values.length;
    });

    // Count product specifications
    Object.values(currentFilters.productSpecifications).forEach((values) => {
      count += values.length;
    });

    // Count stock filter
    if (currentFilters.inStock !== undefined) {
      count += 1;
    }

    // Count price range filter
    if (currentFilters.priceRange?.min !== undefined || currentFilters.priceRange?.max !== undefined) {
      count += 1;
    }

    // Count catalog codes
    if (currentFilters.catalogCodes && currentFilters.catalogCodes.length > 0) {
      count += currentFilters.catalogCodes.length;
    }

    // Count equipment codes
    if (currentFilters.equipmentCodes && currentFilters.equipmentCodes.length > 0) {
      count += currentFilters.equipmentCodes.length;
    }

    return count;
  }, [currentFilters]);

  return {
    filters: currentFilters,
    updateFilters,
    toggleVariantAttribute,
    toggleProductSpecification,
    setStockFilter,
    setPriceRange,
    toggleCatalogCode,
    toggleEquipmentCode,
    clearAllFilters,
    removeVariantAttribute,
    removeProductSpecification,
    activeFilterCount,
    isPending,
  };
}

