/**
 * Smart Filter Service
 * 
 * Unified service for fetching ALL filter types.
 * Category filters (siblings/children) use separate queries for accuracy.
 * 
 * @example
 * ```typescript
 * const response = await SmartFilterService.getInstance().getFilters({
 *   elasticIndex: 'tenant_pgandproducts',
 *   currentCategory: { categoryId: 123, categoryLevel: 1, ... },
 *   activeFilters: { brand: 'dewalt', inStock: true },
 *   context: { elasticCode: 'tenant', tenantCode: 'tenant' }
 * });
 * 
 * // Use filters in UI
 * const { categories, brands, priceRange, stock, ... } = response.filters;
 * ```
 */

import type { RequestContext } from "@/lib/api/client";
import { openSearchClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";
import { formatCategoryBuckets, formatSmartFilterResponse } from "../formatters/SmartFilterFormatter";
import {
  buildChildrenCategoriesQuery,
  buildSiblingCategoriesQuery,
  buildSmartFilterAggregationQuery
} from "../queries/SmartFilterAggregationBuilder";
import type { ActiveFilters, CategoryContext, SmartFilterRequest } from "../types/smart-filter-request.types";
import type { CategoryFilterOption, SmartFilterResponse } from "../types/smart-filter-response.types";

/**
 * OpenSearch request body structure for the API
 */
interface OpenSearchRequestBody {
  Elasticindex: string;
  ElasticBody: Record<string, unknown>;
  ElasticType: string;
  queryType: string;
}

/**
 * OpenSearch response structure
 */
interface OpenSearchResponse {
  body?: {
    hits?: {
      total?: number | { value: number };
    };
    aggregations?: Record<string, unknown>;
  };
}

/**
 * SmartFilterService
 * 
 * Core service for the Smart Filter system.
 * Fetches filter aggregations from OpenSearch.
 * Category filters (siblings/children) use separate queries for accuracy.
 * Extends BaseService for automatic context handling.
 */
export class SmartFilterService extends BaseService<SmartFilterService> {
  protected defaultClient = openSearchClient;
  /**
   * Fetch category siblings from OpenSearch
   * Uses dedicated query with parentId filter in main query
   */
  private async fetchCategorySiblings(
    elasticIndex: string,
    currentCategory: CategoryContext | null,
    context?: RequestContext
  ): Promise<CategoryFilterOption[]> {
    if (process.env.NODE_ENV === "development") {
      console.log("[SmartFilterService.fetchCategorySiblings] ENTRY - currentCategory:", {
        currentCategory,
        isNull: currentCategory === null,
        categoryLevel: currentCategory?.categoryLevel,
        parentId: currentCategory?.parentId,
        categoryName: currentCategory?.categoryName,
      });
    }

    const query = buildSiblingCategoriesQuery(currentCategory);

    if (process.env.NODE_ENV === "development") {
      console.log("[SmartFilterService.fetchCategorySiblings] Generated query:", JSON.stringify(query, null, 2));
    }

    const requestBody: OpenSearchRequestBody = {
      Elasticindex: elasticIndex,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const result = await this.callWith("", requestBody, {
      method: "POST",
      ...(context && { context }),
    }) as OpenSearchResponse | null;

    const buckets = result?.body?.aggregations?.sibling_categories as { buckets?: any[] };
    return formatCategoryBuckets(buckets?.buckets || []);
  }

  /**
   * Fetch category children from OpenSearch
   * Uses dedicated query with parentId filter in main query
   */
  private async fetchCategoryChildren(
    elasticIndex: string,
    currentCategory: CategoryContext | null,
    context?: RequestContext
  ): Promise<CategoryFilterOption[]> {
    const query = buildChildrenCategoriesQuery(currentCategory);

    if (process.env.NODE_ENV === "development") {
      console.log("[SmartFilterService] Children query:", JSON.stringify(query, null, 2));
    }

    const requestBody: OpenSearchRequestBody = {
      Elasticindex: elasticIndex,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const result = await this.callWith("", requestBody, {
      method: "POST",
      ...(context && { context }),
    }) as OpenSearchResponse | null;

    const buckets = result?.body?.aggregations?.children_categories as { buckets?: any[] };
    return formatCategoryBuckets(buckets?.buckets || []);
  }

  /**
   * Get all filters for the current page context
   * 
   * Makes 3 parallel OpenSearch requests:
   * 1. Sibling categories query
   * 2. Children categories query  
   * 3. Other filters (brands, price, stock, etc.)
   * 
   * @param request - Filter request configuration
   * @returns Complete smart filter response with all filter types
   */
  async getFilters(request: SmartFilterRequest): Promise<SmartFilterResponse> {
    const {
      elasticIndex,
      currentCategory,
      activeFilters,
      context,
      bucketSize = 100,
    } = request;

    const startTime = performance.now();

    try {
      // Execute all 3 queries in parallel for performance
      const [siblings, children, otherFiltersResult] = await Promise.all([
        // 1. Fetch sibling categories
        this.fetchCategorySiblings(elasticIndex, currentCategory, context),

        // 2. Fetch children categories
        this.fetchCategoryChildren(elasticIndex, currentCategory, context),

        // 3. Fetch other filters (brands, price, stock, etc.)
        this.fetchOtherFilters(elasticIndex, currentCategory, activeFilters, context, bucketSize),
      ]);

      const queryTime = performance.now() - startTime;

      // Format response with category data
      const formatStartTime = performance.now();
      const response = formatSmartFilterResponse(
        otherFiltersResult.aggregations,
        currentCategory,
        activeFilters,
        otherFiltersResult.totalHits,
        { siblings, children } // Pass category data directly
      );
      const formatTime = performance.now() - formatStartTime;

      // Add timing diagnostics
      if (response.diagnostics) {
        response.diagnostics.queryBuildTime = queryTime;
        response.diagnostics.formatTime = formatTime;
        response.diagnostics.searchTime = queryTime;
      }

      return response;
    } catch (error) {
      console.error("[SmartFilterService] Error fetching filters:", error);
      return this.createErrorResponse(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Fetch non-category filters (brands, price, stock, etc.)
   */
  private async fetchOtherFilters(
    elasticIndex: string,
    currentCategory: CategoryContext | null,
    activeFilters: ActiveFilters,
    context?: RequestContext,
    bucketSize: number = 100
  ): Promise<{ aggregations: Record<string, unknown>; totalHits: number }> {
    const query = buildSmartFilterAggregationQuery(
      currentCategory,
      activeFilters,
      bucketSize
    );

    const requestBody: OpenSearchRequestBody = {
      Elasticindex: elasticIndex,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    // DEBUG: Log the query being sent
    console.log('🔍 [SmartFilterService] API Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔍 [SmartFilterService] Brand Aggregation Filter:', JSON.stringify((query.aggs as any)?.brand_filter_context, null, 2));

    const result = await this.callWith("", requestBody, {
      method: "POST",
      ...(context && { context }),
    }) as OpenSearchResponse | null;

    const aggregations = result?.body?.aggregations || {};
    const totalHits = typeof result?.body?.hits?.total === "number"
      ? result.body.hits.total
      : result?.body?.hits?.total?.value ?? 0;

    return { aggregations, totalHits };
  }

  /**
   * Create error response with consistent structure
   */
  private createErrorResponse(message: string): SmartFilterResponse {
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
        message,
        code: "FILTER_FETCH_ERROR",
      },
    };
  }

  /**
   * Server-safe version that returns null on error
   * Use this in Server Components
   * 
   * @param request - Filter request configuration
   * @returns Smart filter response or null on error
   */
  async getFiltersServerSide(
    request: SmartFilterRequest
  ): Promise<SmartFilterResponse | null> {
    try {
      const response = await this.getFilters(request);
      return response.success ? response : null;
    } catch (error) {
      console.error("[SmartFilterService] Server-side error:", error);
      return null;
    }
  }

  /**
   * Get filters with only category context (no active filters)
   * Useful for initial page load
   * 
   * @param elasticIndex - OpenSearch index
   * @param currentCategory - Current category context
   * @param context - Request context
   * @returns Smart filter response
   */
  async getFiltersForCategory(
    elasticIndex: string,
    currentCategory: CategoryContext | null,
    context: RequestContext
  ): Promise<SmartFilterResponse> {
    return this.getFilters({
      elasticIndex,
      currentCategory,
      activeFilters: {},
      context,
    });
  }

  /**
   * Get filters with brand context (for brand pages)
   * 
   * @param elasticIndex - OpenSearch index
   * @param brandSlug - Brand identifier
   * @param currentCategory - Optional category context
   * @param context - Request context
   * @returns Smart filter response
   */
  async getFiltersForBrand(
    elasticIndex: string,
    brandSlug: string,
    currentCategory: CategoryContext | null,
    context: RequestContext
  ): Promise<SmartFilterResponse> {
    return this.getFilters({
      elasticIndex,
      currentCategory,
      activeFilters: { brand: brandSlug },
      context,
    });
  }
}

export default SmartFilterService.getInstance();
