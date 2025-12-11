/**
 * Smart Filter Types - Public API
 * 
 * Central export point for all Smart Filter types.
 */

// Core types
export type {
  ActiveFilters, CategoryContext, FilterError,
  OpenSearchQueryBool, PriceRange, RequestContext, SmartFilterState
} from "./smart-filter.types";

export { FilterType } from "./smart-filter.types";

// Smart Filter Request/Response types (NEW unified types)
export type {
  SmartFilterRequest
} from "./smart-filter-request.types";

export type {
  BrandFilterData, CatalogCodesFilterData, CategoryFilterData, EquipmentCodesFilterData, PriceRangeFilterData, ProductSpecificationsFilterData, SmartFilterDiagnostics, SmartFilterResponse, StockFilterData,
  VariantAttributesFilterData
} from "./smart-filter-response.types";

export { EMPTY_SMART_FILTER_RESPONSE } from "./smart-filter-response.types";

// API contract types (legacy - for backward compatibility)
export type {
  CodeFilterOption, FilterOption, PerformanceMetrics, PriceFilterOption, SmartFilterAPIRequest,
  SmartFilterAPIResponse, SmartFilterConfig, SpecificationGroup, StockFilterOption, VariantAttributeGroup
} from "./api-contracts.types";

