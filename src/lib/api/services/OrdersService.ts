import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

export interface OrdersParams {
  userId: string;
  companyId: string;
  offset: number;
  limit: number;
  // Filter parameters
  status?: string | undefined;
  orderId?: string | undefined;
  orderName?: string | undefined;
  orderDateStart?: string | undefined;
  orderDateEnd?: string | undefined;
  lastUpdatedDateStart?: string | undefined;
  lastUpdatedDateEnd?: string | undefined;
  subtotalStart?: string | undefined;
  subtotalEnd?: string | undefined;
  taxableStart?: string | undefined;
  taxableEnd?: string | undefined;
  totalStart?: string | undefined;
  totalEnd?: string | undefined;
  // Special filter option that doesn't add query parameters
  filterType?: "all" | "filtered";
}

export class OrdersService extends BaseService<OrdersService> {
  // Configure default client for orders operations
  protected defaultClient = coreCommerceClient;

  private buildQueryString(params: OrdersParams): string {
    const { userId, companyId, offset, limit, filterType, ...filters } = params;

    const queryParts = [
      `userId=${encodeURIComponent(userId)}`,
      `companyId=${encodeURIComponent(companyId)}`,
      `offset=${encodeURIComponent(offset.toString())}`,
      `pgLimit=${encodeURIComponent(limit.toString())}`,
    ];

    // If filterType is 'all', don't add any filter parameters to maintain clean URL
    if (filterType !== "all") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParts.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          );
        }
      });
    }

    return queryParts.join("&");
  }

  /**
   * 🚀 SIMPLIFIED: Get orders (auto-context)
   * Usage: OrdersService.getOrders(params)
   */
  async getOrders(params: OrdersParams): Promise<unknown> {
    const queryString = this.buildQueryString(params);
    return this.call(
      `/orders/findByFilter?${queryString}`,
      {}, // Empty body as per the original API route
      "POST"
    );
  }

  /**
   * 🔧 ADVANCED: Get orders with custom context (when needed)
   */
  async getOrdersWithContext(
    params: OrdersParams,
    context: RequestContext
  ): Promise<unknown> {
    const queryString = this.buildQueryString(params);
    return this.callWith(
      `/orders/findByFilter?${queryString}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrdersService.getOrdersServerSide(params)
   */
  async getOrdersServerSide(params: OrdersParams): Promise<unknown | null> {
    const queryString = this.buildQueryString(params);
    return this.callSafe(
      `/orders/findByFilter?${queryString}`,
      {}, // Empty body as per the original API route
      "POST"
    );
  }

  /**
   * 🔧 ADVANCED: Server-side with custom context (when needed)
   */
  async getOrdersServerSideWithContext(
    params: OrdersParams,
    context: RequestContext
  ): Promise<unknown | null> {
    const queryString = this.buildQueryString(params);
    return this.callWithSafe(
      `/orders/findByFilter?${queryString}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }

  /**
   * 🌟 CONVENIENCE: Get all orders without any filters
   * Usage: OrdersService.getAllOrders({ userId, companyId, offset, limit })
   */
  async getAllOrders(params: {
    userId: string;
    companyId: string;
    offset: number;
    limit: number;
  }): Promise<unknown> {
    return this.getOrders({
      ...params,
      filterType: "all",
    });
  }

  /**
   * 🌟 CONVENIENCE: Server-side get all orders without any filters
   */
  async getAllOrdersServerSide(params: {
    userId: string;
    companyId: string;
    offset: number;
    limit: number;
  }): Promise<unknown | null> {
    return this.getOrdersServerSide({
      ...params,
      filterType: "all",
    });
  }
}

export default OrdersService.getInstance();
