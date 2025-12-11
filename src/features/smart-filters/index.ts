/**
 * Smart Filters - Public API
 * 
 * Main export point for the Smart Filters feature module.
 * Import everything you need from this single file.
 * 
 * @example
 * import SmartFilterService, { useSmartFilters, SmartFilterSection } from '@/features/smart-filters';
 */

// Services - Default export for SmartFilterService instance
export { default, default as SmartFilterService, SmartFilterService as SmartFilterServiceClass } from "./services/SmartFilterService";

// Hooks
export { useSmartFilters } from "./hooks";
export type { UseSmartFiltersOptions, UseSmartFiltersReturn } from "./hooks";

// Components
export { ActiveFiltersBar, FilterOptionList, SmartCategoryFilter, SmartFilterSection } from "./components";
export type { ActiveFilterChip, FilterOption } from "./components";

// Filter Components (explicit exports to avoid conflicts)
export {
  BrandFilter,
  PriceRangeFilter, ProductSpecificationFilters,
  StockFilter, VariantAttributeFilters
} from "./components/filters";

// Query Builders
export { buildActiveFilterClauses, buildSmartFilterAggregationQuery } from "./queries/SmartFilterAggregationBuilder";

// Formatters
export { formatSmartFilterResponse } from "./formatters/SmartFilterFormatter";

// Utilities
export * from "./utils";

// Types - Response types (canonical source for data types)
export { EMPTY_SMART_FILTER_RESPONSE } from "./types/smart-filter-response.types";
export type {
  BrandFilterData,
  BrandFilterOption,
  CatalogCodeOption,
  CatalogCodesFilterData,
  CategoryFilterData,
  CategoryFilterOption,
  EquipmentCodeOption,
  EquipmentCodesFilterData,
  PriceRangeFilterData,
  ProductSpecificationGroup,
  ProductSpecificationsFilterData,
  ProductSpecificationValue,
  SmartFilterDiagnostics,
  SmartFilterResponse,
  StockFilterData,
  VariantAttributeGroup,
  VariantAttributesFilterData,
  VariantAttributeValue
} from "./types/smart-filter-response.types";

// Types - Request types
export { parseActiveFiltersFromParams } from "./types/smart-filter-request.types";
export type {
  ActiveFilters,
  CategoryContext,
  SmartFilterRequest
} from "./types/smart-filter-request.types";


