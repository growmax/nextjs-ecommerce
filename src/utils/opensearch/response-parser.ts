/**
 * OpenSearch Response Parser Utility
 * Handles conversion of OpenSearch API responses to usable data
 */

/**
 * OpenSearch response structure from the API
 * Can be either wrapped in body or flat structure
 */
interface OpenSearchRawResponse {
  body?: {
    _source?: unknown;
    _id?: string;
    _index?: string;
    found?: boolean;
    [key: string]: unknown;
  };
  // Flat structure (direct GET response)
  _source?: unknown;
  _id?: string;
  _index?: string;
  found?: boolean;
  statusCode?: number;
  headers?: Record<string, string>;
  meta?: unknown;
  [key: string]: unknown;
}

/**
 * Extract product data from OpenSearch response
 *
 * OpenSearch returns data in this structure:
 * {
 *   body: {
 *     _source: { ... actual product data ... },
 *     _id: "...",
 *     found: true
 *   },
 *   statusCode: 200,
 *   headers: {...},
 *   meta: {...}
 * }
 *
 * This function extracts the _source field which contains the actual data
 */
export function extractOpenSearchData<T = unknown>(
  response: unknown
): T | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const rawResponse = response as OpenSearchRawResponse;

  // Handle wrapped structure: { body: { _source: ..., found: ... } }
  if (rawResponse.body) {
    // Check if the document was found
    if (rawResponse.body.found === false) {
      return null;
    }

    // Extract the _source field which contains the actual data
    if (rawResponse.body._source) {
      return rawResponse.body._source as T;
    }
  }

  // Handle flat structure: { _source: ..., found: ... } (direct GET response)
  // Check if the document was found
  if (rawResponse.found === false) {
    return null;
  }

  // Extract the _source field from flat structure
  if (rawResponse._source) {
    return rawResponse._source as T;
  }

  // Fallback: Check if response has direct data field (for other response types)
  if ("data" in rawResponse && rawResponse.data) {
    return rawResponse.data as T;
  }

  return null;
}

/**
 * Check if OpenSearch response indicates a successful find
 */
export function isOpenSearchFound(response: unknown): boolean {
  if (!response || typeof response !== "object") {
    return false;
  }

  const rawResponse = response as OpenSearchRawResponse;
  return rawResponse.body?.found === true;
}

/**
 * Get OpenSearch response status code
 */
export function getOpenSearchStatusCode(response: unknown): number | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const rawResponse = response as OpenSearchRawResponse;
  return rawResponse.statusCode ?? null;
}

/**
 * Extract multiple documents from OpenSearch search results
 */
export function extractOpenSearchHits<T = unknown>(
  response: unknown
): T[] | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const rawResponse = response as {
    body?: {
      hits?: {
        hits?: Array<{ _source: T }>;
      };
    };
  };

  const hits = rawResponse.body?.hits?.hits;
  if (!hits || !Array.isArray(hits)) {
    return null;
  }

  return hits.map(hit => hit._source);
}
