import OpenSearchService from "@/lib/api/services/OpenSearchService/OpenSearchService";
import { JWTService } from "@/lib/services/JWTService";
import { ProductDetail } from "@/types/product/product-detail";
import { parseProductSlug } from "@/utils/product/slug-generator";
import { cookies } from "next/headers";

/**
 * Product Service
 * Handles product data fetching with authentication and tenant context
 */
export class ProductService {
  /**
   * Fetch product data by slug
   * Handles authentication, tenant resolution, and OpenSearch query
   *
   * @param slug - Product slug containing product ID
   * @returns ProductDetail object or null if not found
   */
  static async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    try {
      // Parse product ID from slug
      const productId = parseProductSlug(slug);
      if (!productId) {
        return null;
      }

      // Get auth token from cookies
      const cookieStore = await cookies();
      const accessToken =
        cookieStore.get("access_token")?.value ||
        cookieStore.get("access_token_client")?.value ||
        "";

      const tokenPayload = accessToken
        ? JWTService.getInstance().getTokenPayload(accessToken)
        : "";

      const { elasticCode, tenantId } = tokenPayload || {};

      if (!tenantId) {
        return null;
      }

      // Build elastic index name
      const elasticIndex = `${elasticCode}pgandproducts`;

      // Fetch product from OpenSearch
      const product = await OpenSearchService.getProductServerSide(
        productId,
        elasticIndex,
        "pgproduct", // elasticType
        "get" // queryType
      );
      return product;
    } catch {
      return null;
    }
  }
}
