import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Request parameters interface
export interface FetchOrderDetailsParams {
  userId: number;
  tenantId: string;
  companyId: number;
  orderId: string;
}

// Product details interface
export interface DbProductDetail {
  itemNo?: number;
  productShortDescription?: string;
  brandProductId?: string;
  itemTaxableAmount?: number;
  discount?: number;
  unitPrice?: number;
  unitQuantity?: number;
  invoiceQuantity?: number;
  totalPrice?: number;
  tax?: number;
  [key: string]: unknown;
}

// Response interface - extend this as you get more data from the API
export interface OrderDetailItem {
  orderIdentifier: string;
  orderName: string;
  orderDescription?: string;
  grandTotal?: number;
  subTotal?: number;
  taxableAmount?: number;
  buyerCompanyName?: string;
  sellerCompanyName?: string;
  updatedBuyerStatus?: string;
  updatedSellerStatus?: string;
  dbProductDetails?: DbProductDetail[];
  // Add more fields as needed
  [key: string]: unknown;
}

export interface OrderDetailsData {
  orderIdentifier: string;
  orderType?: {
    channelCode: string;
    id: number;
    name: string;
    tenantId: number;
  };
  createdDate?: string;
  orderDeliveryDate?: string;
  updatedBuyerStatus?: string;
  updatedSellerStatus?: string;
  orderDetails?: OrderDetailItem[];
  buyerCurrencySymbol?: {
    currencyCode?: string;
    symbol?: string;
    decimal?: string;
    thousand?: string;
    precision?: number;
  };
  // Add more fields as needed based on actual API response
  [key: string]: unknown;
}

export interface OrderDetailsResponse {
  data: OrderDetailsData;
  message: string | null;
  status: string;
}

export class OrderDetailsService extends BaseService<OrderDetailsService> {
  // Configure default client for order details operations
  protected defaultClient = coreCommerceClient;

  /**
   * 🚀 SIMPLIFIED: Fetch order details (auto-context)
   * Usage: OrderDetailsService.fetchOrderDetails(params)
   */
  async fetchOrderDetails(
    params: FetchOrderDetailsParams
  ): Promise<OrderDetailsResponse> {
    const { userId, companyId, orderId } = params;

    // Build query string - only userId, companyId, and orderIdentifier
    const queryString = `userId=${userId}&companyId=${companyId}&orderIdentifier=${orderId}`;

    return this.call(
      `orders/fetchOrderDetails?${queryString}`,
      {},
      "GET"
    ) as Promise<OrderDetailsResponse>;
  }

  /**
   * 🔧 ADVANCED: Fetch order details with custom context (when needed)
   */
  async fetchOrderDetailsWithContext(
    params: FetchOrderDetailsParams,
    context: RequestContext
  ): Promise<OrderDetailsResponse> {
    const { userId, companyId, orderId } = params;

    const queryString = `userId=${userId}&companyId=${companyId}&orderIdentifier=${orderId}`;

    return this.callWith(
      `orders/fetchOrderDetails?${queryString}`,
      {},
      {
        context,
        method: "GET",
      }
    ) as Promise<OrderDetailsResponse>;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrderDetailsService.fetchOrderDetailsServerSide(params)
   */
  async fetchOrderDetailsServerSide(
    params: FetchOrderDetailsParams
  ): Promise<OrderDetailsResponse | null> {
    const { userId, companyId, orderId } = params;

    const queryString = `userId=${userId}&companyId=${companyId}&orderIdentifier=${orderId}`;

    return this.callSafe(
      `orders/fetchOrderDetails?${queryString}`,
      {},
      "GET"
    ) as Promise<OrderDetailsResponse | null>;
  }

  /**
   * 🔧 ADVANCED: Server-side with custom context (when needed)
   */
  async fetchOrderDetailsServerSideWithContext(
    params: FetchOrderDetailsParams,
    context: RequestContext
  ): Promise<OrderDetailsResponse | null> {
    const { userId, companyId, orderId } = params;

    const queryString = `userId=${userId}&companyId=${companyId}&orderIdentifier=${orderId}`;

    return this.callWithSafe(
      `orders/fetchOrderDetails?${queryString}`,
      {},
      {
        context,
        method: "GET",
      }
    ) as Promise<OrderDetailsResponse | null>;
  }
}

export default OrderDetailsService.getInstance();
