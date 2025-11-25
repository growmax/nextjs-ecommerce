import {
  storefrontClient,
  createClientWithContext,
  RequestContext,
} from "@/lib/api/client";
import { StoreFrontResponse } from "@/types/appconfig";

export interface StoreFrontConfig {
  storeFrontProperty: string;
  dataJson: unknown;
}

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, unknown>;
}

export interface GraphQLResponse<T = unknown> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export class StoreFrontService {
  private static instance: StoreFrontService;

  private constructor() {}

  public static getInstance(): StoreFrontService {
    if (!StoreFrontService.instance) {
      StoreFrontService.instance = new StoreFrontService();
    }
    return StoreFrontService.instance;
  }

  /**
   * Execute GraphQL query
   */
  async executeQuery<T = unknown>(
    query: string,
    variables: Record<string, unknown> = {},
    context?: RequestContext
  ): Promise<GraphQLResponse<T>> {
    const client = context
      ? createClientWithContext(storefrontClient, context)
      : storefrontClient;

    const response = await client.post("", {
      query,
      variables,
    });

    return response.data as GraphQLResponse<T>;
  }

  /**
   * Get storefront configuration by domain
   */
  async getStoreFrontConfig(
    domain: string,
    context?: RequestContext
  ): Promise<StoreFrontResponse> {
    const query = `
      query GetStoreFrontByDomain($domain: String!) {
        getAllByDomain(domain: $domain) {
          storeFrontProperty
          dataJson
        }
      }
    `;

    const response = await this.executeQuery<{
      getAllByDomain: StoreFrontConfig[];
    }>(query, { domain }, context);

    return {
      data: {
        getAllByDomain: (
          response.data as { getAllByDomain: StoreFrontConfig[] }
        ).getAllByDomain as never,
      },
    };
  }

  /**
   * Get storefront theme configuration
   */
  async getThemeConfig(
    domain: string,
    context?: RequestContext
  ): Promise<{
    theme: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    layout: Record<string, unknown>;
  }> {
    const query = `
      query GetThemeConfig($domain: String!) {
        getThemeByDomain(domain: $domain) {
          theme
          colors
          fonts
          layout
        }
      }
    `;

    const response = await this.executeQuery(query, { domain }, context);
    return (
      response as GraphQLResponse<{
        getThemeByDomain: {
          theme: string;
          colors: Record<string, string>;
          fonts: Record<string, string>;
          layout: Record<string, unknown>;
        };
      }>
    ).data?.getThemeByDomain;
  }

  /**
   * Get navigation menu configuration
   */
  async getNavigationConfig(
    domain: string,
    context?: RequestContext
  ): Promise<{
    menuItems: Array<{
      id: string;
      label: string;
      url: string;
      children?: Array<{ id: string; label: string; url: string }>;
    }>;
  }> {
    const query = `
      query GetNavigationConfig($domain: String!) {
        getNavigationByDomain(domain: $domain) {
          menuItems {
            id
            label
            url
            children {
              id
              label
              url
            }
          }
        }
      }
    `;

    const response = await this.executeQuery(query, { domain }, context);
    return (
      response as GraphQLResponse<{
        getNavigationByDomain: {
          menuItems: {
            id: string;
            label: string;
            url: string;
            children?: { id: string; label: string; url: string }[];
          }[];
        };
      }>
    ).data?.getNavigationByDomain;
  }

  /**
   * Get homepage content configuration
   */
  async getHomepageConfig(
    domain: string,
    context?: RequestContext
  ): Promise<{
    hero: Record<string, unknown>;
    sections: Array<Record<string, unknown>>;
    seo: Record<string, string>;
  }> {
    const query = `
      query GetHomepageConfig($domain: String!) {
        getHomepageByDomain(domain: $domain) {
          hero
          sections
          seo
        }
      }
    `;

    const response = await this.executeQuery(query, { domain }, context);
    return (
      response as GraphQLResponse<{
        getHomepageByDomain: {
          hero: Record<string, unknown>;
          sections: Record<string, unknown>[];
          seo: Record<string, string>;
        };
      }>
    ).data?.getHomepageByDomain;
  }

