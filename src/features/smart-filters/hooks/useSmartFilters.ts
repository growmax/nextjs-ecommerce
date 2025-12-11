/**
 * useSmartFilters Hook
 * 
 * Client-side hook for managing Smart Filter state with URL synchronization.
 * Provides filter state management, URL updates, and filter manipulation functions.
 * 
 * @example
 * ```tsx
 * const {
 *   filters,
 *   categoryContext,
 *   updateFilters,
 *   clearFilters,
 *   isPending
 * } = useSmartFilters(initialState);
 * ```
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import type {
  ActiveFilters,
  CategoryContext,
  PriceRange,
  SmartFilterState,
} from "../types";

/**
 * Hook Options
 */
export interface UseSmartFiltersOptions {
  /** Initial category context (from server) */
  categoryContext?: CategoryContext | null;

  /** Initial active filters (from server) */
  initialFilters?: Partial<ActiveFilters>;

  /** Callback when filters change */
  onFiltersChange?: (filters: ActiveFilters) => void;
}

/**
 * Hook Return Type
 */
export interface UseSmartFiltersReturn {
  /** Current filter state */
  state: SmartFilterState;

  /** Active filters only (convenience accessor) */
  filters: ActiveFilters;

  /** Category context only (convenience accessor) */
  categoryContext: CategoryContext | null;

  /** Update multiple filters at once */
  updateFilters: (updates: Partial<ActiveFilters>) => void;

  /** Toggle a variant attribute value */
  toggleVariantAttribute: (attributeName: string, value: string) => void;

  /** Toggle a product specification value */
  toggleProductSpecification: (specKey: string, value: string) => void;

  /** Toggle catalog code */
  toggleCatalogCode: (code: string) => void;

  /** Toggle equipment code */
  toggleEquipmentCode: (code: string) => void;

  /** Set price range */
  setPriceRange: (range: PriceRange | undefined) => void;

  /** Set stock filter */
  setStockFilter: (inStock: boolean | undefined) => void;

  /** Clear all filters (reset to initial state) */
  clearFilters: () => void;

  /** Clear specific filter type */
  clearFilterType: (type: keyof ActiveFilters) => void;

  /** URL update pending state */
  isPending: boolean;
}

/**
 * Parse variant attributes from URL
 * Format: ?color=Red&color=Blue&size=Large
 */
function parseVariantAttributesFromURL(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const variantAttrs: Record<string, string[]> = {};

  // Known filter keys that are NOT variant attributes
  const knownKeys = new Set([
    "page",
    "sort",
    "brand",
    "search",
    "min_price",
    "max_price",
    "in_stock",
    "catalog_code",
    "equipment_code",
  ]);

  searchParams.forEach((value, key) => {
    // Product specs have 'spec_' prefix
    if (key.startsWith("spec_")) {
      return;
    }

    // Skip known filter keys
    if (knownKeys.has(key)) {
      return;
    }

    // Everything else is a variant attribute
    if (!variantAttrs[key]) {
      variantAttrs[key] = [];
    }
    variantAttrs[key].push(value);
  });

  return variantAttrs;
}

/**
 * Parse product specifications from URL
 * Format: ?spec_Material=Steel&spec_Material=Aluminum
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
 * Build URL search params from active filters
 */
