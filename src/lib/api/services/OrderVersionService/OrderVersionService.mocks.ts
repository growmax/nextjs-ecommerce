// Mocks for OrderVersionService
// These mocks are for testing the service in isolation.

import type {
  CreateOrderVersionRequest,
  CreateOrderVersionResponse,
} from "@/lib/api/services/OrderVersionService/OrderVersionService";

export const mockCreateOrderVersionRequest: CreateOrderVersionRequest = {
  orderIdentifier: "ORD-001",
  userId: 123,
  companyId: 456,
  versionData: {
    products: [],
    total: 1000,
  },
};

export const mockCreateOrderVersionResponse: CreateOrderVersionResponse = {
  success: true,
  result: {
    versionId: "V-001",
    orderIdentifier: "ORD-001",
  },
  isLoggedIn: true,
  data: {
    versionNumber: 2,
  },
  message: "Version created successfully",
};
