import { RequestContext, openSearchClient } from "../../client";
import { BaseService } from "../BaseService";

// Elasticsearch query interfaces
export interface ElasticSearchQuery {
  query: {
    bool: {
      must: Array<Record<string, unknown>>;
      should?: Array<Record<string, unknown>>;
      filter?: Array<Record<string, unknown>>;
      must_not?: Array<Record<string, unknown>>;
    };
  };
  size?: number;
  from?: number;
  sort?: Array<Record<string, unknown>>;
  _source?: string[] | readonly string[] | boolean;
  aggs?: Record<string, unknown>;
}

export interface ElasticSearchRequest {
  Elasticindex: string;
  queryType: "search" | "get" | "update" | "delete";
  ElasticType: string;
  ElasticBody: ElasticSearchQuery;
  CatalogCodes?: string[];
  EquipmentCodes?: string[];
}

export interface ElasticSearchOptions {
  elasticIndex: string;
  query: ElasticSearchQuery;
  catalogCodes?: string[] | undefined;
  equipmentCodes?: string[] | undefined;
  context?: RequestContext | undefined;
}

export interface FormattedProduct {
  productId: number;
  id: string;
  brandProductId?: string;
  productName?: string;
  productShortDescription?: string;
  shortDescription?: string;
  brandsName?: string;
  brandName?: string;
  productAssetss?: Array<{ source: string; isDefault?: boolean }>;
  unitPrice?: number;
  unitListPrice?: number;
  [key: string]: unknown;
}

export interface ElasticSearchResponse {
  body: {
    hits: {
      hits: Array<{
        _source: FormattedProduct;
        _id: string;
      }>;
      total: {
        value: number;
        relation: string;
      };
    };
  };
}

export interface SearchProductsResponse {
  success: boolean;
  data: FormattedProduct[];
  total: number;
}

export interface AggregationBucket {
  key: string;
  doc_count: number;
  [key: string]: unknown;
}

export interface AggregationResult {
  buckets: AggregationBucket[];
  [key: string]: unknown;
}

export interface AggregationsResponse {
  success: boolean;
  aggregations: Record<string, AggregationResult>;
}

/**
 * SearchService - Handles Elasticsearch-based product search operations
 *
 * This service provides methods for searching products using Elasticsearch,
 * with support for catalog/equipment code filtering and proper formatting
 * of search results.
 *
 * Extends BaseService for consistent API patterns and automatic context handling.
 */
export class SearchService extends BaseService<SearchService> {
  // Use openSearchClient for all OpenSearch/Elasticsearch operations
  protected defaultClient = openSearchClient;

  /**
   * Format Elasticsearch results to normalized product format
   */
  private formatElasticResults(
    response: ElasticSearchResponse
  ): FormattedProduct[] {
    console.log(response?.body?.hits?.hits, "response");
    if (!response?.body?.hits?.hits) {
      return [];
    }

    return response.body.hits.hits.map((hit: any) => {
      const source = hit._source;
      // Map snake_case fields from OpenSearch response to camelCase for compatibility
      const productIdValue =
        (typeof source.product_id === "number" ? source.product_id : null) ||
        (typeof source.productId === "number" ? source.productId : null) ||
        parseInt(hit._id, 10);

      return {
        ...source,
        id: hit._id,
        // Map snake_case to camelCase (OpenSearch returns snake_case, we use camelCase internally)
        productId: productIdValue,
        brandProductId: (typeof source.brand_product_id === "string"
          ? source.brand_product_id
          : source.brandProductId) as string | undefined,
        productShortDescription: (typeof source.product_short_description ===
        "string"
          ? source.product_short_description
          : source.productShortDescription) as string | undefined,
        productName: (typeof source.product_name === "string"
          ? source.product_name
          : source.productName) as string | undefined,
        shortDescription: ((typeof source.shortDescription === "string"
          ? source.shortDescription
          : null) ||
          (typeof source.product_short_description === "string"
            ? source.product_short_description
            : null) ||
          (typeof source.productShortDescription === "string"
            ? source.productShortDescription
            : null)) as string | undefined,
        brandsName: (typeof source.brands_name === "string"
          ? source.brands_name
          : source.brandsName) as string | undefined,
        brandName: ((typeof source.brand_name === "string"
          ? source.brand_name
          : null) ||
          (typeof source.brandName === "string" ? source.brandName : null) ||
          (typeof source.brands_name === "string"
            ? source.brands_name
            : null) ||
          (typeof source.brandsName === "string"
            ? source.brandsName
            : null)) as string | undefined,
        productAssetss: source.product_assetss || source.productAssetss,
        productIndexName: (typeof source.product_index_name === "string"
          ? source.product_index_name
          : source.productIndexName) as string | undefined,
        unitListPrice: (typeof source.unit_list_price === "number"
          ? source.unit_list_price
          : source.unitListPrice) as number | undefined,
        b2CUnitListPrice: (typeof source.b2c_unit_list_price === "number"
          ? source.b2c_unit_list_price
          : source.b2CUnitListPrice) as number | undefined,
        b2CDiscountPrice: (typeof source.b2c_discount_price === "number"
          ? source.b2c_discount_price
          : source.b2CDiscountPrice) as number | undefined,
        // Keep original fields for backward compatibility
        ...(source.product_id ? { product_id: source.product_id } : {}),
        ...(source.brand_product_id
          ? { brand_product_id: source.brand_product_id }
          : {}),
        ...(source.product_short_description
          ? { product_short_description: source.product_short_description }
          : {}),
        ...(source.brands_name ? { brands_name: source.brands_name } : {}),
      } as unknown as FormattedProduct;
    });
  }

