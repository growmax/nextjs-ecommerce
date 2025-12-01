import type {
  OpenSearchProductRequest,
  OpenSearchProductResponse,
  ProductListItem,
} from "@/types/product-listing";
import {
  createAllProductsSearchQuery,
  createCategorySearchQuery,
  mapProductsFromResponse,
} from "@/utils/ProductList/apiTransformers";
import { openSearchClient, RequestContext } from "../../client";
import { BaseService } from "../BaseService";

/**
 * ProductListService
 *
 * Service for fetching and managing product catalog data
 * Handles product queries by category and transforms data for UI consumption
 *
 * @extends BaseService<ProductListService>
 */
export class ProductListService extends BaseService<ProductListService> {
  protected defaultClient = openSearchClient;

  /**
   * Query products from catalog
   * @param request - Product search request
   * @returns List of products
   * @throws ApiClientError on failure
   */
  async query(
    request: OpenSearchProductRequest
  ): Promise<ProductListItem[]> {
    const response = (await this.call(
      "",
      request,
      "POST"
    )) as OpenSearchProductResponse;

    return mapProductsFromResponse(response);
  }

  /**
   * Fetch products for a specific category
   * @param categoryId - Category identifier (0 for all products)
   * @param options - Pagination options (size, from)
   * @returns List of products in the category
   * @throws ApiClientError on failure
   */
  async fetchByCategory(
    categoryId: number,
    options?: { size?: number; from?: number }
  ): Promise<ProductListItem[]> {
    const searchQuery =
      categoryId === 0
        ? createAllProductsSearchQuery(options)
        : createCategorySearchQuery(categoryId, options);

    return this.query(searchQuery);
  }

  /**
   * Server-safe product query - returns null on error
   * Use this in Server Components and API routes
   *
   * @param request - Product search request
   * @returns List of products or null on error
   */
  async queryServerSide(
    request: OpenSearchProductRequest
  ): Promise<ProductListItem[] | null> {
    try {
      return await this.query(request);
    } catch (error) {
      console.error("Failed to load products:", error);
      return null;
    }
  }

  /**
   * Server-safe category fetch - returns null on error
   * Use this in Server Components and API routes
   *
   * @param categoryId - Category identifier (0 for all products)
   * @param options - Pagination options (size, from)
   * @returns List of products or null on error
   */
  async fetchByCategoryServerSide(
    categoryId: number,
    options?: { size?: number; from?: number }
  ): Promise<ProductListItem[] | null> {
    try {
      return await this.fetchByCategory(categoryId, options);
    } catch (error) {
      console.error("Failed to load category products:", error);
      return null;
    }
  }

  /**
   * Query products with custom request context (for advanced use cases)
   * @param request - Product search request
   * @param context - Custom request context with headers
   * @returns List of products
   * @throws ApiClientError on failure
   */
  async queryWithContext(
    request: OpenSearchProductRequest,
    context: RequestContext
  ): Promise<ProductListItem[]> {
    const response = (await this.callWith("", request, {
      context,
      method: "POST",
    })) as OpenSearchProductResponse;

    return mapProductsFromResponse(response);
  }

  /**
   * Server-safe query with custom context - returns null on error
   * @param request - Product search request
   * @param context - Custom request context with headers
   * @returns List of products or null on error
   */
  async queryWithContextServerSide(
    request: OpenSearchProductRequest,
    context: RequestContext
  ): Promise<ProductListItem[] | null> {
    try {
      return await this.queryWithContext(request, context);
    } catch (error) {
      console.error("Failed to load products with context:", error);
      return null;
    }
  }
}

export default ProductListService.getInstance();
