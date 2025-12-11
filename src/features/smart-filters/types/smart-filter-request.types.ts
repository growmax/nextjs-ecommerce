/**
 * Smart Filter Request Types
 * 
 * Input types for Smart Filter service calls.
 */

import type { RequestContext } from "@/lib/api/client";

/**
 * Category Context
 * Current category information for smart category filter logic
 */
export interface CategoryContext {
  /** Current category ID */
  categoryId: number;
  /** Current category name */
  categoryName: string;
  /** Current category slug */
  categorySlug: string;
  /** Category level (0 = root) */
  categoryLevel: number;
  /** Parent category ID (null for root) */
  parentId: number | null;
  /** Full slug path */
  fullPath: string[];
  /** Full ID path */
  pathIds: number[];
}

/**
 * Active Filters
 * Current filter state from URL parameters
 */
export interface ActiveFilters {
  /** Selected brand slug */
  brand?: string;
  /** Search query */
  search?: string;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Stock filter */
  inStock?: boolean;
  /** Variant attributes: { "Color": ["Red", "Blue"], "Size": ["M", "L"] } */
  variantAttributes?: Record<string, string[]>;
  /** Product specs: { "HP": ["5 HP", "10 HP"] } */
  productSpecifications?: Record<string, string[]>;
  /** Catalog codes */
  catalogCodes?: string[];
  /** Equipment codes */
  equipmentCodes?: string[];
}

/**
 * Smart Filter Request
 * Input to SmartFilterService.getFilters()
 */
export interface SmartFilterRequest {
  /** OpenSearch index name */
  elasticIndex: string;

  /** Current category context (null = root level / all categories) */
  currentCategory: CategoryContext | null;

  /** Active filters from URL */
  activeFilters: ActiveFilters;

  /** Request context (tenant, auth, etc.) */
  context: RequestContext;

  /** Optional: bucket size limit for aggregations */
  bucketSize?: number;
}

/**
 * Parse URL search params into ActiveFilters
 */
export function parseActiveFiltersFromParams(
  params: Record<string, string | string[] | undefined>
): ActiveFilters {
  const variantAttributes: Record<string, string[]> = {};
  const productSpecifications: Record<string, string[]> = {};

  // Known non-filter keys to skip
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

  // Parse variant attributes and product specs from dynamic keys
  for (const [key, value] of Object.entries(params)) {
    if (knownKeys.has(key) || value === undefined) continue;

    const values = Array.isArray(value) ? value : [value];
    const filteredValues = values.filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );

    if (filteredValues.length === 0) continue;

    // Check if it's a variant attribute (va_) or product spec (ps_)
    if (key.startsWith("va_")) {
      const attrName = key.slice(3); // Remove "va_" prefix
      variantAttributes[attrName] = filteredValues;
    } else if (key.startsWith("ps_")) {
      const specName = key.slice(3); // Remove "ps_" prefix
      productSpecifications[specName] = filteredValues;
    }
  }

  // Parse catalog codes
  const catalogCodes = params.catalog_code
    ? (Array.isArray(params.catalog_code)
      ? params.catalog_code
      : [params.catalog_code]
    ).filter((v): v is string => typeof v === "string")
    : undefined;

  // Parse equipment codes
  const equipmentCodes = params.equipment_code
    ? (Array.isArray(params.equipment_code)
      ? params.equipment_code
      : [params.equipment_code]
    ).filter((v): v is string => typeof v === "string")
    : undefined;

  return {
    ...(params.brand &&
      typeof params.brand === "string" && { brand: params.brand }),
    ...(params.search &&
      typeof params.search === "string" && { search: params.search }),
    ...(params.min_price && {
      minPrice: parseFloat(String(params.min_price)),
    }),
    ...(params.max_price && {
      maxPrice: parseFloat(String(params.max_price)),
    }),
    ...(params.in_stock === "true" && { inStock: true }),
    ...(params.in_stock === "false" && { inStock: false }),
    ...(Object.keys(variantAttributes).length > 0 && { variantAttributes }),
    ...(Object.keys(productSpecifications).length > 0 && {
      productSpecifications,
    }),
    ...(catalogCodes && catalogCodes.length > 0 && { catalogCodes }),
    ...(equipmentCodes && equipmentCodes.length > 0 && { equipmentCodes }),
  };
}
