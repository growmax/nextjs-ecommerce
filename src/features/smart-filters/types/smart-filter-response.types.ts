/**
 * Smart Filter Response Types
 * 
 * Unified response format for ALL filter types.
 * Backend returns complete filter data in ONE response.
 */

/**
 * Category Filter Option
 * Represents a single category in siblings or children
 */
export interface CategoryFilterOption {
  /** Unique category identifier */
  id: number;
  /** Display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Parent category ID (null for root) */
  parentId: number | null;
  /** Tree level (0 = root) */
  level: number;
  /** Product count with active filters applied */
  docCount: number;
  /** Navigation path for SEO routing */
  navigationPath?: string;
}

/**
 * Category Filter Response
 * Smart category filter with siblings + children logic
 */
export interface CategoryFilterData {
  /** Sibling categories (same level or level 0 for root) */
  siblings: CategoryFilterOption[];
  /** Child categories (one level below current) */
  children: CategoryFilterOption[];
}

/**
 * Brand Filter Option
 */
export interface BrandFilterOption {
  /** Brand name */
  name: string;
  /** Product count */
  count: number;
  /** URL-friendly slug */
  slug: string;
  /** Whether currently selected */
  isSelected?: boolean;
}

/**
 * Brand Filter Response
 */
export interface BrandFilterData {
  /** Available brands with counts */
  items: BrandFilterOption[];
}

/**
 * Price Range Filter Response
 */
export interface PriceRangeFilterData {
  /** Minimum price in results */
  min: number;
  /** Maximum price in results */
  max: number;
  /** Currently applied min (from URL) */
  activeMin?: number;
  /** Currently applied max (from URL) */
  activeMax?: number;
}

/**
 * Stock Filter Response
 */
export interface StockFilterData {
  /** Count of in-stock products */
  inStock: number;
  /** Count of out-of-stock products */
  outOfStock: number;
  /** Current filter state */
  activeState?: 'in_stock' | 'out_of_stock' | 'all';
}

/**
 * Variant Attribute Value
 */
export interface VariantAttributeValue {
  /** Attribute value */
  value: string;
  /** Product count */
  count: number;
}

/**
 * Variant Attribute Group
 */
export interface VariantAttributeGroup {
  /** Attribute name (Color, Size, etc.) */
  name: string;
  /** Available values with counts */
  values: VariantAttributeValue[];
}

/**
 * Variant Attributes Filter Response
 */
export interface VariantAttributesFilterData {
  /** Grouped variant attributes */
  groups: VariantAttributeGroup[];
}

/**
 * Product Specification Value
 */
export interface ProductSpecificationValue {
  /** Spec name */
  name: string;
  /** Spec value */
  value: string;
  /** Product count */
  count: number;
}

/**
 * Product Specification Group
 */
export interface ProductSpecificationGroup {
  /** Group name (Motor, Dimensions, etc.) */
  groupName: string;
  /** Specifications in this group */
  specs: ProductSpecificationValue[];
}

/**
 * Product Specifications Filter Response
 */
export interface ProductSpecificationsFilterData {
  /** Grouped product specifications */
  groups: ProductSpecificationGroup[];
}

/**
 * Catalog Code Option
 */
export interface CatalogCodeOption {
  /** Catalog code */
  code: string;
  /** Product count */
  count: number;
}

/**
 * Catalog Codes Filter Response
 */
export interface CatalogCodesFilterData {
  /** Available catalog codes */
  items: CatalogCodeOption[];
}

/**
 * Equipment Code Option
 */
export interface EquipmentCodeOption {
  /** Equipment code */
  code: string;
  /** Product count */
  count: number;
}

/**
 * Equipment Codes Filter Response
 */
export interface EquipmentCodesFilterData {
  /** Available equipment codes */
  items: EquipmentCodeOption[];
}

/**
 * Complete Smart Filter Response
 * 
 * Unified response containing ALL filter types.
 * This is what the backend returns and frontend consumes.
 */
export interface SmartFilterResponse {
  /** Whether the request was successful */
  success: boolean;

  /** Filter data organized by type */
  filters: {
    /** Smart category filter (siblings + children) */
    categories: CategoryFilterData;
    /** Brand filter options */
    brands: BrandFilterData;
    /** Price range statistics */
    priceRange: PriceRangeFilterData;
    /** Stock availability filter */
    stock: StockFilterData;
    /** Variant attribute filters */
    variantAttributes: VariantAttributesFilterData;
    /** Product specification filters */
    productSpecifications: ProductSpecificationsFilterData;
    /** Catalog code filters */
    catalogCodes: CatalogCodesFilterData;
    /** Equipment code filters */
    equipmentCodes: EquipmentCodesFilterData;
  };

  /** Total products matching current filters */
  totalProducts: number | undefined;

  /** Diagnostic information (dev only) */
  diagnostics?: SmartFilterDiagnostics;

  /** Error details if success = false */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Diagnostic information for debugging
 */
export interface SmartFilterDiagnostics {
  /** Time taken to build query (ms) */
  queryBuildTime?: number;
  /** Time taken to execute search (ms) */
  searchTime?: number;
  /** Time taken to format response (ms) */
  formatTime?: number;
  /** Category context used */
  categoryContext?: {
    level: number;
    categoryId: number | null;
    parentId: number | null;
  };
  /** Active filters applied */
  activeFilters?: Record<string, unknown>;
}

/**
 * Empty/Default Smart Filter Response
 * Use when no filters are available or on error
 */
export const EMPTY_SMART_FILTER_RESPONSE: SmartFilterResponse = {
  success: true,
  totalProducts: 0,
  filters: {
    categories: { siblings: [], children: [] },
    brands: { items: [] },
    priceRange: { min: 0, max: 0 },
    stock: { inStock: 0, outOfStock: 0 },
    variantAttributes: { groups: [] },
    productSpecifications: { groups: [] },
    catalogCodes: { items: [] },
    equipmentCodes: { items: [] },
  },
};
