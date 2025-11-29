/**
 * Category Filter Types and Interfaces
 * 
 * Defines all filter-related types for the category page filters
 */

/**
 * Filter value types
 */
export type FilterValue = string | number | boolean;

/**
 * Variant attribute filter structure
 * Key is the attribute name (e.g., "Color"), value is array of selected values
 */
export type VariantAttributeFilters = Record<string, string[]>;

/**
 * Product specification filter structure
 * Key is the specification key, value is array of selected values
 */
export type ProductSpecificationFilters = Record<string, string[]>;

/**
 * Category filter state
 */
export interface CategoryFilterState {
  /** Variant attributes filters (dynamic) */
  variantAttributes: VariantAttributeFilters;
  /** Product specifications filters */
  productSpecifications: ProductSpecificationFilters;
  /** Stock/Inventory status filter */
  inStock?: boolean | undefined;
  /** Catalog codes filter */
  catalogCodes?: string[] | undefined;
  /** Equipment codes filter */
  equipmentCodes?: string[] | undefined;
}

/**
 * Aggregation bucket item
 */
export interface AggregationBucket {
  key: string;
  doc_count: number;
}

/**
 * Aggregation result structure
 */
export interface AggregationResult {
  buckets: AggregationBucket[];
  doc_count?: number;
  value?: number; // For stats aggregations
  data?: {
    buckets: AggregationBucket[];
  };
}

/**
 * Catalog code filter option
 */
export interface CatalogCodeFilterOption extends FilterOption {
  /** Catalog code value */
  code: string;
}

/**
 * Equipment code filter option
 */
export interface EquipmentCodeFilterOption extends FilterOption {
  /** Equipment code value */
  code: string;
}

/**
 * Complete aggregations response
 */
export interface FilterAggregations {
  /** Brands aggregation */
  brands?: AggregationResult;
  /** Categories aggregation (child categories) */
  categories?: AggregationResult;
  /** Subcategories aggregation */
  subcategories?: AggregationResult;
  /** Major categories aggregation */
  majorCategories?: AggregationResult;
  /** Variant attributes aggregation - dynamic structure */
  variantAttributes?: Record<string, AggregationResult>;
  /** Product specifications aggregation */
  productSpecifications?: Record<string, AggregationResult>;
  /** Stock/inventory aggregation */
  stockStatus?: AggregationResult;
  /** Catalog codes aggregation */
  catalogCodes?: AggregationResult;
  /** Equipment codes aggregation */
  equipmentCodes?: AggregationResult;
}

/**
 * Filter option for display in UI
 */
export interface FilterOption {
  /** Display label */
  label: string;
  /** Filter value */
  value: string;
  /** Count of products matching this filter */
  count: number;
  /** Whether this option is currently selected */
  selected?: boolean;
}

/**
 * Category filter option with navigation path
 */
export interface CategoryFilterOption extends FilterOption {
  /** Category ID */
  categoryId: number;
  /** Full category path for navigation */
  categoryPath: string;
  /** Category slug */
  categorySlug: string;
  /** Whether this is a child category */
  isChild: boolean;
  /** Whether this is a sibling/parallel category */
  isSibling: boolean;
}

/**
 * Brand filter option with navigation path
 */
export interface BrandFilterOption extends FilterOption {
  /** Brand name for navigation */
  brandName: string;
  /** Navigation path: /brands/{brandName}/category */
  navigationPath: string;
}

/**
 * Variant attribute filter group
 */
export interface VariantAttributeGroup {
  /** Attribute name (e.g., "Color", "Size") */
  attributeName: string;
  /** Available options for this attribute */
  options: FilterOption[];
}

/**
 * Product specification filter group
 */
export interface ProductSpecificationGroup {
  /** Specification key */
  specKey: string;
  /** Specification display name */
  specName: string;
  /** Available options for this specification */
  options: FilterOption[];
}

