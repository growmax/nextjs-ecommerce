// Remove all interface definitions - they'll be imported from types
import { openSearchClient, RequestContext } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Import types from new location
import type { ProductDetail } from "@/types/product/product-detail";

// Import OpenSearch response parser utility
import { extractOpenSearchData } from "@/utils/opensearch/response-parser";

export class OpenSearchService extends BaseService<OpenSearchService> {
  protected defaultClient = openSearchClient;

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

    if (typeof window !== "undefined") {
      return this.getProductServerSide(
        identifier,
        elasticIndex,
        elasticType,
        queryType,
        context
      );
    }

    try {
      const { withRedisCache } = await import("@/lib/cache");
      return withRedisCache(key, () =>
        this.getProductServerSide(
          identifier,
          elasticIndex,
          elasticType,
          queryType,
          context
        )
      );
    } catch {
      return this.getProductServerSide(
        identifier,
        elasticIndex,
        elasticType,
        queryType,
        context
      );
    }
  }
}

export default OpenSearchService.getInstance();
