/**
 * Smart Filter Response Formatter
 * 
 * Transforms raw OpenSearch aggregation response into SmartFilterResponse format.
 */

import type { ActiveFilters, CategoryContext } from "../types/smart-filter-request.types";
import type {
  BrandFilterData,
  CatalogCodesFilterData,
  CategoryFilterData,
  CategoryFilterOption,
  EquipmentCodesFilterData,
  PriceRangeFilterData,
  ProductSpecificationsFilterData,
  SmartFilterResponse,
  StockFilterData,
  VariantAttributesFilterData
} from "../types/smart-filter-response.types";

/**
 * Raw aggregation bucket from OpenSearch
 */
interface AggBucket {
  key: string | number | Array<string | number | null>;
  key_as_string?: string;
  doc_count: number;
}

/**
 * Parse a raw OpenSearch category bucket into a CategoryFilterOption
 * 
 * Bucket key structure: [categoryId, categoryName, categorySlug, parentId, categoryLevel]
 * parentId uses -1 as missing value (for root categories)
 */
function parseCategoryBucket(bucket: any): CategoryFilterOption | null {
  const key = bucket.key as (string | number | null)[];

  const categoryId = key[0] as number;
  const categoryName = key[1] as string;
  const categorySlug = key[2] as string;
  const rawParentId = key[3] as number | null;
  const categoryLevel = key[4] as number;

  // Skip invalid buckets
  if (!categoryName || !categorySlug) {
    return null;
  }

  // Convert -1 (missing value) to null for parentId
  const parentId = rawParentId === -1 ? null : rawParentId;

  return {
    id: categoryId,
    name: categoryName,
    slug: categorySlug,
    parentId: parentId ?? null,
    level: categoryLevel,
    docCount: bucket.doc_count,
    navigationPath: `/${categorySlug}`,
  };
}

/**
 * Format raw category buckets into CategoryFilterOption array
 * Exported for use by SmartFilterService
 * 
 * @param buckets - Raw buckets from OpenSearch multi_terms aggregation
 * @returns Array of formatted CategoryFilterOption
 */
export function formatCategoryBuckets(buckets: any[]): CategoryFilterOption[] {
  return buckets
    .map(parseCategoryBucket)
    .filter((cat): cat is CategoryFilterOption => cat !== null);
}

/**
 * Format brand aggregation into BrandFilterData
 */
function formatBrandFilters(
  aggregations: Record<string, unknown>,
  activeBrand?: string
): BrandFilterData {
  const brandContext = aggregations.brand_filter_context as Record<string, unknown>;
  const brandsBuckets = (brandContext?.brands as { buckets?: AggBucket[] })?.buckets;

  if (!brandsBuckets || brandsBuckets.length === 0) {
    return { items: [] };
  }

  const items = brandsBuckets
    .map((bucket) => ({
      name: String(bucket.key),
      count: bucket.doc_count,
      slug: String(bucket.key).toLowerCase().replace(/\s+/g, '-'),
      isSelected: activeBrand === String(bucket.key),
    }))
    .filter((item) => item.name && item.name !== 'null')
    .sort((a, b) => b.count - a.count);

  return { items };
}

/**
 * Format price aggregation into PriceRangeFilterData
 */
function formatPriceFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): PriceRangeFilterData {
  const priceContext = aggregations.price_filter_context as Record<string, unknown>;
  const priceStats = priceContext?.price_stats as {
    min?: number;
    max?: number;
    avg?: number;
    count?: number;
  };

  return {
    min: priceStats?.min ?? 0,
    max: priceStats?.max ?? 0,
    ...(activeFilters.minPrice !== undefined && { activeMin: activeFilters.minPrice }),
    ...(activeFilters.maxPrice !== undefined && { activeMax: activeFilters.maxPrice }),
  };
}

/**
 * Format stock aggregation into StockFilterData
 */
function formatStockFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): StockFilterData {
  const stockContext = aggregations.stock_filter_context as Record<string, unknown>;
  const inStockAgg = stockContext?.in_stock as { doc_count?: number };
  const outOfStockAgg = stockContext?.out_of_stock as { doc_count?: number };

  return {
    inStock: inStockAgg?.doc_count ?? 0,
    outOfStock: outOfStockAgg?.doc_count ?? 0,
    activeState: activeFilters.inStock === true
      ? 'in_stock'
      : activeFilters.inStock === false
        ? 'out_of_stock'
        : 'all',
  };
}

/**
 * Format variant attributes aggregation into VariantAttributesFilterData
 */
function formatVariantAttributeFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): VariantAttributesFilterData {
  const vaContext = aggregations.variant_attributes_filter_context as Record<string, unknown>;
  const vaAgg = vaContext?.variant_attributes as Record<string, unknown>;
  const attrNames = vaAgg?.attribute_names as {
    buckets?: Array<{
      key: string;
      doc_count: number;
      attribute_values?: { buckets?: AggBucket[] };
    }>;
  };

  if (!attrNames?.buckets || attrNames.buckets.length === 0) {
    return { groups: [] };
  }

  const groups = attrNames.buckets
    .map((nameBucket) => {
      const name = nameBucket.key;
      const valueBuckets = nameBucket.attribute_values?.buckets || [];
      const activeValues = activeFilters.variantAttributes?.[name] || [];

      const values = valueBuckets
        .map((vb) => ({
          value: String(vb.key),
          count: vb.doc_count,
          isSelected: activeValues.includes(String(vb.key)),
        }))
        .filter((v) => v.value && v.value !== 'null')
        .sort((a, b) => b.count - a.count);

      return {
        name,
        values,
      };
    })
    .filter((group) => group.name && group.name !== 'null' && group.values.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { groups };
}

/**
 * Format product specifications aggregation into ProductSpecificationsFilterData
 */
function formatProductSpecificationFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): ProductSpecificationsFilterData {
  const psContext = aggregations.product_specifications_filter_context as Record<string, unknown>;
  const psAgg = psContext?.product_specifications as Record<string, unknown>;
  const specGroups = psAgg?.spec_groups as {
    buckets?: Array<{
      key: string;
      doc_count: number;
      specs?: { buckets?: AggBucket[] };
    }>;
  };

  if (!specGroups?.buckets || specGroups.buckets.length === 0) {
    return { groups: [] };
  }

  const groups = specGroups.buckets
    .map((groupBucket) => {
      const groupName = groupBucket.key;
      const specBuckets = groupBucket.specs?.buckets || [];

      const specs = specBuckets
        .map((sb) => {
          // multi_terms returns [spec_name, spec_value]
          const keyArray = Array.isArray(sb.key) ? sb.key : [sb.key];
          const specName = String(keyArray[0] || '');
          const specValue = String(keyArray[1] || '');
          const activeSpecs = activeFilters.productSpecifications?.[specName] || [];

          return {
            name: specName,
            value: specValue,
            count: sb.doc_count,
            isSelected: activeSpecs.includes(specValue),
          };
        })
        .filter((s) => s.name && s.value && s.name !== 'null' && s.value !== 'null')
        .sort((a, b) => b.count - a.count);

      return {
        groupName,
        specs,
      };
    })
    .filter((group) => group.groupName && group.groupName !== 'null' && group.specs.length > 0)
    .sort((a, b) => a.groupName.localeCompare(b.groupName));

  return { groups };
}

/**
 * Format catalog codes aggregation into CatalogCodesFilterData
 */
function formatCatalogCodeFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): CatalogCodesFilterData {
  const ccContext = aggregations.catalog_codes_filter_context as Record<string, unknown>;
  const ccBuckets = (ccContext?.catalog_codes as { buckets?: AggBucket[] })?.buckets;

  if (!ccBuckets || ccBuckets.length === 0) {
    return { items: [] };
  }

  const activeCodes = activeFilters.catalogCodes || [];

  const items = ccBuckets
    .map((bucket) => ({
      code: String(bucket.key),
      count: bucket.doc_count,
      isSelected: activeCodes.includes(String(bucket.key)),
    }))
    .filter((item) => item.code && item.code !== 'null')
    .sort((a, b) => b.count - a.count);

  return { items };
}

/**
 * Format equipment codes aggregation into EquipmentCodesFilterData
 */
function formatEquipmentCodeFilters(
  aggregations: Record<string, unknown>,
  activeFilters: ActiveFilters
): EquipmentCodesFilterData {
  const ecContext = aggregations.equipment_codes_filter_context as Record<string, unknown>;
  const ecBuckets = (ecContext?.equipment_codes as { buckets?: AggBucket[] })?.buckets;

  if (!ecBuckets || ecBuckets.length === 0) {
    return { items: [] };
  }

  const activeCodes = activeFilters.equipmentCodes || [];

  const items = ecBuckets
    .map((bucket) => ({
      code: String(bucket.key),
      count: bucket.doc_count,
      isSelected: activeCodes.includes(String(bucket.key)),
    }))
    .filter((item) => item.code && item.code !== 'null')
    .sort((a, b) => b.count - a.count);

  return { items };
}

/**
 * Pre-fetched category data from separate OpenSearch queries
 */
interface CategoryData {
  siblings: CategoryFilterOption[];
  children: CategoryFilterOption[];
}

/**
 * Format complete OpenSearch aggregation response into SmartFilterResponse
 * 
 * @param aggregations - Raw aggregations from OpenSearch (brands, price, stock, etc.)
 * @param currentCategory - Current category context
 * @param activeFilters - Active filter state
 * @param totalHits - Total product count
 * @param categoryData - Pre-fetched category siblings and children (from separate queries)
 */
export function formatSmartFilterResponse(
  aggregations: Record<string, unknown>,
  currentCategory: CategoryContext | null,
  activeFilters: ActiveFilters,
  totalHits?: number,
  categoryData?: CategoryData
): SmartFilterResponse {
  try {
    // Use pre-fetched category data if provided, otherwise empty
    const categories: CategoryFilterData = categoryData || { siblings: [], children: [] };

    return {
      success: true,
      filters: {
        categories,
        brands: formatBrandFilters(aggregations, activeFilters.brand),
        priceRange: formatPriceFilters(aggregations, activeFilters),
        stock: formatStockFilters(aggregations, activeFilters),
        variantAttributes: formatVariantAttributeFilters(aggregations, activeFilters),
        productSpecifications: formatProductSpecificationFilters(aggregations, activeFilters),
        catalogCodes: formatCatalogCodeFilters(aggregations, activeFilters),
        equipmentCodes: formatEquipmentCodeFilters(aggregations, activeFilters),
      },
      totalProducts: totalHits,
      diagnostics: {
        categoryContext: currentCategory
          ? {
            level: currentCategory.categoryLevel,
            categoryId: currentCategory.categoryId,
            parentId: currentCategory.parentId,
          }
          : {
            level: -1,
            categoryId: null,
            parentId: null,
          },
        activeFilters: activeFilters as Record<string, unknown>,
      },
    };
  } catch (error) {
    console.error("[SmartFilterFormatter] Error formatting response:", error);
    return {
      success: false,
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
      error: {
        message: error instanceof Error ? error.message : "Unknown formatting error",
      },
    };
  }
}