  /**
   * Search products using Elasticsearch with Redis caching
   *
   * @param options - Search options including index, query, and filters
   * @returns Formatted search results with products array and total count
   */
  async searchProducts(
    options: ElasticSearchOptions
  ): Promise<SearchProductsResponse> {
    // Generate cache key from query and options (server-side only)
    if (typeof window === "undefined") {
      try {
        const cacheKey = this.generateSearchCacheKey(options);
        const { withRedisCache } = await import("@/lib/cache");
        // Cache search results for 5 minutes (300 seconds)
        // Category/product listings change frequently, so shorter TTL
        return withRedisCache(
          cacheKey,
          () => this.searchProductsServerSide(options),
          300 // 5 minutes TTL
        );
      } catch {
        // Fall through to non-cached version if cache import fails
      }
    }

    return this.searchProductsServerSide(options);
  }

  /**
   * Generate cache key for search queries
   * Creates a deterministic key from query parameters
   */
  private generateSearchCacheKey(options: ElasticSearchOptions): string {
    const { elasticIndex, query, catalogCodes, equipmentCodes } = options;

    // Create a stable hash of the query
    const queryStr = JSON.stringify({
      index: elasticIndex,
      query: query.query,
      size: query.size,
      from: query.from,
      sort: query.sort,
      catalogCodes: catalogCodes?.sort().join(","),
      equipmentCodes: equipmentCodes?.sort().join(","),
    });

    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < queryStr.length; i++) {
      const char = queryStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `search:${elasticIndex}:${Math.abs(hash).toString(36)}`;
  }

