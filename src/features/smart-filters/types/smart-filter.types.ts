/**
 * Smart Filter Core Types
 * 
 * Central type definitions for the Smart Filter system.
 * Represents filter state, context, and errors.
 */

import type { RequestContext } from "@/lib/api/client";

/**
 * Smart Filter State
 * Complete filter context for a page
 */
export interface SmartFilterState {
  /** Current position in category tree (not part of active filters) */
  categoryContext: CategoryContext | null;

  /** Active filters that affect product counts */
  activeFilters: ActiveFilters;

  /** Loading state */
  isLoading: boolean;

  /** Validation or API errors */
  errors: FilterError[];
}

/**
 * Category Context
 * Represents current position in the category hierarchy
 */
export interface CategoryContext {
  /** Unique category identifier */
  categoryId: number;

  /** Display name */
  categoryName: string;

  /** URL-friendly slug */
  categorySlug: string;

  /** Tree level (0 = root) */
  categoryLevel: number;

  /** Parent category ID (null for root level) */
  parentId: number | null;

  /** Full path slugs array */
  fullPath: string[];

  /** Optional: full path IDs */
  pathIds?: number[];
}

/**
 * Active Filters
 * Non-category filters that affect product results and aggregation counts
 */
export interface ActiveFilters {
  /** Brand filter (single selection via navigation) */
  brand?: string;

  /** Search query text */
  searchQuery?: string;

  /** Price range filter */
  priceRange?: PriceRange;

  /** Stock availability filter */
  inStock?: boolean;

  /** Variant attributes (Color, Size, Material, etc.) */
  variantAttributes: Record<string, string[]>;

  /** Product specifications (nested structure) */
  productSpecifications: Record<string, string[]>;

  /** Catalog codes filter */
  catalogCodes?: string[];

  /** Equipment codes filter */
  equipmentCodes?: string[];
}

/**
 * Price Range
 */
export interface PriceRange {
  min?: number;
  max?: number;
}

/**
 * Filter Error
 */
export interface FilterError {
  type: 'validation' | 'api' | 'parse' | 'network';
  message: string;
  field?: string;
  code?: string;
}

/**
 * Filter Type Enum
 * Identifies which filters to fetch
 */
export enum FilterType {
  CATEGORY = 'category',
  BRAND = 'brand',
  VARIANT_ATTRIBUTE = 'variant_attribute',
  SPECIFICATION = 'specification',
  STOCK = 'stock',
  PRICE = 'price',
  CATALOG_CODE = 'catalog_code',
  EQUIPMENT_CODE = 'equipment_code',
}

/**
 * OpenSearch Query Bool Structure
 * Base query structure for building filters
 */
export interface OpenSearchQueryBool {
  must: Array<Record<string, unknown>>;
  must_not: Array<Record<string, unknown>>;
  should?: Array<Record<string, unknown>>;
  minimum_should_match?: number;
}

/**
 * Request Context (re-export for convenience)
 */
export type { RequestContext };
