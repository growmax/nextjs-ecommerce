// Mocks for OrdersService
// These mocks are for testing the service in isolation.

import type { OrdersParams } from "./OrdersService";

export const mockOrdersParams: OrdersParams = {
  userId: "123",
  companyId: "456",
  offset: 0,
  limit: 20,
  status: "pending",
};

export const mockOrdersParamsWithFilters: OrdersParams = {
  userId: "123",
  companyId: "456",
  offset: 0,
  limit: 20,
  status: "pending",
  orderId: "ORD-001",
  orderName: "Test Order",
  orderDateStart: "2024-01-01",
  orderDateEnd: "2024-12-31",
};

export const mockOrdersParamsAll: OrdersParams = {
  userId: "123",
  companyId: "456",
  offset: 0,
  limit: 20,
  filterType: "all",
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

export const mockCreateOrderData = {
  orderName: "New Order",
  orderIdentifier: "ORD-002",
  userId: 123,
  companyId: 456,
  status: "draft",
  orderDate: "2024-01-01",
  requiredDate: "2024-01-15",
  subTotal: 500,
  taxableAmount: 50,
  grandTotal: 550,
};

export const mockCreateOrderResponse = {
  success: true,
  data: {
    orderId: "ORD-002",
    orderName: "New Order",
    status: "draft",
  },
};
