/**
 * Browse Query Builders for OpenSearch
 * 
 * Builds queries for category, brand, and product group filtering
 * following OpenSearch field naming conventions (snake_case)
 */

export interface BrowseQueryOptions {
  page?: number; // 1-based, default: 1
  pageSize?: number; // default: 20
  sortBy?: {
    sortBy?: number; // 1=relevance, 2=price-asc, 3=price-desc, 4=field-asc, 5=field-desc
    sortByField?: string; // Field name for custom sorting (when sortBy is 4 or 5)
  };
  filters?: Record<string, string[]>; // Additional filters
  catalogCodes?: string[]; // Catalog codes for filtering
  equipmentCodes?: string[]; // Equipment codes for filtering
}

export interface BrowseQueryResult {
  query: {
    size: number;
    from: number;
    _source: readonly string[];
    query: {
      bool: {
        must: Array<Record<string, unknown>>;
        must_not: Array<Record<string, unknown>>;
        should?: Array<Record<string, unknown>>;
        minimum_should_match?: number;
      };
    };
    sort?: Array<Record<string, { order: string }>> | undefined;
  };
}

const PRODUCT_SOURCE_FIELDS = [
  "brand_product_id",
  "product_short_description",
  "product_assetss",
  "brands_name",
  "product_categories.categoryId",
  "product_categories.categoryName",
  "product_categories.categoryPath",
  "product_categories.categorySlug",
  // Deprecated: products_sub_categories - kept for backward compatibility
  "products_sub_categories.subCategoryName",
  "product_id",
  "product_index_name",
  "ean",
  "keywords",
  "b2c_unit_list_price",
  "b2c_discount_price",
  "unit_list_price",
] as const;

/**
 * Base query structure with required filters
 */
function getBaseQuery(): {
  must: Array<Record<string, unknown>>;
  must_not: Array<Record<string, unknown>>;
} {
  return {
    must: [
      {
        term: {
          is_published: 1,
        },
      },
    ],
    must_not: [
      {
        match: {
          pg_index_name: {
            query: "PrdGrp0*",
          },
        },
      },
      {
        term: {
          is_internal: true,
        },
      },
    ],
  };
}

/**
 * Build sort clause
 */
