// Mocks for OrderNameService
// These mocks are for testing the service in isolation.

import type {
  UpdateOrderNameRequest,
  UpdateOrderNameResponse,
} from "@/lib/api/services/OrderNameService/OrderNameService";

export const mockUpdateOrderNameRequest: UpdateOrderNameRequest = {
  userId: 123,
  companyId: 456,
  orderIdentifier: "ORD-001",
  orderName: "New Order Name",
};

export const mockUpdateOrderNameResponse: UpdateOrderNameResponse = {
  success: true,
  message: "Order name updated successfully",
  orderName: "New Order Name",
};

export const mockUpdateOrderNameResponseError: UpdateOrderNameResponse = {
  success: false,
  message: "Failed to update order name",
};
