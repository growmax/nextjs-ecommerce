import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "../../client";
import { Order } from "@/types/Dashboard/DasbordOrderstable/DashboardOrdersTable";

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
    } = params;

    const endpoint = process.env.ORDERS_API_ENDPOINT || "orders/findByFilter";
    const url = `${endpoint}?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${limit}`;

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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch orders:", error);
      return null;
    }
  }
}

export default DashboardOrdersTableService.getInstance();
