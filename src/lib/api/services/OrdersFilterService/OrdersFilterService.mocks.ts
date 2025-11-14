// Mocks for OrdersFilterService
// These mocks are for testing the service in isolation.

import type { OrderFilter, OrdersFilterParams } from "./OrdersFilterService";

export const mockOrderFilter: OrderFilter = {
  filter_index: 0,
  filter_name: "Test Filter",
  accountId: [],
  accountOwners: [],
  approvalAwaiting: [],
  endDate: "",
  endCreatedDate: "",
  endValue: null,
  endTaxableAmount: null,
  endGrandTotal: null,
  identifier: "",
  limit: 20,
  offset: 0,
  name: "",
  pageNumber: 1,
  startDate: "",
  startCreatedDate: "",
  startValue: null,
  startTaxableAmount: null,
  startGrandTotal: null,
  status: [],
  quoteUsers: [],
  tagsList: [],
  options: ["ByBranch"],
  branchId: [],
  businessUnitId: [],
  selectedColumns: [],
  columnWidth: [],
  columnPosition: "",
};

export const mockOrdersFilterParams: OrdersFilterParams = {
  userId: 123,
  companyId: 456,
  offset: 0,
  pgLimit: 20,
  status: "pending",
  filters: [mockOrderFilter],
  selected: 0,
};

export const mockOrdersResponse = {
  success: true,
  data: [
    {
      orderId: "ORD-001",
      orderName: "Test Order",
      status: "pending",
      subTotal: 1000,
      grandTotal: 1200,
    },
  ],
  total: 1,
};