  /**
   * Get footer configuration
   */
  async getFooterConfig(
    domain: string,
    context?: RequestContext
  ): Promise<{
    links: Array<{
      section: string;
      items: Array<{ label: string; url: string }>;
    }>;
    social: Array<{ platform: string; url: string }>;
    copyright: string;
  }> {
    const query = `
      query GetFooterConfig($domain: String!) {
        getFooterByDomain(domain: $domain) {
          links {
            section
            items {
              label
              url
            }
          }
          social {
            platform
            url
          }
          copyright
        }
      }
    `;

    const response = await this.executeQuery(query, { domain }, context);
    return (
      response as GraphQLResponse<{
        getFooterByDomain: {
          links: { section: string; items: { label: string; url: string }[] }[];
          social: { platform: string; url: string }[];
          copyright: string;
        };
      }>
    ).data?.getFooterByDomain;
  }

  /**
   * Update storefront configuration
   */
  async updateStoreFrontConfig(
    domain: string,
    config: Partial<StoreFrontConfig>,
    context: RequestContext
  ): Promise<StoreFrontConfig> {
    const mutation = `
      mutation UpdateStoreFrontConfig($domain: String!, $config: StoreFrontConfigInput!) {
        updateStoreFrontByDomain(domain: $domain, config: $config) {
          storeFrontProperty
          dataJson
        }
      }
    `;

    const response = await this.executeQuery(
      mutation,
      { domain, config },
      context
    );

    return (
      response as GraphQLResponse<{
        updateStoreFrontByDomain: StoreFrontConfig;
      }>
    ).data?.updateStoreFrontByDomain;
  }

  /**
   * Get all storefront configurations (admin)
   */
  async getAllStoreFrontConfigs(
    context: RequestContext,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
    }
  ): Promise<{
    configurations: StoreFrontConfig[];
    total: number;
  }> {
    const query = `
      query GetAllStoreFrontConfigs($limit: Int, $offset: Int, $search: String) {
        getAllStoreFrontConfigs(limit: $limit, offset: $offset, search: $search) {
          configurations {
            storeFrontProperty
            dataJson
          }
          total
        }
      }
    `;

    const response = await this.executeQuery(
      query,
      {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        search: options?.search,
      },
      context
    );

    return (
      response as GraphQLResponse<{
        getAllStoreFrontConfigs: {
          configurations: StoreFrontConfig[];
          total: number;
        };
      }>
    ).data?.getAllStoreFrontConfigs;
  }

  /**
   * Get page content by slug
   */
  async getPageContent(
    domain: string,
    slug: string,
    context?: RequestContext
  ): Promise<{
    id: string;
    title: string;
    slug: string;
    content: string;
    seo: Record<string, string>;
    publishedAt: string;
  }> {
    const query = `
      query GetPageContent($domain: String!, $slug: String!) {
        getPageBySlug(domain: $domain, slug: $slug) {
          id
          title
          slug
          content
          seo
          publishedAt
        }
      }
    `;

    const response = await this.executeQuery(query, { domain, slug }, context);
    return (
      response as GraphQLResponse<{
        getPageBySlug: {
          id: string;
          title: string;
          slug: string;
          content: string;
          seo: Record<string, string>;
          publishedAt: string;
        };
      }>
    ).data?.getPageBySlug;
  }

  /**
   * Search storefront content
   */
  async searchContent(
    domain: string,
    searchQuery: string,
    context?: RequestContext,
    options?: {
      limit?: number;
      offset?: number;
      contentType?: "page" | "product" | "category" | "all";
    }
  ): Promise<{
    results: Array<{
      id: string;
      title: string;
      type: string;
      url: string;
      excerpt: string;
    }>;
    total: number;
  }> {
    const query = `
      query SearchContent($domain: String!, $query: String!, $limit: Int, $offset: Int, $contentType: String) {
        searchContent(domain: $domain, query: $query, limit: $limit, offset: $offset, contentType: $contentType) {
          results {
            id
            title
            type
            url
            excerpt
          }
          total
        }
      }
    `;

    const response = await this.executeQuery(
      query,
      {
        domain,
        query: searchQuery,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
        contentType: options?.contentType || "all",
      },
      context
    );

    return (
      response as GraphQLResponse<{
        searchContent: {
          results: {
            id: string;
            title: string;
            type: string;
            url: string;
            excerpt: string;
          }[];
          total: number;
        };
      }>
    ).data?.searchContent;
  }
}

export default StoreFrontService.getInstance();
