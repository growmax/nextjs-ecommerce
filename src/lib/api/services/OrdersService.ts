import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

export interface OrdersParams {
  userId: string;
  companyId: string;
  offset: number;
  limit: number;
  // Filter parameters
  status?: string;
  orderId?: string;
  orderName?: string;
  orderDateStart?: string;
  orderDateEnd?: string;
  lastUpdatedDateStart?: string;
  lastUpdatedDateEnd?: string;
  subtotalStart?: string;
  subtotalEnd?: string;
  taxableStart?: string;
  taxableEnd?: string;
  totalStart?: string;
  totalEnd?: string;
}

export class OrdersService extends BaseService<OrdersService> {
  // Configure default client for orders operations
  protected defaultClient = coreCommerceClient;

  /**
   * 🚀 SIMPLIFIED: Get orders (auto-context)
   * Usage: OrdersService.getOrders(params)
   */
  async getOrders(params: OrdersParams): Promise<unknown> {
    const { userId, companyId, offset, limit, ...filters } = params;

    // Build query string with filters
    const queryParams = new URLSearchParams({
      userId,
      companyId,
      offset: offset.toString(),
      pgLimit: limit.toString(),
    });

    // Add filter parameters if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    return this.call(
      `/orders/findByFilter?${queryParams.toString()}`,
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
    const { userId, companyId, offset, limit, ...filters } = params;

    // Build query string with filters
    const queryParams = new URLSearchParams({
      userId,
      companyId,
      offset: offset.toString(),
      pgLimit: limit.toString(),
    });

    // Add filter parameters if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    return this.callWith(
      `/orders/findByFilter?${queryParams.toString()}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrdersService.getOrdersServerSide(params)
   */
  async getOrdersServerSide(params: OrdersParams): Promise<unknown | null> {
    const { userId, companyId, offset, limit, ...filters } = params;

    // Build query string with filters
    const queryParams = new URLSearchParams({
      userId,
      companyId,
      offset: offset.toString(),
      pgLimit: limit.toString(),
    });

    // Add filter parameters if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    return this.callSafe(
      `/orders/findByFilter?${queryParams.toString()}`,
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
    const { userId, companyId, offset, limit, ...filters } = params;

    // Build query string with filters
    const queryParams = new URLSearchParams({
      userId,
      companyId,
      offset: offset.toString(),
      pgLimit: limit.toString(),
    });

    // Add filter parameters if they exist
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    return this.callWithSafe(
      `/orders/findByFilter?${queryParams.toString()}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }
}

export default OrdersService.getInstance();