function buildSort(
  sortBy?: BrowseQueryOptions["sortBy"]
): Array<Record<string, { order: string }>> | undefined {
  if (!sortBy?.sortBy) {
    return undefined; // Default to relevance (_score)
  }

  switch (sortBy.sortBy) {
    case 1: // Relevance
      return undefined; // Use _score (default)
    case 2: // Price: Low to High
      return [{ unit_list_price: { order: "asc" } }];
    case 3: // Price: High to Low
      return [{ unit_list_price: { order: "desc" } }];
    case 4: // Field: Ascending
      if (sortBy.sortByField) {
        return [{ [sortBy.sortByField]: { order: "asc" } }];
      }
      return undefined;
    case 5: // Field: Descending
      if (sortBy.sortByField) {
        return [{ [sortBy.sortByField]: { order: "desc" } }];
      }
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Build category filter using nested query on product_categories
 * Accepts array of category IDs for N-level category support
 */
function buildCategoryFilter(categoryIds: number[]): Array<Record<string, unknown>> {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  // Always use nested query for product_categories
  // If single category ID, use term; if multiple, use terms
  if (categoryIds.length === 1) {
    return [
      {
        nested: {
          path: "product_categories",
          query: {
            term: {
              "product_categories.categoryId": categoryIds[0],
            },
          },
        },
      },
    ];
  } else {
    return [
      {
        nested: {
          path: "product_categories",
          query: {
            terms: {
              "product_categories.categoryId": categoryIds,
            },
          },
        },
      },
    ];
  }
}

/**
 * Build brand filter
 */
function buildBrandFilter(brandName: string): Record<string, unknown> {
  return {
    term: {
      "brands_name.keyword": brandName,
    },
  };
}

/**
 * Build additional filters
 */
function buildAdditionalFilters(
  filters?: Record<string, string[]>
): Array<Record<string, unknown>> {
  if (!filters || Object.keys(filters).length === 0) {
    return [];
  }

  const filterClauses: Array<Record<string, unknown>> = [];

  Object.entries(filters).forEach(([field, values]) => {
    if (values.length === 1) {
      // Single value - use term
      filterClauses.push({
        term: {
          [`${field}.keyword`]: values[0],
        },
      });
    } else if (values.length > 1) {
      // Multiple values - use terms (OR)
      filterClauses.push({
        terms: {
          [`${field}.keyword`]: values,
        },
      });
    }
  });

  return filterClauses;
}

/**
 * Build catalog/equipment code filters
 */
function buildCatalogFilters(
  catalogCodes?: string[],
  equipmentCodes?: string[]
): Array<Record<string, unknown>> {
  const filters: Array<Record<string, unknown>> = [];

  if (catalogCodes && catalogCodes.length > 0) {
    filters.push({
      terms: {
        "catalogCode.keyword": catalogCodes,
      },
    });
  }

  if (equipmentCodes && equipmentCodes.length > 0) {
    filters.push({
      terms: {
        "equipmentCode.keyword": equipmentCodes,
      },
    });
  }

  return filters;
}

/**
 * Build category query using nested product_categories field
 * @param categoryIds - Array of category IDs from the category path
 */
export function buildCategoryQuery(
  categoryIds: number[],
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;

  const baseQuery = getBaseQuery();
  const categoryFilters = buildCategoryFilter(categoryIds);
  const additionalFilters = buildAdditionalFilters(options.filters);
  const catalogFilters = buildCatalogFilters(
    options.catalogCodes,
    options.equipmentCodes
  );

  return {
    query: {
      size: pageSize,
      from,
      _source: PRODUCT_SOURCE_FIELDS,
      query: {
        bool: {
          must: [
            ...baseQuery.must,
            ...categoryFilters,
            ...additionalFilters,
            ...catalogFilters,
          ],
          must_not: baseQuery.must_not,
        },
      },
      sort: buildSort(options.sortBy),
    },
  };
}

/**
 * Build brand query
 */
export function buildBrandQuery(
  brandName: string,
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;

  const baseQuery = getBaseQuery();
  const brandFilter = buildBrandFilter(brandName);
  const additionalFilters = buildAdditionalFilters(options.filters);
  const catalogFilters = buildCatalogFilters(
    options.catalogCodes,
    options.equipmentCodes
  );

  return {
    query: {
      size: pageSize,
      from,
      _source: PRODUCT_SOURCE_FIELDS,
      query: {
        bool: {
          must: [
            ...baseQuery.must,
            brandFilter,
            ...additionalFilters,
            ...catalogFilters,
          ],
          must_not: baseQuery.must_not,
        },
      },
      sort: buildSort(options.sortBy),
    },
  };
}

/**
 * Build combined category and brand query
 * @param categoryIds - Array of category IDs from the category path
 */
export function buildCategoryBrandQuery(
  categoryIds: number[],
  brandName: string,
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;

  const baseQuery = getBaseQuery();
  const categoryFilters = buildCategoryFilter(categoryIds);
  const brandFilter = buildBrandFilter(brandName);
  const additionalFilters = buildAdditionalFilters(options.filters);
  const catalogFilters = buildCatalogFilters(
    options.catalogCodes,
    options.equipmentCodes
  );

  return {
    query: {
      size: pageSize,
      from,
      _source: PRODUCT_SOURCE_FIELDS,
      query: {
        bool: {
          must: [
            ...baseQuery.must,
            ...categoryFilters,
            brandFilter,
            ...additionalFilters,
            ...catalogFilters,
          ],
          must_not: baseQuery.must_not,
        },
      },
      sort: buildSort(options.sortBy),
    },
  };
}

/**
 * Build subcategory query (alias for buildCategoryQuery with single category ID)
 * @deprecated Use buildCategoryQuery with array of category IDs instead
 */
export function buildSubCategoryQuery(
  subCategoryId: number,
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  return buildCategoryQuery([subCategoryId], options);
}

/**
 * Build major category query (alias for buildCategoryQuery with single category ID)
 * @deprecated Use buildCategoryQuery with array of category IDs instead
 */
export function buildMajorCategoryQuery(
  majorCategoryId: number,
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  return buildCategoryQuery([majorCategoryId], options);
}

/**
 * Build product group query
 */
export function buildProductGroupQuery(
  productGroupId: number,
  options: BrowseQueryOptions = {}
): BrowseQueryResult {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;

  const baseQuery = getBaseQuery();
  const additionalFilters = buildAdditionalFilters(options.filters);
  const catalogFilters = buildCatalogFilters(
    options.catalogCodes,
    options.equipmentCodes
  );

  return {
    query: {
      size: pageSize,
      from,
      _source: PRODUCT_SOURCE_FIELDS,
      query: {
        bool: {
          must: [
            ...baseQuery.must,
            {
              term: {
                product_group_id: productGroupId,
              },
            },
            ...additionalFilters,
            ...catalogFilters,
          ],
          must_not: baseQuery.must_not,
        },
      },
      sort: buildSort(options.sortBy),
    },
  };
}

/**
 * Build query from slug pattern
 * Patterns: c_{categoryId}, b_{brandName}, pg_{productGroupId}
 * @deprecated m_ and s_ patterns are deprecated, use c_ for all category IDs
 */
export function buildQueryFromSlug(
  slug: string,
  options: BrowseQueryOptions = {}
): BrowseQueryResult | null {
  if (slug.startsWith("m_")) {
    // Deprecated: major category pattern
    const majorCategoryId = parseInt(slug.substring(2));
    if (!isNaN(majorCategoryId)) {
      return buildMajorCategoryQuery(majorCategoryId, options);
    }
  } else if (slug.startsWith("c_")) {
    const categoryId = parseInt(slug.substring(2));
    if (!isNaN(categoryId)) {
      return buildCategoryQuery([categoryId], options);
    }
  } else if (slug.startsWith("s_")) {
    // Deprecated: subcategory pattern
    const subCategoryId = parseInt(slug.substring(2));
    if (!isNaN(subCategoryId)) {
      return buildSubCategoryQuery(subCategoryId, options);
    }
  } else if (slug.startsWith("b_")) {
    const brandName = slug.substring(2);
    return buildBrandQuery(brandName, options);
  } else if (slug.startsWith("pg_")) {
    const productGroupId = parseInt(slug.substring(3));
    if (!isNaN(productGroupId)) {
      return buildProductGroupQuery(productGroupId, options);
    }
  }

  return null;
}
