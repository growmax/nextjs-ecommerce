import { withRedisCache } from "@/lib/cache";
import type {
  ProductSearchOptions,
  ProductSearchResponse,
} from "@/types/OpenElasticSearch/types";
import type { ProductDetail } from "@/types/product/product-detail";
import { extractOpenSearchData } from "@/utils/opensearch/response-parser";
import { elasticClient, RequestContext } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";
import { buildProductSearchQuery } from "@/lib/api/services/ElasticQueryService/query-builder/query-builder";
import {
  createErrorSearchResponse,
  formatProductSearchResponse,
} from "@/lib/api/services/ElasticQueryService/response-utils/response-utils";

export class OpenElasticSearchService extends BaseService<OpenElasticSearchService> {
  protected defaultClient = elasticClient;

  /**
   * Fetch single product using POST to invocations endpoint
   */
  async getProduct(
    identifier: string,
    elasticIndex: string,
    elasticType: string = "pgproduct",
    queryType: string = "get",
    context?: RequestContext
  ): Promise<ProductDetail | null> {
    const body = {
      Elasticindex: elasticIndex,
      ElasticBody: identifier,
      ElasticType: elasticType,
      queryType,
    };

    const options: { method: "POST"; context?: RequestContext } = {
      method: "POST",
    };
    if (context) options.context = context;

    const response = await this.callWith("", body, options);

    // Extract product data from OpenSearch response structure
    return extractOpenSearchData<ProductDetail>(response);
  }

  /**
   * Server-safe version
   */
  async getProductServerSide(
    identifier: string,
    elasticIndex: string,
    elasticType: string = "pgproduct",
    queryType: string = "get",
    context?: RequestContext
  ): Promise<ProductDetail | null> {
    const body = {
      Elasticindex: elasticIndex,
      ElasticBody: identifier,
      ElasticType: elasticType,
      queryType,
    };

    const options: { method: "POST"; context?: RequestContext } = {
      method: "POST",
    };
    if (context) options.context = context;

    const response = await this.callWithSafe("", body, options);

    const productData = extractOpenSearchData<ProductDetail>(response);

    return productData;
  }

  async getProductCached(
    identifier: string,
    elasticIndex: string,
    elasticType: string = "pgproduct",
    queryType: string = "get",
    context?: RequestContext
  ): Promise<ProductDetail | null> {
    const key = `product:${elasticIndex}:${identifier}`;

    if (typeof window === "undefined") {
      return withRedisCache(key, () =>
        this.getProductServerSide(
          identifier,
          elasticIndex,
          elasticType,
          queryType,
          context
        )
      );
    }

    return this.getProductServerSide(
      identifier,
      elasticIndex,
      elasticType,
      queryType,
      context
    );
  }

  /**
   * Simple product search - searches in product_short_description, brand_product_id, and brand_name
   *
   * @param searchTerm - The search term to query
   * @param elasticIndex - The OpenSearch index name (e.g., "schwingstetterpgandproducts")
   * @param options - Optional search options (size, from)
   * @param context - Optional request context
   * @returns Search results with products array and total count
   */
  async searchProducts(
    searchTerm: string,
    elasticIndex: string,
    options?: ProductSearchOptions,
    context?: RequestContext
  ): Promise<ProductSearchResponse> {
    // Build the query using query builder
    const body = buildProductSearchQuery(searchTerm, elasticIndex, options);

    const requestOptions: { method: "POST"; context?: RequestContext } = {
      method: "POST",
    };
    if (context) requestOptions.context = context;

    try {
      const response = await this.callWith("", body, requestOptions);
      return formatProductSearchResponse(response);
    } catch {
      return createErrorSearchResponse();
    }
  }

  /**
   * Server-safe version of searchProducts
   */
  async searchProductsServerSide(
    searchTerm: string,
    elasticIndex: string,
    options?: ProductSearchOptions,
    context?: RequestContext
  ): Promise<ProductSearchResponse> {
    // Build the query using query builder
    const body = buildProductSearchQuery(searchTerm, elasticIndex, options);

    const requestOptions: { method: "POST"; context?: RequestContext } = {
      method: "POST",
    };
    if (context) requestOptions.context = context;

    const response = await this.callWithSafe("", body, requestOptions);
    if (!response) {
      return createErrorSearchResponse();
    }

    return formatProductSearchResponse(response);
  }

  /**
   * Generic server-side invoker for raw OpenSearch/Elastic payloads.
   * This forwards the provided body to the configured elastic endpoint
   * using the service's configured client and optional request context.
   */
  async invokeServer(
    body: unknown,
    context?: RequestContext
  ): Promise<unknown | null> {
    const options: { method: "POST"; context?: RequestContext } = {
      method: "POST",
    };
    if (context) options.context = context;
    return this.callWithSafe("", body, options as any);
  }
}

export default OpenElasticSearchService.getInstance();
