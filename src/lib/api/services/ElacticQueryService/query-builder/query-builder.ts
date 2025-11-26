/**
 * OpenSearch Query Builder
 * Utility functions for building OpenSearch queries
 */

import {
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_SOURCE_FIELDS,
} from "@/hooks/useSearch/useElasticSearch";
import type {
  OpenSearchQueryBody,
  OpenSearchSearchRequest,
  ProductSearchOptions,
} from "@/types/OpenElasticSearch/types";

/**
 * Build a simple product search query
 * Searches in product_short_description, brand_product_id, and brand_name
 *
 * @param searchTerm - The search term to query
 * @param elasticIndex - The OpenSearch index name
 * @param options - Optional search options (size, from)
 * @returns Complete OpenSearch search request
 */
export function buildProductSearchQuery(
  searchTerm: string,
  elasticIndex: string,
  options: ProductSearchOptions = {}
): OpenSearchSearchRequest {
  const size = options.size ?? 24;
  const from = options.from ?? 0;

  const queryBody: OpenSearchQueryBody = {
    size,
    from,
    _source: [...PRODUCT_SOURCE_FIELDS],
    query: {
      bool: {
        must: [
          {
            term: {
              isPublished: 1,
            },
          },
          {
            multi_match: {
              query: searchTerm,
              fields: [...PRODUCT_SEARCH_FIELDS],
              type: "best_fields",
            },
          },
        ],
      },
    },
  };

  return {
    Elasticindex: elasticIndex,
    queryType: "search",
    ElasticType: "pgproduct",
    ElasticBody: queryBody,
  };
}

/**
 * Get the default source fields for product search
 */
export function getProductSourceFields(): readonly string[] {
  return PRODUCT_SOURCE_FIELDS;
}

/**
 * Get the default search fields for product search
 */
export function getProductSearchFields(): readonly string[] {
  return PRODUCT_SEARCH_FIELDS;
}
