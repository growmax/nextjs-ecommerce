/**
 * Smart Filter Aggregation Builder
 * 
 * Builds OpenSearch aggregations for ALL filter types in one query.
 * Key principle: Each filter aggregation excludes its own filter to show all options.
 * Category filter is excluded from ALL aggregations (preserves hierarchy).
 */

import type { ActiveFilters, CategoryContext } from "../types/smart-filter-request.types";

/**
 * OpenSearch Query Bool Structure
 */
interface QueryBool {
  must: Array<Record<string, unknown>>;
  must_not: Array<Record<string, unknown>>;
  filter?: Array<Record<string, unknown>>;
}

/**
 * Build base product query filters
 * These are always applied to ensure we're looking at valid products
 */
function buildBaseFilters(): Array<Record<string, unknown>> {
  return [
    { term: { is_published: 1 } },
  ];
}

/**
 * Build base must_not filters
 * These exclude invalid products from results
 */
function buildBaseMustNotFilters(): Array<Record<string, unknown>> {
  return [
    { match: { pg_index_name: { query: "PrdGrp0*" } } },
    { term: { is_internal: true } },
  ];
}

/**
 * Build category filter for product queries
 * Uses product_categories.categoryId field (flat structure in sandbox)
 */
function buildCategoryFilter(categoryIds: number[]): Record<string, unknown> {
  if (categoryIds.length === 1) {
    return { term: { "product_categories.categoryId": categoryIds[0] } };
  }
  return { terms: { "product_categories.categoryId": categoryIds } };
}

/**
 * Build brand filter
 */
function buildBrandFilter(brandName: string): Record<string, unknown> {
  return { term: { "brands_name.keyword": brandName } };
}

/**
 * Build price range filter
 */
function buildPriceRangeFilter(min?: number, max?: number): Record<string, unknown> | null {
  if (min === undefined && max === undefined) return null;

  const range: Record<string, number> = {};
  if (min !== undefined) range.gte = min;
  if (max !== undefined) range.lte = max;

  return { range: { unit_list_price: range } };
}

/**
 * Build stock filter
 */
function buildStockFilter(inStock: boolean): Record<string, unknown> {
  if (inStock) {
    return { range: { "inventory.totalStock": { gt: 0 } } };
  }
  return {
    bool: {
      should: [
        { range: { "inventory.totalStock": { lte: 0 } } },
        { bool: { must_not: { exists: { field: "inventory.totalStock" } } } },
      ],
      minimum_should_match: 1,
    },
  };
}

/**
 * Build variant attribute filters (nested)
 */
function buildVariantAttributeFilters(
  variantAttributes: Record<string, string[]>
): Array<Record<string, unknown>> {
  const filters: Array<Record<string, unknown>> = [];

  for (const [attrName, values] of Object.entries(variantAttributes)) {
    if (values.length === 0) continue;

    filters.push({
      nested: {
        path: "variant_attributes",
        query: {
          bool: {
            must: [
              { term: { "variant_attributes.attribute_name.keyword": attrName } },
              { terms: { "variant_attributes.attribute_value.keyword": values } },
            ],
          },
        },
      },
    });
  }

  return filters;
}

/**
 * Build product specification filters (nested)
 */
function buildProductSpecificationFilters(
  productSpecs: Record<string, string[]>
): Array<Record<string, unknown>> {
  const filters: Array<Record<string, unknown>> = [];

  for (const [specName, values] of Object.entries(productSpecs)) {
    if (values.length === 0) continue;

    filters.push({
      nested: {
        path: "specifications",
        query: {
          bool: {
            must: [
              { term: { "specifications.spec_name.keyword": specName } },
              { terms: { "specifications.spec_value.keyword": values } },
            ],
          },
        },
      },
    });
  }

  return filters;
}

/**
 * Build catalog code filter
 */
function buildCatalogCodeFilter(codes: string[]): Record<string, unknown> {
  return { terms: { "catalog_code.keyword": codes } };
}

/**
 * Build equipment code filter
 */
function buildEquipmentCodeFilter(codes: string[]): Record<string, unknown> {
  return { terms: { "equipment_code.keyword": codes } };
}

/**
 * Build all active filters as query clauses
 * Used to count products with filters applied
 */
