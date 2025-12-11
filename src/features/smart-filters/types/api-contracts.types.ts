/**
 * Smart Filter API Contracts
 * 
 * Unified API request/response types for the complete Smart Filter system.
 * NOTE: These are LEGACY types - prefer SmartFilterRequest/SmartFilterResponse
 */

import type { CategoryFilterData } from "./smart-filter-response.types";
import type {
  ActiveFilters,
  CategoryContext,
  FilterType,
  RequestContext,
} from "./smart-filter.types";

/**
 * Smart Filter API Request
 * Unified request for fetching all filter types
 */
export interface SmartFilterAPIRequest {
  /** OpenSearch index name */
  elasticIndex: string;

  /** Current category context */
  categoryContext: CategoryContext | null;

  /** Active filters (excluding category) */
  activeFilters: ActiveFilters;

  /** Which filter types to fetch */
  requestedFilters: FilterType[];

  /** Optional: pagination for products */
  pagination?: {
    page: number;
    pageSize: number;
  };

  /** Request context */
  context: RequestContext;

  /** Optional: configuration overrides */
  config?: SmartFilterConfig;
}

/**
 * Smart Filter API Response
 * Unified response with all requested filter data
 */
export interface SmartFilterAPIResponse {
  /** Success indicator */
  success: boolean;

  /** Category filters (siblings + children) */
  categoryFilters: CategoryFilterData;

  /** Brand filter options */
  brandFilters: BrandFilterOption[];

  /** Variant attribute filter groups */
  variantAttributeFilters: VariantAttributeGroup[];

  /** Product specification filter groups */
  specificationFilters: SpecificationGroup[];

  /** Stock filter option */
  stockFilter: StockFilterOption;

  /** Price filter option with stats */
  priceFilter: PriceFilterOption;

  /** Catalog code filter options */
  catalogCodeFilters: CodeFilterOption[];

  /** Equipment code filter options */
  equipmentCodeFilters: CodeFilterOption[];

  /** Performance metrics */
  metrics?: PerformanceMetrics;

  /** Error details (if success = false) */
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Brand Filter Option
 */
export interface BrandFilterOption {
  /** Brand name */
  brandName: string;

  /** Display label */
  label: string;

  /** Filter value */
  value: string;

  /** Product count with this brand */
  productCount: number;

  /** Is this brand currently selected? */
  isSelected: boolean;

  /** Navigation path */
  navigationPath: string;
}

/**
 * Variant Attribute Group
 * Dynamic attribute groups (Color, Size, Material, etc.)
 */
export interface VariantAttributeGroup {
  /** Attribute name (e.g., "Color", "Size") */
  attributeName: string;

  /** Display label */
  displayName: string;

  /** Available options */
  options: FilterOption[];

  /** Icon or visual hint */
  icon?: string;
}

/**
 * Specification Group
 * Product specification filter group
 */
export interface SpecificationGroup {
  /** Specification key */
  specKey: string;

  /** Display name */
  displayName: string;

  /** Available options */
  options: FilterOption[];
}

/**
 * Generic Filter Option
 */
export interface FilterOption {
  /** Display label */
  label: string;

  /** Filter value */
  value: string;

  /** Product count */
  count: number;

  /** Is selected? */
  selected: boolean;
}

/**
 * Stock Filter Option
 */
export interface StockFilterOption {
  /** Available options */
  options: Array<{
    label: string;
    value: boolean | undefined; // true = in stock, false = out of stock, undefined = all
    count: number;
  }>;

  /** Currently selected value */
  selectedValue?: boolean;
}

/**
 * Price Filter Option
 */
export interface PriceFilterOption {
  /** Minimum price in dataset */
  minPrice: number;

  /** Maximum price in dataset */
  maxPrice: number;

  /** Average price */
  avgPrice?: number;

  /** Currently selected range */
  selectedRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Code Filter Option
 * For catalog and equipment codes
 */
export interface CodeFilterOption {
  /** Code value */
  code: string;

  /** Display label */
  label: string;

  /** Product count */
  count: number;

  /** Is selected? */
  selected: boolean;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  /** Total request time (ms) */
  totalTime: number;

  /** Query execution time (ms) */
  queryTime?: number;

  /** Aggregation time (ms) */
  aggregationTime?: number;

  /** Number of parallel requests */
  parallelRequests?: number;

  /** Cache hit/miss info */
  cacheInfo?: {
    hit: boolean;
    key?: string;
  };
}

/**
 * Smart Filter Configuration
 * Optional configuration overrides
 */
export interface SmartFilterConfig {
  /** Aggregation bucket size limits */
  bucketSizes?: {
    categories?: number;
    brands?: number;
    attributes?: number;
    specifications?: number;
  };

  /** Enable/disable caching */
  enableCache?: boolean;

  /** Cache TTL (seconds) */
  cacheTTL?: number;

  /** Enable diagnostics */
  enableDiagnostics?: boolean;
}
