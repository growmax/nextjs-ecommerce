import { RequestContext, coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

export interface OrderStatusResponse {
  data: string[];
  message: string | null;
  status: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export class OrderStatusService extends BaseService<OrderStatusService> {
  protected defaultClient = coreCommerceClient;

  /**
   * 🚀 SIMPLIFIED: Get order statuses by company (auto-context)
   * Usage: OrderStatusService.findStatusByCompany({ userId, companyId })
   */
  async findStatusByCompany(params: {
    userId: string;
    companyId: string;
  }): Promise<OrderStatusResponse> {
    const queryString = `userId=${encodeURIComponent(params.userId)}&companyId=${encodeURIComponent(params.companyId)}`;
    return this.call(
      `/orders/findStatusByCompany?${queryString}`,
      {},
      "GET"
    ) as Promise<OrderStatusResponse>;
  }

  /**
   * 🔧 ADVANCED: Get order statuses by company with custom context
   */
  async findStatusByCompanyWithContext(
    params: {
      userId: string;
      companyId: string;
    },
    context: RequestContext
  ): Promise<OrderStatusResponse> {
    const queryString = `userId=${encodeURIComponent(params.userId)}&companyId=${encodeURIComponent(params.companyId)}`;
    return this.callWith(
      `/orders/findStatusByCompany?${queryString}`,
      {},
      {
        context,
        method: "GET",
      }
    ) as Promise<OrderStatusResponse>;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: OrderStatusService.findStatusByCompanyServerSide({ userId, companyId })
   */
  async findStatusByCompanyServerSide(params: {
    userId: string;
    companyId: string;
  }): Promise<OrderStatusResponse | null> {
    const queryString = `userId=${encodeURIComponent(params.userId)}&companyId=${encodeURIComponent(params.companyId)}`;
    return this.callSafe(
      `/orders/findStatusByCompany?${queryString}`,
      {},
      "GET"
    ) as Promise<OrderStatusResponse | null>;
  }

  /**
   * 🔧 ADVANCED: Server-side with custom context
   */
  async findStatusByCompanyServerSideWithContext(
    params: {
      userId: string;
      companyId: string;
    },
    context: RequestContext
  ): Promise<OrderStatusResponse | null> {
    const queryString = `userId=${encodeURIComponent(params.userId)}&companyId=${encodeURIComponent(params.companyId)}`;
    return this.callWithSafe(
      `/orders/findStatusByCompany?${queryString}`,
      {},
      {
        context,
        method: "GET",
      }
    ) as Promise<OrderStatusResponse | null>;
  }

  /**
   * 🌟 CONVENIENCE: Get order statuses formatted for UI components
   * Usage: OrderStatusService.getOrderStatuses()
   */
  async getOrderStatuses(params?: {
    userId?: string;
    companyId?: string;
  }): Promise<StatusOption[]> {
    // Use default values if not provided
    const userId = params?.userId || "1032";
    const companyId = params?.companyId || "8690";

    const response = await this.findStatusByCompany({ userId, companyId });

    return response.data.map(status => ({
      value: status,
      label: status,
    }));
  }

  /**
   * 🛡️ CONVENIENCE: Server-side version for UI components
   */
  async getOrderStatusesServerSide(params?: {
    userId?: string;
    companyId?: string;
  }): Promise<StatusOption[]> {
    const userId = params?.userId || "1032";
    const companyId = params?.companyId || "8690";

    const response = await this.findStatusByCompanyServerSide({
      userId,
      companyId,
    });

    if (!response) {
      return [];
    }

    return response.data.map(status => ({
      value: status,
      label: status,
    }));
  }
}

export default OrderStatusService.getInstance();