export function buildActiveFilterClauses(
  activeFilters: ActiveFilters,
  categoryIds?: number[]
): QueryBool {
  const must: Array<Record<string, unknown>> = [...buildBaseFilters()];
  const mustNot: Array<Record<string, unknown>> = [...buildBaseMustNotFilters()];

  // Category filter (applied for counting, NOT for aggregations)
  if (categoryIds && categoryIds.length > 0) {
    must.push(buildCategoryFilter(categoryIds));
  }

  // Brand filter
  if (activeFilters.brand) {
    must.push(buildBrandFilter(activeFilters.brand));
  }

  // Price range filter
  const priceFilter = buildPriceRangeFilter(
    activeFilters.minPrice,
    activeFilters.maxPrice
  );
  if (priceFilter) {
    must.push(priceFilter);
  }

  // Stock filter
  if (activeFilters.inStock !== undefined) {
    must.push(buildStockFilter(activeFilters.inStock));
  }

  // Variant attribute filters
  if (activeFilters.variantAttributes) {
    must.push(
      ...buildVariantAttributeFilters(activeFilters.variantAttributes)
    );
  }

  // Product specification filters
  if (activeFilters.productSpecifications) {
    must.push(
      ...buildProductSpecificationFilters(activeFilters.productSpecifications)
    );
  }

  // Catalog code filter
  if (activeFilters.catalogCodes && activeFilters.catalogCodes.length > 0) {
    must.push(buildCatalogCodeFilter(activeFilters.catalogCodes));
  }

  // Equipment code filter
  if (activeFilters.equipmentCodes && activeFilters.equipmentCodes.length > 0) {
    must.push(buildEquipmentCodeFilter(activeFilters.equipmentCodes));
  }

  return { must, must_not: mustNot };
}

/**
 * Build filters for aggregation queries
 * Includes category filter and all active filters EXCEPT the filter being aggregated
 */
function buildAggregationFilters(
  activeFilters: ActiveFilters,
  categoryIds?: number[],
  excludeFilter?: 'brand' | 'price' | 'stock' | 'variantAttributes' | 'productSpecifications' | 'catalogCodes' | 'equipmentCodes' | 'categories'
): QueryBool {
  const must: Array<Record<string, unknown>> = [...buildBaseFilters()];
  const mustNot: Array<Record<string, unknown>> = [...buildBaseMustNotFilters()];

  // Category filter - INCLUDED in aggregations (except when explicitly excluded)
  // This ensures brand/price/stock filters show only relevant options for selected category
  if (categoryIds && categoryIds.length > 0 && excludeFilter !== 'categories') {
    must.push(buildCategoryFilter(categoryIds));
  }

  // Brand filter
  if (activeFilters.brand && excludeFilter !== 'brand') {
    must.push(buildBrandFilter(activeFilters.brand));
  }

  // Price range filter
  if (excludeFilter !== 'price') {
    const priceFilter = buildPriceRangeFilter(
      activeFilters.minPrice,
      activeFilters.maxPrice
    );
    if (priceFilter) {
      must.push(priceFilter);
    }
  }

  // Stock filter
  if (activeFilters.inStock !== undefined && excludeFilter !== 'stock') {
    must.push(buildStockFilter(activeFilters.inStock));
  }

  // Variant attribute filters
  if (activeFilters.variantAttributes && excludeFilter !== 'variantAttributes') {
    must.push(
      ...buildVariantAttributeFilters(activeFilters.variantAttributes)
    );
  }

  // Product specification filters
  if (activeFilters.productSpecifications && excludeFilter !== 'productSpecifications') {
    must.push(
      ...buildProductSpecificationFilters(activeFilters.productSpecifications)
    );
  }

  // Catalog code filter
  if (activeFilters.catalogCodes && activeFilters.catalogCodes.length > 0 && excludeFilter !== 'catalogCodes') {
    must.push(buildCatalogCodeFilter(activeFilters.catalogCodes));
  }

  // Equipment code filter
  if (activeFilters.equipmentCodes && activeFilters.equipmentCodes.length > 0 && excludeFilter !== 'equipmentCodes') {
    must.push(buildEquipmentCodeFilter(activeFilters.equipmentCodes));
  }

  return { must, must_not: mustNot };
}

/**
 * Multi-terms aggregation definition for category data
 */
