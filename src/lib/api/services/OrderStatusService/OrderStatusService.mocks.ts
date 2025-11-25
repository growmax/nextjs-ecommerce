// Mocks for OrderStatusService
// These mocks are for testing the service in isolation.

import type { OrderStatusResponse } from "@/lib/api/services/OrderStatusService/OrderStatusService";

export const mockOrderStatusParams = {
  userId: "123",
  companyId: "456",
};

export const mockOrderStatusResponse: OrderStatusResponse = {
  data: ["Draft", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
  message: "Success",
  status: "success",
};

export const mockOrderStatusResponseEmpty: OrderStatusResponse = {
  data: [],
  message: "No statuses found",
  status: "success",
};
