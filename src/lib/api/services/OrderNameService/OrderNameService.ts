import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Define the request parameters for updating order name
export interface UpdateOrderNameRequest {
  userId: number;
  companyId: number;
  orderIdentifier: string;
  orderName: string;
}

// Define the response type
export interface UpdateOrderNameResponse {
  success: boolean;
  message: string;
  orderName?: string;
}

export class OrderNameService extends BaseService<OrderNameService> {
  // Use coreCommerceClient for order-related operations
  protected defaultClient = coreCommerceClient;

  /**
   * Update the order name
   * @param params - The parameters for updating order name
   * @returns Promise<UpdateOrderNameResponse>
   */
  async updateOrderName(
    params: UpdateOrderNameRequest
  ): Promise<UpdateOrderNameResponse> {
    const { userId, companyId, orderIdentifier, orderName } = params;

    // Backend expects the payload as { newName: "..." }
    const query = `userId=${encodeURIComponent(String(userId))}&companyId=${encodeURIComponent(String(companyId))}&orderIdentifier=${encodeURIComponent(orderIdentifier)}`;

    return this.call(
      `/orders/changeOrderName?${query}`,
      { newName: orderName },
      "PUT"
    ) as Promise<UpdateOrderNameResponse>;
  }

  /**
   * Server-side version that returns null on error
   * @param params - The parameters for updating order name
   * @returns Promise<UpdateOrderNameResponse | null>
   */
  async updateOrderNameServerSide(
    params: UpdateOrderNameRequest
  ): Promise<UpdateOrderNameResponse | null> {
    const query = `userId=${encodeURIComponent(String(params.userId))}&companyId=${encodeURIComponent(String(params.companyId))}&orderIdentifier=${encodeURIComponent(params.orderIdentifier)}`;

    return this.callSafe(
      `/orders/changeOrderName?${query}`,
      { newName: params.orderName },
      "PUT"
    ) as Promise<UpdateOrderNameResponse | null>;
  }
}

export default OrderNameService.getInstance();
