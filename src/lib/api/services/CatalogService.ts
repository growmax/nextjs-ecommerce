import { CatalogSettingsResponse, CategoriesResponse } from "@/types/appconfig";
import {
  catalogClient,
  createClientWithContext,
  homePageClient,
  RequestContext,
} from "../client";

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  order?: number;
  isActive: boolean;
  children?: Category[];
}

export interface CatalogSettings {
  id: string;
  companyId: string;
  currency: string;
  language: string;
  timezone: string;
  priceFormat: string;
  taxSettings: {
    enabled: boolean;
    rate: number;
    inclusive: boolean;
  };
  inventory: {
    trackInventory: boolean;
    allowBackorders: boolean;
    lowStockThreshold: number;
  };
}

export interface ProductSearchOptions {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "price" | "created" | "rating";
  sortOrder?: "asc" | "desc";
}

export class CatalogService {
  private static instance: CatalogService;

  private constructor() { }

  public static getInstance(): CatalogService {
    if (!CatalogService.instance) {
      CatalogService.instance = new CatalogService();
    }
    return CatalogService.instance;
  }

  /**
   * Get all categories and subcategories with Redis caching
   */
  async getCategories(context?: RequestContext): Promise<CategoriesResponse> {
    // Get tenant code from context for cache key
    const tenantCode = context?.tenantCode || "";
    const cacheKey = `catalog:categories:${tenantCode || "default"}`;

    // Use cached version if available (server-side only)
    if (typeof window === "undefined" && tenantCode) {
      try {
        const { withRedisCache } = await import("@/lib/cache");
        // Cache categories for 30 minutes (1800 seconds)
        // Categories change infrequently
        return withRedisCache(
          cacheKey,
          () => this.getCategoriesUncached(context),
          1800 // 30 minutes TTL
        );
      } catch {
        // Fall through to non-cached version if cache import fails
      }
    }

    return this.getCategoriesUncached(context);
  }

  /**
   * Internal method - get categories without caching
   */
  private async getCategoriesUncached(
    context?: RequestContext
  ): Promise<CategoriesResponse> {
    const client = context
      ? createClientWithContext(homePageClient, context)
      : homePageClient;

    const response = await client.get("/getAllSubCategories");
    return response.data;
  }

  /**
   * Get categories with caching
   *
   * NOTE: For client-side caching, use React Query's useQuery hook with this method.
   * This method no longer uses localStorage to avoid server-side execution issues.
   * React Query will handle caching automatically on the client side.
   *
   * @deprecated Use getCategories() with React Query for caching instead
   */
  async getCategoriesWithCache(context?: RequestContext): Promise<Category[]> {
    // Simply return fresh data - let React Query handle caching on client-side
    const categoriesResponse = await this.getCategories(context);
    const categories = categoriesResponse.data || [];
    return categories as unknown as Category[];
  }

  /**
   * Get category by ID
   */
  async getCategoryById(
    categoryId: string,
    context?: RequestContext
  ): Promise<Category> {
    const client = context
      ? createClientWithContext(homePageClient, context)
      : homePageClient;

    const response = await client.get(`/categories/${categoryId}`);
    return response.data;
  }

  /**
   * Get catalog settings for a company
   */
  async getCatalogSettings(
    companyId: string,
    context: RequestContext
  ): Promise<CatalogSettingsResponse> {
    const client = createClientWithContext(catalogClient, context);

    const response = await client.get(`/Catalogsettings/${companyId}`);
    return response.data;
  }

  /**
   * Update catalog settings
   */
  async updateCatalogSettings(
    companyId: string,
    settings: Partial<CatalogSettings>,
    context: RequestContext
  ): Promise<CatalogSettings> {
    const client = createClientWithContext(catalogClient, context);

    const response = await client.put(
      `/Catalogsettings/${companyId}`,
      settings
    );
    return response.data;
  }

