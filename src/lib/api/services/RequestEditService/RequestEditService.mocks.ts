// Mocks for RequestEditService
// These mocks are for testing the service in isolation.

import type {
  RequestEditParams,
  RequestEditResponse,
} from "@/lib/api/services/RequestEditService/RequestEditService";

export const mockRequestEditParams: RequestEditParams = {
  userId: 123,
  companyId: 456,
  orderId: "ORD-001",
  data: {
    reason: "Price adjustment needed",
    changes: ["quantity", "discount"],
  },
};

export const mockRequestEditParamsWithoutData: RequestEditParams = {
  userId: 123,
  companyId: 456,
  orderId: "ORD-001",
};

export const mockRequestEditResponse: RequestEditResponse = {
  success: true,
  data: {
    editRequestId: "ER-001",
    status: "pending",
  },
  message: "Edit request submitted successfully",
  status: "success",
};

export const mockRequestEditResponseError: RequestEditResponse = {
  success: false,
  message: "Failed to submit edit request",
  status: "error",
};
