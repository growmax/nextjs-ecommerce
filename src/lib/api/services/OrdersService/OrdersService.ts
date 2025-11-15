import { RequestContext, coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

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

    // Send a default filter object like quotes API
    const body = {
      filter_index: 0,
      filter_name: "Default",
      endCreatedDate: "",
      endDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit: params.limit,
      offset: params.offset,
      name: "",
      pageNumber: Math.floor(params.offset / params.limit) + 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: params.status ? [params.status] : [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
      userDisplayName: "",
      userStatus: [],
      accountId: [],
      branchId: [],
    };

    return this.call(`orders/findByFilter?${queryString}`, body, "POST");
  }

  /**
   * 🔧 ADVANCED: Get orders with custom context (when needed)
   */
  async getOrdersWithContext(
    params: OrdersParams,
    context: RequestContext
  ): Promise<unknown> {
    const queryString = this.buildQueryString(params);

    // Send a default filter object like quotes API
    const body = {
      filter_index: 0,
      filter_name: "Default",
      endCreatedDate: "",
      endDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit: params.limit,
      offset: params.offset,
      name: "",
      pageNumber: Math.floor(params.offset / params.limit) + 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: params.status ? [params.status] : [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
      userDisplayName: "",
      userStatus: [],
      accountId: [],
      branchId: [],
    };

    return this.callWith(`orders/findByFilter?${queryString}`, body, {
      context,
      method: "POST",
    });
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrdersService.getOrdersServerSide(params)
   */
  async getOrdersServerSide(params: OrdersParams): Promise<unknown | null> {
    const queryString = this.buildQueryString(params);

    // Send a default filter object like quotes API
    const body = {
      filter_index: 0,
      filter_name: "Default",
      endCreatedDate: "",
      endDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit: params.limit,
      offset: params.offset,
      name: "",
      pageNumber: Math.floor(params.offset / params.limit) + 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: params.status ? [params.status] : [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
      userDisplayName: "",
      userStatus: [],
      accountId: [],
      branchId: [],
    };

    return this.callSafe(`orders/findByFilter?${queryString}`, body, "POST");
  }

  /**
   * 🔧 ADVANCED: Server-side with custom context (when needed)
   */
  async getOrdersServerSideWithContext(
    params: OrdersParams,
    context: RequestContext
  ): Promise<unknown | null> {
    const queryString = this.buildQueryString(params);

    // Send a default filter object like quotes API
    const body = {
      filter_index: 0,
      filter_name: "Default",
      endCreatedDate: "",
      endDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit: params.limit,
      offset: params.offset,
      name: "",
      pageNumber: Math.floor(params.offset / params.limit) + 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: params.status ? [params.status] : [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
      userDisplayName: "",
      userStatus: [],
      accountId: [],
      branchId: [],
    };

    return this.callWithSafe(`orders/findByFilter?${queryString}`, body, {
      context,
      method: "POST",
    });
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

  /**
   * Create a new order
   * @param orderData - Order creation data
   * @returns Created order response
   */
  async createOrder(orderData: {
    orderName: string;
    orderIdentifier: string;
    userId: number;
    companyId: number;
    status?: string;
    orderDate?: string;
    requiredDate?: string;
    subTotal?: number;
    taxableAmount?: number;
    grandTotal?: number;
  }): Promise<unknown> {
    const queryString = `userId=${orderData.userId}&companyId=${orderData.companyId}`;
    return this.call(`orders/create?${queryString}`, orderData, "POST");
  }

  /**
   * Create order with custom context
   * @param orderData - Order creation data
   * @param context - Request context
   * @returns Created order response
   */
  async createOrderWithContext(
    orderData: {
      orderName: string;
      orderIdentifier: string;
      userId: number;
      companyId: number;
      status?: string;
      orderDate?: string;
      requiredDate?: string;
      subTotal?: number;
      taxableAmount?: number;
      grandTotal?: number;
    },
    context: RequestContext
  ): Promise<unknown> {
    const queryString = `userId=${orderData.userId}&companyId=${orderData.companyId}`;
    return this.callWith(`orders/create?${queryString}`, orderData, {
      context,
      method: "POST",
    });
  }

  /**
   * Server-safe version for creating orders
   * @param orderData - Order creation data
   * @returns Created order response or null if error
   */
  async createOrderServerSide(orderData: {
    orderName: string;
    orderIdentifier: string;
    userId: number;
    companyId: number;
    status?: string;
    orderDate?: string;
    requiredDate?: string;
    subTotal?: number;
    taxableAmount?: number;
    grandTotal?: number;
  }): Promise<unknown | null> {
    const queryString = `userId=${orderData.userId}&companyId=${orderData.companyId}`;
    return this.callSafe(`orders/create?${queryString}`, orderData, "POST");
  }

  /**
   * Place order from quote (convert quote to order)
   * @param params - Parameters for order creation
   * @param orderData - Transformed order data from quote
   * @returns Order creation response with orderIdentifier
   */
  async placeOrderFromQuote(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    orderData: any
  ): Promise<{ orderIdentifier: string }> {
    const queryString = `userId=${params.userId}&companyId=${params.companyId}`;
    const response = await this.call(
      `orders/createOrderByBuyer?${queryString}`,
      orderData,
      "POST"
    );
    return response as { orderIdentifier: string };
  }

  /**
   * Server-safe version of place order from quote
   * @param params - Parameters for order creation
   * @param orderData - Transformed order data from quote
   * @returns Order creation response or null if error
   */
  async placeOrderFromQuoteServerSide(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    orderData: any
  ): Promise<{ orderIdentifier: string } | null> {
    const queryString = `userId=${params.userId}&companyId=${params.companyId}`;
    const response = await this.callSafe(
      `orders/createOrderByBuyer?${queryString}`,
      orderData,
      "POST"
    );
    return response as { orderIdentifier: string } | null;
  }

  /**
   * Place order from quote with custom context
   * @param params - Parameters for order creation
   * @param orderData - Transformed order data from quote
   * @param context - Request context
   * @returns Order creation response with orderIdentifier
   */
  async placeOrderFromQuoteWithContext(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    orderData: any,
    context: RequestContext
  ): Promise<{ orderIdentifier: string }> {
    const queryString = `userId=${params.userId}&companyId=${params.companyId}`;
    const response = await this.callWith(
      `orders/createOrderByBuyer?${queryString}`,
      orderData,
      {
        context,
        method: "POST",
      }
    );
    return response as { orderIdentifier: string };
  }
}

export default OrdersService.getInstance();
