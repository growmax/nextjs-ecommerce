/**
 * Aggregation Query Builder for OpenSearch
 * 
 * Builds aggregation queries for filter options based on category context
 */

import type { CategoryFilterState } from "@/types/category-filters";

/**
 * Base query structure for aggregations
 */
interface BaseAggregationQuery {
  filter: {
    bool: {
      must: Array<Record<string, unknown>>;
      must_not: Array<Record<string, unknown>>;
    };
  };
  aggs: {
    data: {
      terms: {
        field: string;
        size: number;
      };
    };
    count: {
      cardinality: {
        field: string;
      };
    };
  };
}

/**
 * Options for building aggregation queries
 */
export interface AggregationQueryOptions {
  /** Category IDs for filtering */
  categoryIds?: number[];
  /** Current filter state (to exclude from aggregations) */
  currentFilters?: CategoryFilterState;
  /** Base query must clauses */
  baseMust?: Array<Record<string, unknown>>;
  /** Base query must_not clauses */
  baseMustNot?: Array<Record<string, unknown>>;
  /** Size limit for aggregation buckets */
  bucketSize?: number;
}

/**
 * Build filter clause excluding a specific filter field from aggregations
 * This ensures aggregation counts reflect products available when that filter is applied
 */
function buildFilteredAggregation(
  fieldToExclude: string,
  baseMust: Array<Record<string, unknown>>,
  baseMustNot: Array<Record<string, unknown>>,
  currentFilters?: CategoryFilterState
): {
  bool: {
    must: Array<Record<string, unknown>>;
    must_not: Array<Record<string, unknown>>;
  };
} {
  const must = [...baseMust];
  const mustNot = [...baseMustNot];

  // Exclude current variant attribute filters (except the one being aggregated)
  if (currentFilters?.variantAttributes) {
    Object.entries(currentFilters.variantAttributes).forEach(([attrName, values]) => {
      if (attrName !== fieldToExclude && values.length > 0) {
        if (values.length === 1) {
          must.push({
            term: {
              [`productAttributes.${attrName}.keyword`]: values[0],
            },
          });
        } else {
          must.push({
            terms: {
              [`productAttributes.${attrName}.keyword`]: values,
            },
          });
        }
      }
    });
  }

  // Exclude product specification filters
  if (currentFilters?.productSpecifications) {
    Object.entries(currentFilters.productSpecifications).forEach(([specKey, values]) => {
      if (values.length > 0) {
        if (values.length === 1) {
          must.push({
            nested: {
              path: "productSpecifications",
              query: {
                bool: {
                  must: [
                    { term: { "productSpecifications.key.keyword": specKey } },
                    { term: { "productSpecifications.value.keyword": values[0] } },
                  ],
                },
              },
            },
          });
        } else {
          must.push({
            nested: {
              path: "productSpecifications",
              query: {
                bool: {
                  must: [
                    { term: { "productSpecifications.key.keyword": specKey } },
                    { terms: { "productSpecifications.value.keyword": values } },
                  ],
                },
              },
            },
          });
        }
      }
    });
  }

  // Exclude stock filter
  if (currentFilters?.inStock !== undefined) {
    // Stock filter would be added here if needed
    // For now, we'll handle it in the main query
  }

  return {
    bool: {
      must,
      must_not: mustNot,
    },
  };
}

/**
 * Build brands aggregation query
 */
export function buildBrandsAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation("brands", baseMust, baseMustNot, currentFilters),
    aggs: {
      data: {
        terms: {
          field: "brands_name.keyword",
          size: bucketSize,
        },
      },
      count: {
        cardinality: {
          field: "brands_name.keyword",
        },
      },
    },
  };
}

/**
 * Build categories aggregation query
 * Extracts category metadata (categoryId, categoryLevel, ancestorIds, categoryPath, categorySlug)
 * to properly identify child and sibling categories
 */
export function buildCategoriesAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 100,
  } = options;

  return {
    filter: buildFilteredAggregation("categories", baseMust, baseMustNot, currentFilters),
    aggs: {
      nested_categories: {
        nested: {
          path: "product_categories",
        },
        aggs: {
          data: {
            terms: {
              field: "product_categories.categoryName.keyword",
              size: bucketSize,
            },
            aggs: {
              // Extract category ID
              category_id: {
                terms: {
                  field: "product_categories.categoryId",
                  size: 1,
                },
              },
              // Extract category slug
              category_slug: {
                terms: {
                  field: "product_categories.categorySlug.keyword",
                  size: 1,
                },
              },
              // Extract category path
              category_path: {
                terms: {
                  field: "product_categories.categoryPath.keyword",
                  size: 1,
                },
              },
              // Extract category level
              category_level: {
                terms: {
                  field: "product_categories.categoryLevel",
                  size: 1,
                },
              },
              // Extract ancestor IDs (array)
              ancestor_ids: {
                terms: {
                  field: "product_categories.ancestorIds",
                  size: 100, // Support up to 100 ancestor IDs
                },
              },
            },
          },
          count: {
            cardinality: {
              field: "product_categories.categoryName.keyword",
            },
          },
        },
      },
    },
  };
}

