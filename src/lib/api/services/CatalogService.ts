import {
  homePageClient,
  catalogClient,
  createClientWithContext,
  RequestContext,
} from "../client";
import { CategoriesResponse, CatalogSettingsResponse } from "@/types/appconfig";

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

  private constructor() {}

  public static getInstance(): CatalogService {
    if (!CatalogService.instance) {
      CatalogService.instance = new CatalogService();
    }
    return CatalogService.instance;
  }

  /**
   * Get all categories and subcategories
   */
  async getCategories(context?: RequestContext): Promise<CategoriesResponse> {
    const client = context
      ? createClientWithContext(homePageClient, context)
      : homePageClient;

    const response = await client.get("/getAllSubCategories");
    return response.data;
  }

  /**
   * Get categories with caching
   */
  async getCategoriesWithCache(context?: RequestContext): Promise<Category[]> {
    const cacheKey = `categories_${context?.tenantCode || "default"}`;

    // Try to get from cache first
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 30 minutes
        if (Date.now() - timestamp < 1800000) {
          return data;
        }
      }
    }

    // Fetch fresh data
    const categoriesResponse = await this.getCategories(context);
    const categories = categoriesResponse.data || [];

    // Cache the result
    if (typeof window !== "undefined") {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: categories,
          timestamp: Date.now(),
        })
      );
    }

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
}

export default CatalogService.getInstance();