  /**
   * Search products
   */
  async searchProducts(
    options: ProductSearchOptions = {},
    context?: RequestContext
  ): Promise<{
    products: unknown[];
    total: number;
    hasMore: boolean;
  }> {
    const client = context
      ? createClientWithContext(catalogClient, context)
      : catalogClient;

    const response = await client.get("/products/search", {
      params: {
        q: options.query,
        categoryId: options.categoryId,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        inStock: options.inStock,
        limit: options.limit || 20,
        offset: options.offset || 0,
        sortBy: options.sortBy || "name",
        sortOrder: options.sortOrder || "asc",
      },
    });

    const { products = [], total = 0 } = response.data;
    const hasMore = (options.offset || 0) + products.length < total;

    return {
      products,
      total,
      hasMore,
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(
    productId: string,
    context?: RequestContext
  ): Promise<unknown> {
    const client = context
      ? createClientWithContext(catalogClient, context)
      : catalogClient;

    const response = await client.get(`/products/${productId}`);
    return response.data;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    options: Omit<ProductSearchOptions, "categoryId"> = {},
    context?: RequestContext
  ): Promise<{
    products: unknown[];
    total: number;
    hasMore: boolean;
  }> {
    return this.searchProducts({ ...options, categoryId }, context);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(
    limit: number = 10,
    context?: RequestContext
  ): Promise<unknown[]> {
    const client = context
      ? createClientWithContext(catalogClient, context)
      : catalogClient;

    const response = await client.get("/products/featured", {
      params: { limit },
    });

    return response.data.products || [];
  }

  /**
   * Get product recommendations
   */
  async getProductRecommendations(
    productId: string,
    limit: number = 5,
    context?: RequestContext
  ): Promise<unknown[]> {
    const client = context
      ? createClientWithContext(catalogClient, context)
      : catalogClient;

    const response = await client.get(
      `/products/${productId}/recommendations`,
      {
        params: { limit },
      }
    );

    return response.data.products || [];
  }

  /**
   * Create new category
   */
  async createCategory(
    categoryData: Omit<Category, "id">,
    context: RequestContext
  ): Promise<Category> {
    const client = createClientWithContext(homePageClient, context);

    const response = await client.post("/categories", categoryData);
    return response.data;
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<Category>,
    context: RequestContext
  ): Promise<Category> {
    const client = createClientWithContext(homePageClient, context);

    const response = await client.put(`/categories/${categoryId}`, updates);
    return response.data;
  }

  /**
   * Delete category
   */
  async deleteCategory(
    categoryId: string,
    context: RequestContext
  ): Promise<{ success: boolean }> {
    const client = createClientWithContext(homePageClient, context);

    const response = await client.delete(`/categories/${categoryId}`);
    return response.data;
  }

  /**
   * Get all categories from OpenSearch using multi_terms aggregation
   * Works with sandbox where product_categories is NOT a nested type
   * @param context - Request context with elasticCode and tenantCode
   * @returns List of all categories
   */
  async getAllCategories(context?: RequestContext): Promise<
    Array<{
      id: number | string;
      name: string;
      imageSource?: string;
      slug?: string;
      [key: string]: unknown;
    }>
  > {
    const SearchService = (await import("./SearchService/SearchService")).default;

    try {
      // Build elastic index name from elasticCode
      const elasticCode = context?.elasticCode || "";
      const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "sandboxpgandproducts";

      // Build OpenSearch query with multi_terms aggregation
      // multi_terms correlates categoryId, categoryName, categorySlug together
      const query = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                term: {
                  is_published: 1,
                },
              },
            ],
            must_not: [
              {
                match: {
                  pg_index_name: {
                    query: "PrdGrp0*",
                  },
                },
              },
              {
                term: {
                  is_internal: true,
                },
              },
            ],
          },
        },
        aggs: {
          categories: {
            multi_terms: {
              terms: [
                { field: "product_categories.categoryId" },
                { field: "product_categories.categoryName.keyword" },
                { field: "product_categories.categorySlug.keyword" },
              ],
              size: 100,
            },
          },
        },
      };

      // Fetch from OpenSearch
      const result = await SearchService.searchProducts({
        elasticIndex,
        query,
        context,
      });

      if (!result.success || !result.aggregations) {
        console.error("Failed to fetch categories - no aggregations");
        return [];
      }

      // Process multi_terms aggregation
      // Response structure: aggregations.categories.buckets[]
      // Each bucket: { key: [categoryId, categoryName, categorySlug], doc_count }
      const categoriesAgg = result.aggregations.categories as unknown as {
        buckets?: Array<{
          key: [number, string, string];
          key_as_string: string;
          doc_count: number;
        }>;
      };

      if (!categoriesAgg?.buckets) {
        console.error("No categories buckets in aggregations");
        return [];
      }

      // Transform to category array
      const categories = categoriesAgg.buckets.map((bucket) => {
        const [categoryId, categoryName, categorySlug] = bucket.key;
        return {
          id: categoryId,
          name: categoryName,
          slug: categorySlug,
          imageSource: "", // Not available in multi_terms
          doc_count: bucket.doc_count,
        };
      });


      return categories;
    } catch (error) {
      console.error("Error fetching categories from OpenSearch:", error);
      return [];
    }
  }
}

export default CatalogService.getInstance();