function buildURLParams(
  filters: ActiveFilters,
  searchParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams();

  // Preserve page and sort from existing params
  const page = searchParams.get("page");
  const sort = searchParams.get("sort");
  if (page) params.set("page", page);
  if (sort) params.set("sort", sort);

  // Brand
  if (filters.brand) {
    params.set("brand", filters.brand);
  }

  // Search query
  if (filters.searchQuery) {
    params.set("search", filters.searchQuery);
  }

  // Price range
  if (filters.priceRange) {
    if (filters.priceRange.min !== undefined) {
      params.set("min_price", String(filters.priceRange.min));
    }
    if (filters.priceRange.max !== undefined) {
      params.set("max_price", String(filters.priceRange.max));
    }
  }

  // Stock filter
  if (filters.inStock !== undefined) {
    params.set("in_stock", String(filters.inStock));
  }

  // Variant attributes (multi-value)
  Object.entries(filters.variantAttributes).forEach(([attrName, values]) => {
    values.forEach((value) => {
      params.append(attrName, value);
    });
  });

  // Product specifications (multi-value with spec_ prefix)
  Object.entries(filters.productSpecifications).forEach(([specKey, values]) => {
    values.forEach((value) => {
      params.append(`spec_${specKey}`, value);
    });
  });

  // Catalog codes
  if (filters.catalogCodes && filters.catalogCodes.length > 0) {
    filters.catalogCodes.forEach((code) => {
      params.append("catalog_code", code);
    });
  }

  // Equipment codes
  if (filters.equipmentCodes && filters.equipmentCodes.length > 0) {
    filters.equipmentCodes.forEach((code) => {
      params.append("equipment_code", code);
    });
  }

  return params;
}

/**
 * useSmartFilters Hook
 * 
 * Manages Smart Filter state with URL synchronization.
 * Parses filters from URL on mount and updates URL on filter changes.
 */
