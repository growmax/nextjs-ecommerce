import axios, { AxiosInstance } from "axios";
import { RequestContext } from "../client";

// Elasticsearch query interfaces
export interface ElasticSearchQuery {
  query: {
    bool: {
      must: Array<Record<string, unknown>>;
      should?: Array<Record<string, unknown>>;
      filter?: Array<Record<string, unknown>>;
    };
  };
  size?: number;
  from?: number;
  sort?: Array<Record<string, unknown>>;
  _source?: string[] | boolean;
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
}

export interface SearchProductsResponse {
  success: boolean;
  data: FormattedProduct[];
  total: number;
}

/**
 * SearchService - Handles Elasticsearch-based product search operations
 *
 * This service provides methods for searching products using Elasticsearch,
 * with support for catalog/equipment code filtering and proper formatting
 * of search results.
 */
export class SearchService {
  private static instance: SearchService;
  private elasticClient: AxiosInstance;
  private readonly elasticUrl: string;

  private constructor() {
    this.elasticUrl =
      process.env.ELASTIC_URL ||
      process.env.NEXT_PUBLIC_ELASTIC_URL ||
      "https://api.myapptino.com/elasticsearch/invocations";

    // Create dedicated Elasticsearch client
    this.elasticClient = axios.create({
      baseURL: this.elasticUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for auth
    this.elasticClient.interceptors.request.use(
      config => {
        // Auto-inject authorization token from cookies (client-side)
        if (typeof window !== "undefined") {
          const accessToken = this.getTokenFromCookie("access_token");
          if (accessToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Get token from cookie (client-side only)
   */
  private getTokenFromCookie(cookieName: string): string | null {
    if (typeof window === "undefined") return null;

    const name = `${cookieName}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      if (!c) continue;
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  /**
   * Format Elasticsearch results to normalized product format
   */
  private formatElasticResults(
    response: ElasticSearchResponse
  ): FormattedProduct[] {
    if (!response?.hits?.hits) {
      return [];
    }

    return response.hits.hits.map(hit => {
      const source = hit._source;
      return {
        ...source,
        id: hit._id,
        // Ensure consistent field naming
        productId: source.productId || parseInt(hit._id, 10),
        shortDescription:
          source.shortDescription || source.productShortDescription,
        brandName: source.brandName || source.brandsName,
      } as FormattedProduct;
    });
  }

  /**
   * Search products using Elasticsearch
   *
   * @param options - Search options including index, query, and filters
   * @returns Formatted search results with products array and total count
   */
  async searchProducts(
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

      // Set up request headers with context
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (context?.accessToken) {
        headers.Authorization = `Bearer ${context.accessToken}`;
      }
      if (context?.tenantCode) {
        headers["x-tenant"] = context.tenantCode;
      }
      if (context?.companyId) {
        headers["x-company-id"] = context.companyId.toString();
      }
      if (context?.userId) {
        headers["x-user-id"] = context.userId.toString();
      }

      // Make the Elasticsearch request
      const response = await this.elasticClient.post<ElasticSearchResponse>(
        "",
        elasticRequest,
        { headers }
      );

      // Format and return results
      const formattedData = this.formatElasticResults(response.data);
      const total = response.data.hits?.total?.value || formattedData.length;

      return {
        success: true,
        data: formattedData,
        total,
      };
    } catch (_error) {
      // Return empty results on error rather than throwing
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
                  "brandProductId^3",
                  "productName^2",
                  "productShortDescription",
                  "productDescription",
                  "brandsName",
                  "catalogCode",
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
            "brandProductId^3",
            "productName^2",
            "productShortDescription",
            "productDescription",
            "brandsName",
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
