import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

export interface OrdersParams {
  userId: string;
  companyId: string;
  offset: number;
  limit: number;
}

export class OrdersService extends BaseService<OrdersService> {
  // Configure default client for orders operations
  protected defaultClient = coreCommerceClient;

  /**
   * 🚀 SIMPLIFIED: Get orders (auto-context)
   * Usage: OrdersService.getOrders(params)
   */
  async getOrders(params: OrdersParams): Promise<unknown> {
    const { userId, companyId, offset, limit } = params;

    return this.call(
      `/orders/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${limit}`,
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
    const { userId, companyId, offset, limit } = params;

    return this.callWith(
      `/orders/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${limit}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrdersService.getOrdersServerSide(params)
   */
  async getOrdersServerSide(params: OrdersParams): Promise<unknown | null> {
    const { userId, companyId, offset, limit } = params;

    return this.callSafe(
      `/orders/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${limit}`,
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
    const { userId, companyId, offset, limit } = params;

    return this.callWithSafe(
      `/orders/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${limit}`,
      {}, // Empty body as per the original API route
      { context, method: "POST" }
    );
  }
}

export default OrdersService.getInstance();
