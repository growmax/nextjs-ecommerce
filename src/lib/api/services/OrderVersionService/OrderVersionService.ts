import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Request interface for creating a new order version
export interface CreateOrderVersionRequest {
  orderIdentifier: string;
  userId: number | string;
  companyId: number | string;
  versionData: unknown; // The order body data
}

// Response interface
export interface CreateOrderVersionResponse {
  success?: boolean;
  result?: unknown;
  isLoggedIn?: boolean;
  data?: unknown;
  message?: string;
}

export class OrderVersionService extends BaseService<OrderVersionService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Create a new version of an order
   * Usage: OrderVersionService.createNewVersion({ orderIdentifier, userId, companyId, versionData })
   * @param request - Request object with orderIdentifier, userId, companyId, and versionData
   * @returns Promise<CreateOrderVersionResponse>
   */
  async createNewVersion(
    request: CreateOrderVersionRequest
  ): Promise<CreateOrderVersionResponse> {
    const { orderIdentifier, userId, companyId, versionData } = request;
    const url = `orders/createNewVersion?orderIdentifier=${encodeURIComponent(orderIdentifier)}&userId=${userId}&companyId=${companyId}`;

    return this.call(
      url,
      versionData,
      "POST"
    ) as Promise<CreateOrderVersionResponse>;
  }

  /**
   * Server-side version that returns null on error
   * Usage: OrderVersionService.createNewVersionServerSide(request)
   * @param request - Request object with orderIdentifier, userId, companyId, and versionData
   * @returns Promise<CreateOrderVersionResponse | null>
   */
  async createNewVersionServerSide(
    request: CreateOrderVersionRequest
  ): Promise<CreateOrderVersionResponse | null> {
    const { orderIdentifier, userId, companyId, versionData } = request;
    const url = `orders/createNewVersion?orderIdentifier=${encodeURIComponent(orderIdentifier)}&userId=${userId}&companyId=${companyId}`;

    return this.callSafe(
      url,
      versionData,
      "POST"
    ) as Promise<CreateOrderVersionResponse | null>;
  }
}

export default OrderVersionService.getInstance();