export function useSmartFilters({
  categoryContext = null,
  initialFilters: _initialFilters = {},
  onFiltersChange,
}: UseSmartFiltersOptions = {}): UseSmartFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current filters from URL
  const currentFilters = useMemo<ActiveFilters>(() => {
    const variantAttributes = parseVariantAttributesFromURL(searchParams);
    const productSpecifications = parseProductSpecificationsFromURL(searchParams);

    const filters: ActiveFilters = {
      variantAttributes,
      productSpecifications,
    };

    // Brand
    const brand = searchParams.get("brand");
    if (brand) {
      filters.brand = brand;
    }

    // Search query
    const search = searchParams.get("search");
    if (search) {
      filters.searchQuery = search;
    }

    // Price range
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    if (minPrice || maxPrice) {
      filters.priceRange = {
        ...(minPrice ? { min: Number(minPrice) } : {}),
        ...(maxPrice ? { max: Number(maxPrice) } : {}),
      };
    }

    // Stock filter
    const inStock = searchParams.get("in_stock");
    if (inStock === "true") {
      filters.inStock = true;
    } else if (inStock === "false") {
      filters.inStock = false;
    }

    // Catalog codes
    const catalogCodes = searchParams.getAll("catalog_code");
    if (catalogCodes.length > 0) {
      filters.catalogCodes = catalogCodes;
    }

    // Equipment codes
    const equipmentCodes = searchParams.getAll("equipment_code");
    if (equipmentCodes.length > 0) {
      filters.equipmentCodes = equipmentCodes;
    }

    return filters;
  }, [searchParams]);

  // Build complete state
  const state: SmartFilterState = useMemo(
    () => ({
      categoryContext,
      activeFilters: currentFilters,
      isLoading: isPending,
      errors: [],
    }),
    [categoryContext, currentFilters, isPending]
  );

  /**
   * Update URL with new filters
   */
  const updateURL = useCallback(
    (newFilters: ActiveFilters) => {
      const params = buildURLParams(newFilters, searchParams);

      // Reset page to 1 when filters change (unless page is being explicitly set)
      if (!params.has("page")) {
        params.delete("page");
      }

      const newURL = params.toString() ? `${pathname}?${params}` : pathname;

      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });

      // Notify callback
      onFiltersChange?.(newFilters);
    },
    [pathname, searchParams, router, onFiltersChange]
  );

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback(
    (updates: Partial<ActiveFilters>) => {
      const newFilters: ActiveFilters = {
        ...currentFilters,
        variantAttributes: {
          ...currentFilters.variantAttributes,
          ...(updates.variantAttributes || {}),
        },
        productSpecifications: {
          ...currentFilters.productSpecifications,
          ...(updates.productSpecifications || {}),
        },
      };

      // Apply other updates
      if (updates.brand !== undefined) newFilters.brand = updates.brand;
      if (updates.searchQuery !== undefined) newFilters.searchQuery = updates.searchQuery;
      if (updates.priceRange !== undefined) newFilters.priceRange = updates.priceRange;
      if (updates.inStock !== undefined) newFilters.inStock = updates.inStock;
      if (updates.catalogCodes !== undefined) newFilters.catalogCodes = updates.catalogCodes;
      if (updates.equipmentCodes !== undefined) newFilters.equipmentCodes = updates.equipmentCodes;

      updateURL(newFilters);
    },
    [currentFilters, updateURL]
  );

  /**
   * Toggle a variant attribute value
   */
  const toggleVariantAttribute = useCallback(
    (attributeName: string, value: string) => {
      const currentValues = currentFilters.variantAttributes[attributeName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const newVariantAttrs = { ...currentFilters.variantAttributes };
      if (newValues.length > 0) {
        newVariantAttrs[attributeName] = newValues;
      } else {
        delete newVariantAttrs[attributeName];
      }

      updateFilters({ variantAttributes: newVariantAttrs });
    },
    [currentFilters, updateFilters]
  );

  /**
   * Toggle a product specification value
   */
  const toggleProductSpecification = useCallback(
    (specKey: string, value: string) => {
      const currentValues = currentFilters.productSpecifications[specKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const newSpecs = { ...currentFilters.productSpecifications };
      if (newValues.length > 0) {
        newSpecs[specKey] = newValues;
      } else {
        delete newSpecs[specKey];
      }

      updateFilters({ productSpecifications: newSpecs });
    },
    [currentFilters, updateFilters]
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

      if (newCodes.length > 0) {
        updateFilters({ catalogCodes: newCodes });
      } else {
        const { catalogCodes: _, ...rest } = currentFilters;
        updateURL(rest);
      }
    },
    [currentFilters, updateFilters, updateURL]
  );  /**
   * Toggle equipment code
   */
  const toggleEquipmentCode = useCallback(
    (code: string) => {
      const currentCodes = currentFilters.equipmentCodes || [];
      const newCodes = currentCodes.includes(code)
        ? currentCodes.filter((c) => c !== code)
        : [...currentCodes, code];

      if (newCodes.length > 0) {
        updateFilters({ equipmentCodes: newCodes });
      } else {
        const { equipmentCodes: _, ...rest } = currentFilters;
        updateURL(rest);
      }
    },
    [currentFilters, updateFilters, updateURL]
  );  /**
   * Set price range
   */
  const setPriceRange = useCallback(
    (range: PriceRange | undefined) => {
      if (range) {
        updateFilters({ priceRange: range });
      } else {
        const { priceRange: _, ...rest } = currentFilters;
        updateURL(rest);
      }
    },
    [currentFilters, updateFilters, updateURL]
  );

  /**
   * Set stock filter
   */
  const setStockFilter = useCallback(
    (inStock: boolean | undefined) => {
      if (inStock !== undefined) {
        updateFilters({ inStock });
      } else {
        const { inStock: _, ...rest } = currentFilters;
        updateURL(rest);
      }
    },
    [currentFilters, updateFilters, updateURL]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    const emptyFilters: ActiveFilters = {
      variantAttributes: {},
      productSpecifications: {},
    };
    updateURL(emptyFilters);
  }, [updateURL]);

  /**
   * Clear specific filter type
   */
  const clearFilterType = useCallback(
    (type: keyof ActiveFilters) => {
      if (type === "variantAttributes") {
        updateFilters({ variantAttributes: {} });
      } else if (type === "productSpecifications") {
        updateFilters({ productSpecifications: {} });
      } else {
        // For optional fields, rebuild filters without the specified type
        const newFilters = { ...currentFilters };
        delete newFilters[type];
        updateURL(newFilters);
      }
    },
    [currentFilters, updateFilters, updateURL]
  ); return {
    state,
    filters: currentFilters,
    categoryContext,
    updateFilters,
    toggleVariantAttribute,
    toggleProductSpecification,
    toggleCatalogCode,
    toggleEquipmentCode,
    setPriceRange,
    setStockFilter,
    clearFilters,
    clearFilterType,
    isPending,
  };
}