/**
 * Build subcategories aggregation query
 */
export function buildSubcategoriesAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation("subcategories", baseMust, baseMustNot, currentFilters),
    aggs: {
      nested_subcategories: {
        nested: {
          path: "product_categories",
        },
        aggs: {
          data: {
            terms: {
              field: "product_categories.subCategoryName.keyword",
              size: bucketSize,
            },
          },
          count: {
            cardinality: {
              field: "product_categories.subCategoryName.keyword",
            },
          },
        },
      },
    },
  };
}

/**
 * Build major categories aggregation query
 */
export function buildMajorCategoriesAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation("majorCategories", baseMust, baseMustNot, currentFilters),
    aggs: {
      nested_major_categories: {
        nested: {
          path: "product_categories",
        },
        aggs: {
          data: {
            terms: {
              field: "product_categories.majorCategoryName.keyword",
              size: bucketSize,
            },
          },
          count: {
            cardinality: {
              field: "product_categories.majorCategoryName.keyword",
            },
          },
        },
      },
    },
  };
}

/**
 * Build variant attributes aggregation query
 * First gets all unique attribute names, then builds aggregations for each
 */
export function buildVariantAttributesAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  // First, get all unique variant attribute names
  const attributeNamesAgg = {
    filter: buildFilteredAggregation("variantAttributes", baseMust, baseMustNot, currentFilters),
    aggs: {
      attribute_names: {
        terms: {
          field: "variantAttributeses.name.keyword",
          size: 100, // Get all attribute names
        },
      },
    },
  };

  return attributeNamesAgg;
}

/**
 * Build aggregation for a specific variant attribute
 */
export function buildVariantAttributeValueAggregation(
  attributeName: string,
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation(
      attributeName,
      baseMust,
      baseMustNot,
      currentFilters
    ),
    aggs: {
      data: {
        terms: {
          field: `productAttributes.${attributeName}.keyword`,
          size: bucketSize,
        },
      },
      count: {
        cardinality: {
          field: `productAttributes.${attributeName}.keyword`,
        },
      },
    },
  };
}

/**
 * Build product specifications aggregation query
 * First gets all unique specification keys
 */
export function buildProductSpecificationsAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation(
      "productSpecifications",
      baseMust,
      baseMustNot,
      currentFilters
    ),
    aggs: {
      spec_keys: {
        nested: {
          path: "productSpecifications",
        },
        aggs: {
          keys: {
            terms: {
              field: "productSpecifications.key.keyword",
              size: 100, // Get all specification keys
            },
          },
        },
      },
    },
  };
}

/**
 * Build aggregation for a specific product specification
 */
export function buildProductSpecificationValueAggregation(
  specKey: string,
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 50,
  } = options;

  return {
    filter: buildFilteredAggregation(
      specKey,
      baseMust,
      baseMustNot,
      currentFilters
    ),
    aggs: {
      nested_specs: {
        nested: {
          path: "productSpecifications",
        },
        aggs: {
          filtered_by_key: {
            filter: {
              term: {
                "productSpecifications.key.keyword": specKey,
              },
            },
            aggs: {
              data: {
                terms: {
                  field: "productSpecifications.value.keyword",
                  size: bucketSize,
                },
              },
              count: {
                cardinality: {
                  field: "productSpecifications.value.keyword",
                },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Build price statistics aggregation (min/max)
 */
export function buildPriceStatsAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
  } = options;

  return {
    filter: buildFilteredAggregation("price", baseMust, baseMustNot, currentFilters),
    aggs: {
      price_stats: {
        stats: {
          field: "unit_list_price",
        },
      },
    },
  };
}

/**
 * Build stock/inventory status aggregation
 */
export function buildStockStatusAggregation(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const {
    baseMust = [],
    baseMustNot = [],
    currentFilters,
    bucketSize = 10,
  } = options;

  return {
    filter: buildFilteredAggregation("stock", baseMust, baseMustNot, currentFilters),
    aggs: {
      data: {
        terms: {
          field: "inventory_status.keyword", // Assuming this field exists
          size: bucketSize,
        },
      },
      count: {
        cardinality: {
          field: "inventory_status.keyword",
        },
      },
    },
  };
}

/**
 * Build complete aggregations query for all filters
 */
export function buildAllAggregations(
  options: AggregationQueryOptions = {}
): Record<string, unknown> {
  const aggregations: Record<string, unknown> = {
    brands: buildBrandsAggregation(options),
    categories: buildCategoriesAggregation(options),
    subcategories: buildSubcategoriesAggregation(options),
    majorCategories: buildMajorCategoriesAggregation(options),
    variantAttributes: buildVariantAttributesAggregation(options),
    productSpecifications: buildProductSpecificationsAggregation(options),
    priceStats: buildPriceStatsAggregation(options),
    stockStatus: buildStockStatusAggregation(options),
  };

  return aggregations;
}

