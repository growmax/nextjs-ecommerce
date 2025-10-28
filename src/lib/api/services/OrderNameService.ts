import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

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

    return this.call(
      `/orders/changeOrderName?userId=${userId}&companyId=${companyId}&orderIdentifier=${orderIdentifier}`,
      { orderName },
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
    return this.callSafe(
      `/orders/changeOrderName?userId=${params.userId}&companyId=${params.companyId}&orderIdentifier=${params.orderIdentifier}`,
      { orderName: params.orderName },
      "PUT"
    ) as Promise<UpdateOrderNameResponse | null>;
  }
}

export default OrderNameService.getInstance();