  /**
   * Server-safe version of searchProducts
   * Returns empty results on error instead of throwing
   * This is the actual implementation that does the search
   */
  async searchProductsServerSide(
    options: ElasticSearchOptions
  ): Promise<SearchProductsResponse> {
    try {
      const { elasticIndex, query, catalogCodes, equipmentCodes, context } =
        options;

      // Build the Elasticsearch request
      const elasticRequest: ElasticSearchRequest = {
        Elasticindex: elasticIndex,
        queryType: "search",
        ElasticType: "pgproduct",
        ElasticBody: query,
      };

      // Add catalog/equipment code filters if provided
      if (catalogCodes?.length || equipmentCodes?.length) {
        const codes = [...(catalogCodes || []), ...(equipmentCodes || [])];

        if (!elasticRequest.ElasticBody.query.bool.must) {
          elasticRequest.ElasticBody.query.bool.must = [];
        }

        console.log(codes, "codes");

        elasticRequest.ElasticBody.query.bool.must.push({
          terms: {
            "catalogCode.keyword": codes,
          },
        });
      }

      // Use BaseService callWith method for automatic context handling
      const response = (await this.callWith("", elasticRequest, {
        method: "POST",
        ...(context && { context }),
      })) as ElasticSearchResponse;

      // Format and return results
      const formattedData = this.formatElasticResults(response);
      const total = response.body?.hits?.total?.value || formattedData.length;

      return {
        success: true,
        data: formattedData,
        total,
      };
    } catch (error: any) {
      // Return empty results on error rather than throwing
      console.log(error, "error");
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Server-safe version of searchProducts
   * Returns empty results on error instead of throwing
   * This is the actual implementation that does the search
   */
  async searchProductsServerSide(
    options: ElasticSearchOptions
  ): Promise<SearchProductsResponse> {
    try {
      const { elasticIndex, query, catalogCodes, equipmentCodes, context } =
        options;

      // Build the Elasticsearch request
      const elasticRequest: ElasticSearchRequest = {
        Elasticindex: elasticIndex,
        queryType: "search",
        ElasticType: "pgproduct",
        ElasticBody: query,
      };

      // Add catalog/equipment code filters if provided
      if (catalogCodes?.length || equipmentCodes?.length) {
        const codes = [...(catalogCodes || []), ...(equipmentCodes || [])];

        if (!elasticRequest.ElasticBody.query.bool.must) {
          elasticRequest.ElasticBody.query.bool.must = [];
        }

        elasticRequest.ElasticBody.query.bool.must.push({
          terms: {
            "catalogCode.keyword": codes,
          },
        });
      }

      // Use BaseService callWithSafe method for server-side safety
      const response = (await this.callWithSafe("", elasticRequest, {
        method: "POST",
        ...(context && { context }),
      })) as ElasticSearchResponse | null;

      if (!response) {
        return {
          success: false,
          data: [],
          total: 0,
        };
      }

      // Format and return results
      const formattedData = this.formatElasticResults(response);
      const total = response?.body?.hits?.total?.value || formattedData.length;

      return {
        success: true,
        data: formattedData,
        total,
      };
    } catch {
      // Return empty results on error
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Search products by text query
   *
   * @param searchText - Text to search for
   * @param elasticIndex - Elasticsearch index name
   * @param options - Additional search options (limit, offset, filters)
   * @param context - Request context (auth, tenant, etc.)
   * @returns Formatted search results
   */
  async searchProductsByText(
    searchText: string,
    elasticIndex: string,
    options?: {
      limit?: number;
      offset?: number;
      catalogCodes?: string[];
      equipmentCodes?: string[];
    },
    context?: RequestContext
  ): Promise<SearchProductsResponse> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Build Elasticsearch query for text search
    const query: ElasticSearchQuery = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: searchText,
                fields: [
                  "brand_product_id^3",
                  "product_name^2",
                  "product_short_description",
                  "product_description",
                  "brands_name",
                  "catalog_code",
                  "hsn",
                ],
                type: "best_fields",
                fuzziness: "AUTO",
              },
            },
          ],
        },
      },
      size: limit,
      from: offset,
      sort: [{ _score: { order: "desc" } }],
    };

    return this.searchProducts({
      elasticIndex,
      query,
      catalogCodes: options?.catalogCodes,
      equipmentCodes: options?.equipmentCodes,
      context,
    });
  }

  /**
   * Get product by ID from Elasticsearch
   *
   * @param productId - Product ID to retrieve
   * @param elasticIndex - Elasticsearch index name
   * @param context - Request context
   * @returns Single product or null if not found
   */
  async getProductById(
    productId: string | number,
    elasticIndex: string,
    context?: RequestContext
  ): Promise<FormattedProduct | null> {
    const query: ElasticSearchQuery = {
      query: {
        bool: {
          must: [
            {
              term: {
                productId:
                  typeof productId === "string"
                    ? parseInt(productId, 10)
                    : productId,
              },
            },
          ],
        },
      },
      size: 1,
    };

    const result = await this.searchProducts({
      elasticIndex,
      query,
      context,
    });

    return result.data[0] || null;
  }

  /**
   * Get multiple products by their IDs from Elasticsearch
   *
   * @param productIds - Array of product IDs to retrieve
   * @param elasticIndex - Elasticsearch index name
   * @param context - Request context
   * @returns Array of formatted products
   */
  async getProductsByIds(
    productIds: number[],
    elasticIndex: string,
    context?: RequestContext
  ): Promise<FormattedProduct[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const query: ElasticSearchQuery = {
      query: {
        bool: {
          must: [
            {
              terms: {
                productId: productIds,
              },
            },
          ],
        },
      },
      size: productIds.length,
      from: 0,
    };

    const result = await this.searchProducts({
      elasticIndex,
      query,
      context,
    });

    return result.data || [];
  }

  /**
   * Generate cache key for aggregation queries
   * Creates a deterministic key from query parameters
   */
  private async generateAggregationCacheKey(
    elasticIndex: string,
    baseQuery: {
      must: Array<Record<string, unknown>>;
      must_not: Array<Record<string, unknown>>;
    },
    currentFilters?: {
      variantAttributes?: Record<string, string[]>;
      productSpecifications?: Record<string, string[]>;
      inStock?: boolean;
      priceRange?: { min?: number; max?: number };
      catalogCodes?: string[];
      equipmentCodes?: string[];
    },
    context?: RequestContext
  ): Promise<AggregationsResponse> {
    // Import aggregation builders
    const {
      buildAllAggregations,
      buildVariantAttributeValueAggregation,
      buildProductSpecificationValueAggregation,
    } = await import("@/utils/opensearch/aggregation-queries");

    // Build base query with aggregations
    const query: ElasticSearchQuery = {
      size: 0, // We only need aggregations, not products
      query: {
        bool: {
          must: baseQuery.must,
          must_not: baseQuery.must_not,
        },
      },
      aggs: buildAllAggregations({
        baseMust: baseQuery.must,
        baseMustNot: baseQuery.must_not,
        currentFilters: currentFilters as CategoryFilterState | undefined,
      }),
    };

    // Fetch aggregations
    const result = await this.getAggregationsServerSide(
      elasticIndex,
      query,
      context
    );

    if (!result.success) {
      return result;
    }

    // If we have variant attribute names, fetch values for each
    const variantAttrsAgg = result.aggregations.variantAttributes as {
      attribute_names?: { buckets?: Array<{ key: string; doc_count: number }> };
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[SearchService] Variant attributes aggregation structure:", {
        hasVariantAttributes: !!result.aggregations.variantAttributes,
        variantAttrsAgg,
        attributeNamesBuckets: variantAttrsAgg?.attribute_names?.buckets,
      });
    }

    if (
      variantAttrsAgg?.attribute_names?.buckets &&
      variantAttrsAgg.attribute_names.buckets.length > 0
    ) {
      const attributeNames = variantAttrsAgg.attribute_names.buckets
        .map(bucket => bucket.key)
        .filter(key => key && key !== "null" && key.trim().length > 0);

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[SearchService] Extracted attribute names:",
          attributeNames
        );
      }

      if (attributeNames.length > 0) {
        // Build aggregations for each variant attribute
        const variantAggs: Record<string, unknown> = {};
        for (const attrName of attributeNames) {
          try {
            const attrQuery: ElasticSearchQuery = {
              size: 0,
              query: {
                bool: {
                  must: baseQuery.must,
                  must_not: baseQuery.must_not,
                },
              },
              aggs: {
                [attrName]: buildVariantAttributeValueAggregation(attrName, {
                  baseMust: baseQuery.must,
                  baseMustNot: baseQuery.must_not,
                  currentFilters: currentFilters as
                    | CategoryFilterState
                    | undefined,
                }),
              },
            };

            const attrResult = await this.getAggregationsServerSide(
              elasticIndex,
              attrQuery,
              context
            );
            if (attrResult.success && attrResult.aggregations[attrName]) {
              variantAggs[attrName] = attrResult.aggregations[
                attrName
              ] as AggregationResult;
            } else if (process.env.NODE_ENV === "development") {
              console.warn(
                `[SearchService] Failed to get values for attribute "${attrName}":`,
                attrResult
              );
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                `[SearchService] Error fetching values for attribute "${attrName}":`,
                error
              );
            }
          }
        }

        // Replace the attribute names aggregation with the actual attribute aggregations
        if (Object.keys(variantAggs).length > 0) {
          result.aggregations.variantAttributes =
            variantAggs as unknown as AggregationResult;

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[SearchService] Final variant attributes aggregations:",
              Object.keys(variantAggs)
            );
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[SearchService] No variant attribute values could be fetched"
            );
          }
          // Set to empty object so formatter knows there are no attributes
          result.aggregations.variantAttributes =
            {} as unknown as AggregationResult;
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[SearchService] No valid attribute names found in buckets"
          );
        }
        result.aggregations.variantAttributes =
          {} as unknown as AggregationResult;
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SearchService] No variant attribute names aggregation found or empty buckets"
        );
      }
      // Set to empty object so formatter knows there are no attributes
      result.aggregations.variantAttributes =
        {} as unknown as AggregationResult;
    }

    // If we have product specification keys, fetch values for each
    const productSpecsAgg = result.aggregations.productSpecifications as {
      spec_keys?: {
        keys?: { buckets?: Array<{ key: string; doc_count: number }> };
      };
    };

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[SearchService] Product specifications aggregation structure:",
        {
          hasProductSpecifications: !!result.aggregations.productSpecifications,
          productSpecsAgg,
          specKeysBuckets: productSpecsAgg?.spec_keys?.keys?.buckets,
        }
      );
    }

    if (
      productSpecsAgg?.spec_keys?.keys?.buckets &&
      productSpecsAgg.spec_keys.keys.buckets.length > 0
    ) {
      const specKeys = productSpecsAgg.spec_keys.keys.buckets
        .map(bucket => bucket.key)
        .filter(key => key && key.trim().length > 0);

      if (process.env.NODE_ENV === "development") {
        console.log("[SearchService] Extracted specification keys:", specKeys);
      }

      if (specKeys.length > 0) {
        // Build aggregations for each specification
        const specAggs: Record<string, unknown> = {};
        for (const specKey of specKeys) {
          try {
            const specQuery: ElasticSearchQuery = {
              size: 0,
              query: {
                bool: {
                  must: baseQuery.must,
                  must_not: baseQuery.must_not,
                },
              },
              aggs: {
                [specKey]: buildProductSpecificationValueAggregation(specKey, {
                  baseMust: baseQuery.must,
                  baseMustNot: baseQuery.must_not,
                  currentFilters: currentFilters as
                    | CategoryFilterState
                    | undefined,
                }),
              },
            };

            const specResult = await this.getAggregationsServerSide(
              elasticIndex,
              specQuery,
              context
            );
            if (specResult.success && specResult.aggregations[specKey]) {
              specAggs[specKey] = specResult.aggregations[
                specKey
              ] as AggregationResult;
            } else if (process.env.NODE_ENV === "development") {
              console.warn(
                `[SearchService] Failed to get values for specification "${specKey}":`,
                specResult
              );
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                `[SearchService] Error fetching values for specification "${specKey}":`,
                error
              );
            }
          }
        }

        // Replace the spec keys aggregation with the actual spec aggregations
        if (Object.keys(specAggs).length > 0) {
          result.aggregations.productSpecifications =
            specAggs as unknown as AggregationResult;

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[SearchService] Final product specifications aggregations:",
              Object.keys(specAggs)
            );
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[SearchService] No product specification values could be fetched"
            );
          }
          // Set to empty object so formatter knows there are no specifications
          result.aggregations.productSpecifications =
            {} as unknown as AggregationResult;
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[SearchService] No valid specification keys found in buckets"
          );
        }
        result.aggregations.productSpecifications =
          {} as unknown as AggregationResult;
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[SearchService] No product specification keys aggregation found or empty buckets"
        );
      }
      // Set to empty object so formatter knows there are no specifications
      result.aggregations.productSpecifications =
        {} as unknown as AggregationResult;
    }

    return result;
  }

  /**
   * Get aggregations from OpenSearch with Redis caching
   *
   * @param elasticIndex - Elasticsearch index name
   * @param query - Elasticsearch query with aggregations
   * @param context - Request context
   * @returns Aggregation results
   */
  async getAggregations(
    elasticIndex: string,
    query: ElasticSearchQuery,
    context?: RequestContext
  ): Promise<AggregationsResponse> {
    // Use cached version if available (server-side only)
    if (typeof window === "undefined") {
      try {
        const cacheKey = this.generateAggregationCacheKey(elasticIndex, query);
        const { withRedisCache } = await import("@/lib/cache");
        // Cache aggregations for 30 minutes (1800 seconds)
        // Aggregations change infrequently, so longer TTL is appropriate
        return withRedisCache(
          cacheKey,
          () => this.getAggregationsUncached(elasticIndex, query, context),
          1800 // 30 minutes TTL
        );
      } catch {
        // Fall through to non-cached version if cache import fails
      }
    }

    return this.getAggregationsUncached(elasticIndex, query, context);
  }

  /**
   * Internal method - get aggregations without caching
   */
  private async getAggregationsUncached(
    elasticIndex: string,
    query: ElasticSearchQuery,
    context?: RequestContext
  ): Promise<AggregationsResponse> {
    const elasticRequest: ElasticSearchRequest = {
      Elasticindex: elasticIndex,
      queryType: "search",
      ElasticType: "pgproduct",
      ElasticBody: query,
    };

    try {
      // Use BaseService callWith method for automatic context handling
      // OpenSearch API returns: { body: { aggregations: {...}, hits: {...} } }
      const response = (await this.callWith("", elasticRequest, {
        method: "POST",
        ...(context && { context }),
      })) as {
        body: {
          aggregations?: Record<string, AggregationResult>;
          hits?: unknown;
          [key: string]: unknown;
        };
      };

      // Parse aggregations from response
      // Response structure: response.body.aggregations
      const aggregations = response?.body?.aggregations || {};

      return {
        success: true,
        aggregations,
      };
    } catch (error: any) {
      console.error("Error fetching aggregations:", error);
      // Log detailed error information for debugging
      if (error.response) {
        console.error("OpenSearch API Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          requestData: elasticRequest,
        });
      }
      // Return empty aggregations on error
      return {
        success: false,
        aggregations: {},
      };
    }
  }

  /**
   * Server-safe version of getAggregations
   * Returns empty aggregations on error instead of throwing
   * Uses uncached version for direct server-side calls
   */
  async getAggregationsServerSide(
    elasticIndex: string,
    query: ElasticSearchQuery,
    context?: RequestContext
  ): Promise<AggregationsResponse> {
    // Use uncached version for server-side safety
    return this.getAggregationsUncached(elasticIndex, query, context);
  }

  /**
   * Search products with advanced filters
   *
   * @param filters - Advanced filter options
   * @param elasticIndex - Elasticsearch index name
   * @param context - Request context
   * @returns Formatted search results
   */
  async advancedSearch(
    filters: {
      searchText?: string;
      brandIds?: number[];
      categoryIds?: string[];
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      catalogCodes?: string[];
      equipmentCodes?: string[];
      limit?: number;
      offset?: number;
    },
    elasticIndex: string,
    context?: RequestContext
  ): Promise<SearchProductsResponse> {
    const {
      searchText,
      brandIds,
      categoryIds,
      minPrice,
      maxPrice,
      inStock,
      limit = 20,
      offset = 0,
    } = filters;

    const mustClauses: Array<Record<string, unknown>> = [];
    const filterClauses: Array<Record<string, unknown>> = [];

    // Text search
    if (searchText) {
      mustClauses.push({
        multi_match: {
          query: searchText,
          fields: [
            "brand_product_id^3",
            "product_name^2",
            "product_short_description",
            "product_description",
            "brands_name",
          ],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      });
    }

    // Brand filter
    if (brandIds && brandIds.length > 0) {
      filterClauses.push({
        terms: { brandId: brandIds },
      });
    }

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      filterClauses.push({
        terms: { "categoryId.keyword": categoryIds },
      });
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange: Record<string, unknown> = {};
      if (minPrice !== undefined) priceRange.gte = minPrice;
      if (maxPrice !== undefined) priceRange.lte = maxPrice;

      filterClauses.push({
        range: { unitPrice: priceRange },
      });
    }

    // Stock filter
    if (inStock !== undefined) {
      filterClauses.push({
        term: { inStock },
      });
    }

    const query: ElasticSearchQuery = {
      query: {
        bool: {
          must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
          ...(filterClauses.length > 0 && { filter: filterClauses }),
        },
      },
      size: limit,
      from: offset,
      sort: searchText
        ? [{ _score: { order: "desc" } }]
        : [{ productId: { order: "desc" } }],
    };

    return this.searchProducts({
      elasticIndex,
      query,
      catalogCodes: filters.catalogCodes,
      equipmentCodes: filters.equipmentCodes,
      context,
    });
  }
}

export default SearchService.getInstance();
