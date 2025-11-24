// Mocks for useFetchOrderDetails
// These mocks are for testing the hook in isolation.

export const mockUser = {
  userId: "user-1",
  companyId: "company-1",
};

export const mockTenantData = {
  tenant: { tenantCode: "tenant-1" },
};

export const mockQuoteSettings = {};

export const mockOrderDetailsResponse = {
  status: "success",
  data: {
    orderDetails: [
      {
        id: "order-123",
        status: "CONFIRMED",
        items: [{ id: "item-1", name: "Product 1", quantity: 2 }],
      },
    ],
  },
};

export const mockOrderDetailsService = {
  fetchOrderDetails: jest.fn().mockResolvedValue(mockOrderDetailsResponse),
};
