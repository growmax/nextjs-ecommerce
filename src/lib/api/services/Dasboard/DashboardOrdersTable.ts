import { Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "@/lib/api/client";

export interface OrdersResponse {
  ordersResponse: Order[];
  totalOrderCount: number;
}

export interface OrdersApiResponse {
  status: string;
  data: OrdersResponse;
}

export interface OrdersRequestParams {
  userId?: string;
  companyId?: string;
  offset?: number;
  limit?: number;
  status?: string;
}

export class DashboardOrdersTableService {
  private static instance: DashboardOrdersTableService;

  private constructor() {}

  public static getInstance(): DashboardOrdersTableService {
    if (!DashboardOrdersTableService.instance) {
      DashboardOrdersTableService.instance = new DashboardOrdersTableService();
    }
    return DashboardOrdersTableService.instance;
  }

  /**
   * Fetch orders with filters
   */
  async getOrders(
    params: OrdersRequestParams,
    context: RequestContext
  ): Promise<OrdersApiResponse> {
    const client = createClientWithContext(coreCommerceClient, context);

    const {
      userId = process.env.DEFAULT_USER_ID || "1032",
      companyId = process.env.DEFAULT_COMPANY_ID || "8690",
      offset = 0,
      limit = parseInt(process.env.ORDERS_API_DEFAULT_LIMIT || "20"),
      status,
    } = params;

    const endpoint = process.env.ORDERS_API_ENDPOINT || "orders/findByFilter";

    const queryParams = new URLSearchParams({
      userId,
      companyId,
      offset: offset.toString(),
      pgLimit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const url = `${endpoint}?${queryParams.toString()}`;

    const response = await client.post(url, {});
    return response.data;
  }

  /**
   * Server-side version (handles errors gracefully)
   */
  async getOrdersServerSide(
    params: OrdersRequestParams,
    context: RequestContext
  ): Promise<OrdersApiResponse | null> {
    try {
      return await this.getOrders(params, context);
    } catch {
      return null;
    }
  }
}

export default DashboardOrdersTableService.getInstance();
