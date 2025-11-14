import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

// Request parameters interface
export interface RequestEditParams {
  userId: number;
  companyId: number;
  orderId: string;
  data?: Record<string, unknown>;
}

// Response interface
export interface RequestEditResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  status?: string;
}

export class RequestEditService extends BaseService<RequestEditService> {
  // Use coreCommerceClient for order-related operations
  protected defaultClient = coreCommerceClient;

  /**
   * Request edit for an order
   * @param params - The parameters for requesting edit
   * @returns Promise<RequestEditResponse>
   */
  async requestEdit(params: RequestEditParams): Promise<RequestEditResponse> {
    const { userId, companyId, orderId, data } = params;

    // Build query string
    const query = `userId=${encodeURIComponent(String(userId))}&companyId=${encodeURIComponent(String(companyId))}&orderIdentifier=${encodeURIComponent(orderId)}`;

    // Send data in body: { data: {...} }
    return this.call(
      `orders/requestEdit?${query}`,
      { data: data || {} },
      "PUT"
    ) as Promise<RequestEditResponse>;
  }

  /**
   * Server-side version that returns null on error
   * @param params - The parameters for requesting edit
   * @returns Promise<RequestEditResponse | null>
   */
  async requestEditServerSide(
    params: RequestEditParams
  ): Promise<RequestEditResponse | null> {
    const { userId, companyId, orderId, data } = params;

    const query = `userId=${encodeURIComponent(String(userId))}&companyId=${encodeURIComponent(String(companyId))}&orderIdentifier=${encodeURIComponent(orderId)}`;

    return this.callSafe(
      `orders/requestEdit?${query}`,
      { data: data || {} },
      "PUT"
    ) as Promise<RequestEditResponse | null>;
  }
}

export default RequestEditService.getInstance();
