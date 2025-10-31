import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Product asset interface
export interface ProductAsset {
  id?: number;
  source: string;
  isDefault?: number | boolean;
  height?: number | null;
  width?: number | null;
  type?: string;
  tenantId?: number;
  productId?: {
    id: number;
    brandProductId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Response interface
export interface ProductAssetsResponse {
  data?: ProductAsset[];
  message?: string;
  status?: string;
  [key: string]: unknown;
}

export class ProductAssetsService extends BaseService<ProductAssetsService> {
  // Configure default client for product assets operations
  protected defaultClient = coreCommerceClient;

  /**
   * Get product assets by product IDs
   * Usage: ProductAssetsService.getProductAssetsByProductIds(productIds)
   * @param productIds - Array of product IDs
   * @returns Promise<ProductAssetsResponse>
   */
  async getProductAssetsByProductIds(
    productIds: number[]
  ): Promise<ProductAssetsResponse> {
    // API expects the array directly, not wrapped
    return this.call(
      "productassetses/GetProductAssetsByProductIds",
      productIds,
      "POST"
    ) as Promise<ProductAssetsResponse>;
  }

  /**
   * Server-side version that returns null on error
   * Usage: ProductAssetsService.getProductAssetsByProductIdsServerSide(productIds)
   * @param productIds - Array of product IDs
   * @returns Promise<ProductAssetsResponse | null>
   */
  async getProductAssetsByProductIdsServerSide(
    productIds: number[]
  ): Promise<ProductAssetsResponse | null> {
    // API expects the array directly, not wrapped
    return this.callSafe(
      "productassetses/GetProductAssetsByProductIds",
      productIds,
      "POST"
    ) as Promise<ProductAssetsResponse | null>;
  }
}

export default ProductAssetsService.getInstance();