const CATEGORY_MULTI_TERMS = {
  multi_terms: {
    terms: [
      { field: "product_categories.categoryId" },
      { field: "product_categories.categoryName.keyword" },
      { field: "product_categories.categorySlug.keyword" },
      { field: "product_categories.parentId", missing: -1 },
      { field: "product_categories.categoryLevel" },
    ],
    size: 100,
  },
};

/**
 * Build query to fetch SIBLING categories
 * 
 * Siblings = categories with same parentId as current category
 * For root level (level 0 or no parent): siblings = all level 0 categories
 * 
 * @param currentCategory - Current category context
 * @returns OpenSearch query object
 */
export function buildSiblingCategoriesQuery(
  currentCategory: CategoryContext | null
): Record<string, unknown> {
  const must: Array<Record<string, unknown>> = [
    { term: { is_published: 1 } },
  ];

  const mustNot: Array<Record<string, unknown>> = [
    { match: { pg_index_name: { query: "PrdGrp0*" } } },
    { term: { is_internal: true } },
  ];

  // DEBUG: Log incoming category context
  if (process.env.NODE_ENV === "development") {
    console.log("[buildSiblingCategoriesQuery] Input currentCategory:", {
      currentCategory,
      isNull: currentCategory === null,
      parentIdIsNull: currentCategory?.parentId === null,
      categoryLevelIsZero: currentCategory?.categoryLevel === 0,
      categoryLevel: currentCategory?.categoryLevel,
      parentId: currentCategory?.parentId,
      categoryId: currentCategory?.categoryId,
      categoryName: currentCategory?.categoryName,
    });
  }

  // Determine sibling filter based on category context
  if (!currentCategory || currentCategory.parentId === null || currentCategory.categoryLevel === 0) {
    // Root level or no category: siblings are all level 0 categories
    console.log("[buildSiblingCategoriesQuery] CONDITION TRUE → Using categoryLevel: 0 filter");
    console.log("[buildSiblingCategoriesQuery] Reason:", {
      noCategory: !currentCategory,
      parentIdNull: currentCategory?.parentId === null,
      levelIsZero: currentCategory?.categoryLevel === 0,
    });
    must.push({ term: { "product_categories.categoryLevel": 0 } });
  } else {
    // Non-root: siblings share the same parentId
    console.log("[buildSiblingCategoriesQuery] CONDITION FALSE → Using parentId filter");
    console.log("[buildSiblingCategoriesQuery] parentId value:", currentCategory.parentId);
    must.push({ term: { "product_categories.parentId": currentCategory.parentId } });
  }

  const query = {
    from: 0,
    size: 0,
    query: {
      bool: {
        must,
        must_not: mustNot,
      },
    },
    aggs: {
      sibling_categories: CATEGORY_MULTI_TERMS,
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[buildSiblingCategoriesQuery] Final query:", JSON.stringify(query, null, 2));
  }

  return query;
}

/**
 * Build query to fetch CHILDREN categories
 * 
 * Children = categories where parentId = current category's ID
 * For no category selected: children = level 1 categories
 * 
 * @param currentCategory - Current category context
 * @returns OpenSearch query object
 */
export function buildChildrenCategoriesQuery(
  currentCategory: CategoryContext | null
): Record<string, unknown> {
  const must: Array<Record<string, unknown>> = [
    { term: { is_published: 1 } },
  ];

  const mustNot: Array<Record<string, unknown>> = [
    { match: { pg_index_name: { query: "PrdGrp0*" } } },
    { term: { is_internal: true } },
  ];

  // Determine children filter based on category context
  if (!currentCategory) {
    // No category: children are level 1 categories
    must.push({ term: { "product_categories.categoryLevel": 1 } });
  } else {
    // Has category: children have parentId = current category ID
    must.push({ term: { "product_categories.parentId": currentCategory.categoryId } });
  }

  return {
    from: 0,
    size: 0,
    query: {
      bool: {
        must,
        must_not: mustNot,
      },
    },
    aggs: {
      children_categories: CATEGORY_MULTI_TERMS,
    },
  };
}

/**
 * Build brand aggregation
 */
function buildBrandAggregation(bucketSize: number): Record<string, unknown> {
  return {
    brands: {
      terms: {
        field: "brands_name.keyword",
        size: bucketSize,
      },
    },
  };
}

/**
 * Build price range aggregation
 */
function buildPriceAggregation(): Record<string, unknown> {
  return {
    price_stats: {
      stats: {
        field: "unit_list_price",
      },
    },
  };
}

/**
 * Build stock aggregation
 */
function buildStockAggregation(): Record<string, unknown> {
  return {
    in_stock: {
      filter: {
        range: { "inventory.totalStock": { gt: 0 } },
      },
    },
    out_of_stock: {
      filter: {
        bool: {
          should: [
            { range: { "inventory.totalStock": { lte: 0 } } },
            { bool: { must_not: { exists: { field: "inventory.totalStock" } } } },
          ],
          minimum_should_match: 1,
        },
      },
    },
  };
}

/**
 * Build variant attributes aggregation (nested)
 */
function buildVariantAttributesAggregation(bucketSize: number): Record<string, unknown> {
  return {
    variant_attributes: {
      nested: {
        path: "variant_attributes",
      },
      aggs: {
        attribute_names: {
          terms: {
            field: "variant_attributes.attribute_name.keyword",
            size: bucketSize,
          },
          aggs: {
            attribute_values: {
              terms: {
                field: "variant_attributes.attribute_value.keyword",
                size: bucketSize,
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Build product specifications aggregation (nested)
 */
function buildProductSpecificationsAggregation(bucketSize: number): Record<string, unknown> {
  return {
    product_specifications: {
      nested: {
        path: "specifications",
      },
      aggs: {
        spec_groups: {
          terms: {
            field: "specifications.spec_group.keyword",
            size: bucketSize,
          },
          aggs: {
            specs: {
              multi_terms: {
                terms: [
                  { field: "specifications.spec_name.keyword" },
                  { field: "specifications.spec_value.keyword" },
                ],
                size: bucketSize,
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Build catalog codes aggregation
 */
function buildCatalogCodesAggregation(bucketSize: number): Record<string, unknown> {
  return {
    catalog_codes: {
      terms: {
        field: "catalog_code.keyword",
        size: bucketSize,
      },
    },
  };
}

/**
 * Build equipment codes aggregation
 */
function buildEquipmentCodesAggregation(bucketSize: number): Record<string, unknown> {
  return {
    equipment_codes: {
      terms: {
        field: "equipment_code.keyword",
        size: bucketSize,
      },
    },
  };
}

/**
 * Build the complete Smart Filter aggregation query
 * 
 * Returns all filter aggregations EXCEPT categories in a single OpenSearch request.
 * Category filters (siblings/children) are fetched via separate queries.
 * Each aggregation uses appropriate filter context.
 */
export function buildSmartFilterAggregationQuery(
  currentCategory: CategoryContext | null,
  activeFilters: ActiveFilters,
  bucketSize: number = 100
): Record<string, unknown> {
  // Extract category IDs from current category context
  const categoryIds = currentCategory?.pathIds || [];

  return {
    size: 0, // We only need aggregations, not products
    query: {
      bool: {
        must: [...buildBaseFilters()],
        must_not: [...buildBaseMustNotFilters()],
      },
    },
    aggs: {
      // NOTE: Category aggregations are now fetched via separate queries
      // Use buildSiblingCategoriesQuery() and buildChildrenCategoriesQuery()

      // Brand aggregation (with filter context excluding brand)
      brand_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'brand'),
        },
        aggs: buildBrandAggregation(bucketSize),
      },

      // Price aggregation (with filter context excluding price)
      price_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'price'),
        },
        aggs: buildPriceAggregation(),
      },

      // Stock aggregation (with filter context excluding stock)
      stock_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'stock'),
        },
        aggs: buildStockAggregation(),
      },

      // Variant attributes aggregation
      variant_attributes_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'variantAttributes'),
        },
        aggs: buildVariantAttributesAggregation(bucketSize),
      },

      // Product specifications aggregation
      product_specifications_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'productSpecifications'),
        },
        aggs: buildProductSpecificationsAggregation(bucketSize),
      },

      // Catalog codes aggregation
      catalog_codes_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'catalogCodes'),
        },
        aggs: buildCatalogCodesAggregation(bucketSize),
      },

      // Equipment codes aggregation
      equipment_codes_filter_context: {
        filter: {
          bool: buildAggregationFilters(activeFilters, categoryIds, 'equipmentCodes'),
        },
        aggs: buildEquipmentCodesAggregation(bucketSize),
      },
    },
  };
}
