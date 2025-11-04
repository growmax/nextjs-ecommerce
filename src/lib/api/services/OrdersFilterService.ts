import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

export interface FilterColumn {
  id: string;
  width: number;
}

export interface OrderFilter {
  filter_index: number;
  filter_name: string;
  accountId?: string[];
  accountOwners?: string[];
  approvalAwaiting?: string[];
  endDate?: string;
  endCreatedDate?: string;
  endValue?: number | null;
  endTaxableAmount?: number | null;
  endGrandTotal?: number | null;
  identifier?: string;
  limit: number;
  offset: number;
  name?: string;
  pageNumber: number;
  startDate?: string;
  startCreatedDate?: string;
  startValue?: number | null;
  startTaxableAmount?: number | null;
  startGrandTotal?: number | null;
  status?: string[];
  quoteUsers?: string[];
  tagsList?: string[];
  options?: string[];
  branchId?: string[];
  businessUnitId?: string[];
  selectedColumn?: string[];
  selectedColumns?: string[];
  columnWidth?: FilterColumn[];
  columnPosition?: string;
  userDisplayName?: string;
  userStatus?: string[];
}

export interface OrdersFilterPayload {
  userId: number;
  module: string;
  method: string;
  body: {
    filters: OrderFilter[];
    selected: number;
  };
}

export interface OrdersFilterParams {
  userId: number;
  companyId: number;
  offset?: number;
  pgLimit?: number;
  status?: string;
  filters?: OrderFilter[];
  selected?: number;
}

export class OrdersFilterService extends BaseService<OrdersFilterService> {
  protected defaultClient = coreCommerceClient;

  private createDefaultFilter(
    offset: number = 0,
    limit: number = 20,
    status?: string
  ): OrderFilter {
    const baseFilter: OrderFilter = {
      filter_index: 0,
      filter_name: "Current Filter",
      accountId: [],
      accountOwners: [],
      approvalAwaiting: [],
      endDate: "",
      endCreatedDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit,
      offset,
      name: "",
      pageNumber: Math.floor(offset / limit) + 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: status ? [status] : [],
      quoteUsers: [],
      tagsList: [],
      options: ["ByBranch"],
      branchId: [],
      businessUnitId: [],
      selectedColumns: [
        "createdDate",
        "sellerCompanyName",
        "itemcount",
        "subTotal",
        "grandTotal",
        "updatedBuyerStatus",
        "requiredDate",
        "taxableAmount",
        "orderIdentifier",
        "orderName",
        "lastUpdatedDate",
      ],
      columnWidth: [
        { id: "orderName", width: 210 },
        { id: "orderIdentifier", width: 240 },
        { id: "createdDate", width: 200 },
        { id: "lastUpdatedDate", width: 200 },
        { id: "sellerCompanyName", width: 260 },
        { id: "itemcount", width: 160 },
        { id: "subTotal", width: 225 },
        { id: "taxableAmount", width: 245 },
        { id: "grandTotal", width: 245 },
        { id: "updatedBuyerStatus", width: 270 },
        { id: "requiredDate", width: 260 },
      ],
      columnPosition:
        '["orderName","lastUpdatedDate","orderIdentifier","createdDate","sellerCompanyName","itemcount","subTotal","taxableAmount","grandTotal","updatedBuyerStatus","requiredDate"]',
    };

    return baseFilter;
  }

  private buildPayload(params: OrdersFilterParams): OrderFilter {
    const { offset = 0, pgLimit = 20, status, filters } = params;

    // If filters are provided, use the first one (main filter)
    // Otherwise create a default filter
    if (filters && filters.length > 0 && filters[0]) {
      return filters[0];
    }

    return this.createDefaultFilter(offset, pgLimit, status);
  }

  private buildQueryParams(params: OrdersFilterParams): string {
    const { userId, companyId, offset = 0, pgLimit = 20, status } = params;

    const queryParts = [
      `userId=${userId}`,
      `companyId=${companyId}`,
      `offset=${offset}`,
      `pgLimit=${pgLimit}`,
    ];

    if (status) {
      queryParts.push(`status=${encodeURIComponent(status)}`);
    }

    return queryParts.join("&");
  }

