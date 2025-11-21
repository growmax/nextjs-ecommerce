import { OpenSearchService, TenantService } from "@/lib/api";
import { RequestContext } from "@/lib/api/client";
import { getDomainInfo } from "@/lib/utils/getDomainInfo";
import { ProductDetail } from "@/types/product/product-detail";
import { TenantApiResponse } from "@/types/tenant";

/**
 * ProductPageService - Handles all product page-related data fetching
 *
 * Provides centralized data fetching for product pages, including context
 * and product data retrieval. Designed for server-side use in Next.js
 * pages, generateStaticParams, and generateMetadata.
 */
export class ProductPageService {
  /**
   * Get the context data required for product page operations
   * Includes tenant data and origin information
   */
  static async getProductPageContext(): Promise<{
    tenantData: TenantApiResponse | null;
    origin: string;
  }> {
    const { domainUrl, origin } = await getDomainInfo();
    const tenantData = await TenantService.getTenantDataCached(
      domainUrl,
      origin
    );
    return { tenantData, origin };
  }

  /**
   * Fetch a product by ID using the product page context
   * Includes proper elastic index construction and context setup
   */
  static async fetchProductById(
    productId: string,
    elasticCode: string,
    tenantCode: string,
    origin: string
  ): Promise<ProductDetail | null> {
    const elasticIndex = `${elasticCode}pgandproducts`;
    const context: RequestContext = { origin, tenantCode };
    return await OpenSearchService.getProductCached(
      productId,
      elasticIndex,
      "pgproduct",
      "get",
      context
    );
  }
}
