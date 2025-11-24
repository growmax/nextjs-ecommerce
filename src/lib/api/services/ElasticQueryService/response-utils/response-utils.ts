/**
 * OpenSearch Response Utilities
 * Functions for parsing and formatting OpenSearch API responses
 */

import type {
  ProductSearchResponse,
  SimpleProductSearchResult,
} from "@/types/OpenElasticSearch/types";

/**
 * Extract multiple documents from OpenSearch search results
 *
 * @param response - Raw OpenSearch response
 * @returns Array of product documents or null if invalid
 */
export function extractSearchHits<T = SimpleProductSearchResult>(
  response: unknown
): T[] | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const rawResponse = response as {
    hits?: {
      hits?: Array<{ _source: T }>;
    };
    body?: {
      hits?: {
        hits?: Array<{ _source: T }>;
      };
    };
  };

  // Try direct hits first, then body.hits (handles both response formats)
  const hits = rawResponse.hits?.hits || rawResponse.body?.hits?.hits;
  if (!hits || !Array.isArray(hits)) {
    return null;
  }

  return hits.map(hit => hit._source);
}

/**
 * Extract total count from OpenSearch search response
 *
 * @param response - Raw OpenSearch response
 * @returns Total count or 0 if not found
 */
export function extractSearchTotal(response: unknown): number {
  if (!response || typeof response !== "object") {
    return 0;
  }

  const rawResponse = response as {
    hits?: {
      total?: number | { value?: number };
    };
    body?: {
      hits?: {
        total?: number | { value?: number };
      };
    };
  };

  // Try direct hits first, then body.hits
  const total = rawResponse.hits?.total || rawResponse.body?.hits?.total;

  // Handle both numeric total and {value: number} formats
  if (typeof total === "number") {
    return total;
  }
  if (total && typeof total === "object" && "value" in total) {
    return total.value ?? 0;
  }
  return 0;
}

/**
 * Format OpenSearch search response into ProductSearchResponse
 *
 * @param response - Raw OpenSearch response
 * @returns Formatted search response with success flag, data, and total
 */
export function formatProductSearchResponse(
  response: unknown
): ProductSearchResponse {
  const products = extractSearchHits<SimpleProductSearchResult>(response);
  const total = extractSearchTotal(response);

  return {
    success: true,
    data: products ?? [],
    total,
  };
}

/**
 * Create an error response for product search
 *
 * @returns Error response structure
 */
export function createErrorSearchResponse(): ProductSearchResponse {
  return {
    success: false,
    data: [],
    total: 0,
  };
}