  /**
   * Get orders with filter payload (like quotes API)
   */
  async getOrdersWithFilter(params: OrdersFilterParams): Promise<unknown> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    // Send the filter directly as the body, like quotes API
    return this.call(`orders/findByFilter?${queryString}`, payload, "POST");
  }

  /**
   * Get orders with filter payload (with custom context)
   */
  async getOrdersWithFilterAndContext(
    params: OrdersFilterParams,
    context: RequestContext
  ): Promise<unknown> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    // Send the filter directly as the body, like quotes API
    return this.callWith(`orders/findByFilter?${queryString}`, payload, {
      context,
      method: "POST",
    });
  }

  /**
   * Server-side version with error handling
   */
  async getOrdersWithFilterServerSide(
    params: OrdersFilterParams
  ): Promise<unknown | null> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    // Send the filter directly as the body, like quotes API
    return this.callSafe(`orders/findByFilter?${queryString}`, payload, "POST");
  }

  /**
   * Get orders with custom filters
   */
  async getOrdersWithCustomFilters(
    userId: number,
    companyId: number,
    filter: OrderFilter
  ): Promise<unknown> {
    const params: OrdersFilterParams = {
      userId,
      companyId,
      filters: [filter],
      selected: 0,
    };

    return this.getOrdersWithFilter(params);
  }

  /**
   * Get orders by status with proper filter structure
   */
  async getOrdersByStatus(
    userId: number,
    companyId: number,
    status: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<unknown> {
    const filter = this.createDefaultFilter(offset, limit, status);

    const params: OrdersFilterParams = {
      userId,
      companyId,
      offset,
      pgLimit: limit,
      filters: [filter],
      status,
      selected: 0,
    };

    return this.getOrdersWithFilter(params);
  }

  /**
   * Get all orders (no status filter)
   */
  async getAllOrders(
    userId: number,
    companyId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<unknown> {
    const filter = this.createDefaultFilter(offset, limit);

    const params: OrdersFilterParams = {
      userId,
      companyId,
      offset,
      pgLimit: limit,
      filters: [filter],
      selected: 0,
    };

    return this.getOrdersWithFilter(params);
  }

  /**
   * Save order filter (create/update filter)
   * @param params - Filter parameters
   * @returns Saved filter response
   */
  async saveOrderFilter(params: OrdersFilterParams): Promise<unknown> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    return this.call(`orders/saveFilter?${queryString}`, payload, "POST");
  }

  /**
   * Save order filter with custom context
   * @param params - Filter parameters
   * @param context - Request context
   * @returns Saved filter response
   */
  async saveOrderFilterWithContext(
    params: OrdersFilterParams,
    context: RequestContext
  ): Promise<unknown> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    return this.callWith(`orders/saveFilter?${queryString}`, payload, {
      context,
      method: "POST",
    });
  }

  /**
   * Server-safe version for saving order filter
   * @param params - Filter parameters
   * @returns Saved filter response or null if error
   */
  async saveOrderFilterServerSide(
    params: OrdersFilterParams
  ): Promise<unknown | null> {
    const queryString = this.buildQueryParams(params);
    const payload = this.buildPayload(params);

    return this.callSafe(`orders/saveFilter?${queryString}`, payload, "POST");
  }

  /**
   * Save custom order filter
   * @param userId - User ID
   * @param companyId - Company ID
   * @param filter - Custom filter object
   * @returns Saved filter response
   */
  async saveCustomOrderFilter(
    userId: number,
    companyId: number,
    filter: OrderFilter
  ): Promise<unknown> {
    const params: OrdersFilterParams = {
      userId,
      companyId,
      filters: [filter],
      selected: 0,
    };

    return this.saveOrderFilter(params);
  }
}

export default OrdersFilterService.getInstance();
