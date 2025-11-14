// Mocks for useGetVersionDetails
// These mocks are for testing the hook in isolation.

import type { OrderDetailsResponse } from "@/lib/api";

export const mockUser = {
  userId: 123,
  companyId: 456,
};

export const mockTenantData = {
  tenant: {
    tenantCode: "test-tenant",
  },
};

export const mockOrderIdentifier = "ORDER-123";
export const mockOrderVersion = 2;

export const mockOrderDetailsResponse: OrderDetailsResponse = {
  data: {
    orderIdentifier: mockOrderIdentifier,
    orderDetails: [
      {
        orderIdentifier: mockOrderIdentifier,
        orderVersion: mockOrderVersion,
        orderName: "Test Order",
        orderStatus: "CONFIRMED",
      } as any,
    ],
  },
  message: null,
  status: "success",
};

export const mockNestedResponse = {
  success: true,
  data: {
    data: {
      orderIdentifier: mockOrderIdentifier,
      orderDetails: [
        {
          orderIdentifier: mockOrderIdentifier,
          orderVersion: mockOrderVersion,
          orderName: "Test Order",
          orderStatus: "CONFIRMED",
        } as any,
      ],
    },
  },
  message: "Success",
  status: "success",
};

export const mockOrderDetailsService = {
  fetchOrderDetailsByVersion: jest.fn(),
};
