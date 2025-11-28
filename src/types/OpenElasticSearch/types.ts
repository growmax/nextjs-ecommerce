/**
 * Simple product search result from OpenSearch
 */
export interface SimpleProductSearchResult {
  productId: number;
  productIndexName: string;
  brandProductId: string;
  productShortDescription: string;
  brandsName: string;
  productAssetss?: Array<{
    type: string;
    source: string;
    isDefault?: number | boolean;
  }>;
  ean?: string;
  keywords?: string | null;
  b2CUnitListPrice?: number | null;
  productsSubCategories?: Array<{
    subCategoryName: string;
  }>;
}

/**
 * Product search response structure
 */
export interface ProductSearchResponse {
  success: boolean;
  data: SimpleProductSearchResult[];
  total: number;
}

/**
 * OpenSearch search request body structure
 */
export interface OpenSearchSearchRequest {
  Elasticindex: string;
  queryType: "search" | "get" | "update" | "delete";
  ElasticType: string;
  ElasticBody: OpenSearchQueryBody;
}

/**
 * OpenSearch query body structure
 */
export interface OpenSearchQueryBody {
  size: number;
  from: number;
  _source: string[];
  query: {
    bool: {
      must: Array<Record<string, unknown>>;
      must_not?: Array<Record<string, unknown>>;
      should?: Array<Record<string, unknown>>;
      minimum_should_match?: number;
    };
  };
}

/**
 * OpenSearch raw response structure
 */
export interface OpenSearchRawResponse {
  body?: {
    _source?: unknown;
    _id?: string;
    _index?: string;
    found?: boolean;
    hits?: {
      hits?: Array<{ _source: unknown; _id?: string }>;
      total?: {
        value?: number;
        relation?: string;
      };
    };
    [key: string]: unknown;
  };
  statusCode?: number;
  headers?: Record<string, string>;
  meta?: unknown;
}

/**
 * Search options for product search
 */
export interface ProductSearchOptions {
  size?: number;
  from?: number;
}
