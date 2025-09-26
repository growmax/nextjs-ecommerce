import { AxiosInstance } from "axios";
import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "../client";

/**
 * Abstract base service class that handles singleton pattern and common functionality
 *
 * Usage for freshers (SIMPLIFIED):
 * 1. Extend this class: `class MyService extends BaseService<MyService>`
 * 2. Set default client: `protected defaultClient = yourClient;` (optional)
 * 3. Use auto-context methods: `this.call()`, `this.callSafe()`, `this.callWith()`
 * 4. Export using `export default MyService.getInstance()`
 *
 * Benefits: Auto-context + Multiple clients + Zero boilerplate!
 */
export abstract class BaseService<
  T extends BaseService<T> = BaseService<never>,
> {
  private static instances: Map<string, unknown> = new Map();

  // Each service can override this with their preferred client
  protected defaultClient: AxiosInstance = coreCommerceClient;

  constructor() {}

  /**
   * Gets the singleton instance of the service
   * This method is inherited by all services automatically
   */
  public static getInstance<T extends BaseService>(this: new () => T): T {
    const className = this.name;
    if (!BaseService.instances.has(className)) {
      BaseService.instances.set(className, new this());
    }
    return BaseService.instances.get(className) as T;
  }

  /**
   * Generic API call method - throws errors (use in client-side with try/catch)
   */
  protected async callApi(
    endpoint: string,
    data: unknown = {},
    context: RequestContext,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    client: AxiosInstance = coreCommerceClient
  ): Promise<unknown> {
    const clientWithContext = createClientWithContext(client, context);
    switch (method) {
      case "GET":
        const response = await clientWithContext.get(endpoint);
        return response.data;
      case "POST":
        const postResponse = await clientWithContext.post(endpoint, data);
        return postResponse.data;
      case "PUT":
        const putResponse = await clientWithContext.put(endpoint, data);
        return putResponse.data;
      case "DELETE":
        const deleteResponse = await clientWithContext.delete(endpoint);
        return deleteResponse.data;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Safe API call method - returns null on error (use for server-side)
   */
  protected async callApiSafe(
    endpoint: string,
    data: unknown = {},
    context: RequestContext,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    client: AxiosInstance = coreCommerceClient
  ): Promise<unknown | null> {
    try {
      return await this.callApi(endpoint, data, context, method, client);
    } catch {
      return null;
    }
  }

  /**
   * ✨ SIMPLIFIED METHODS FOR FRESHERS ✨
   */

  /**
   * Auto-context API call (for freshers) - Everything automatic!
   * Usage: this.call('/endpoint', data, 'GET')
   */
  protected async call(
    endpoint: string,
    data: unknown = {},
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST"
  ): Promise<unknown> {
    const context = BaseService.getClientContext();
    return this.callApi(endpoint, data, context, method, this.defaultClient);
  }

  /**
   * Auto-context safe API call (for server-side) - No errors thrown!
   * Usage: this.callSafe('/endpoint', data, 'GET')
   */
  protected async callSafe(
    endpoint: string,
    data: unknown = {},
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST"
  ): Promise<unknown | null> {
    const context = BaseService.getClientContext();
    return this.callApiSafe(
      endpoint,
      data,
      context,
      method,
      this.defaultClient
    );
  }

  /**
   * Advanced method with full customization (for complex cases)
   * Usage: this.callWith('/endpoint', data, { client: authClient, method: 'PUT' })
   */
  protected async callWith(
    endpoint: string,
    data: unknown = {},
    options?: {
      context?: RequestContext;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      client?: AxiosInstance;
    }
  ): Promise<unknown> {
    const context = options?.context || BaseService.getClientContext();
    const method = options?.method || "POST";
    const client = options?.client || this.defaultClient;
    return this.callApi(endpoint, data, context, method, client);
  }

  /**
   * Safe version of callWith - returns null on error
   */
  protected async callWithSafe(
    endpoint: string,
    data: unknown = {},
    options?: {
      context?: RequestContext;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      client?: AxiosInstance;
    }
  ): Promise<unknown | null> {
    const context = options?.context || BaseService.getClientContext();
    const method = options?.method || "POST";
    const client = options?.client || this.defaultClient;
    return this.callApiSafe(endpoint, data, context, method, client);
  }

  /**
   * Helper to get client-side request context
   * Freshers can use this in their components
   */
  public static getClientContext(): RequestContext {
    return {
      // Client-side calls will automatically include tokens from cookies via interceptors
    };
  }
}
