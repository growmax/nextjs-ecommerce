// Mock problematic hooks and modules to avoid JSX/React context issues
import {
  mockOrderDetailsResponse,
  mockOrderDetailsService,
  mockQuoteSettings,
  mockTenantData,
  mockUser,
} from "./useFetchOrderDetails.mocks";
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));
jest.mock("@/hooks/useTenantData", () => ({
  useTenantData: () => ({ tenantData: mockTenantData }),
}));
jest.mock("@/hooks/useModuleSettings", () => () => ({
  quoteSettings: mockQuoteSettings,
}));
jest.mock("@/lib/api", () => ({
  OrderDetailsService: {
    fetchOrderDetails: mockOrderDetailsService.fetchOrderDetails,
  },
}));

import { renderHook, waitFor } from "@testing-library/react";
import useFetchOrderDetails from "./useFetchOrderDetails";

describe("useFetchOrderDetails", () => {
  it("fetches and returns order details", async () => {
    const { result } = renderHook(() => useFetchOrderDetails("order-123"));
    await waitFor(() =>
      expect(result.current.fetchOrderResponse).toEqual(
        mockOrderDetailsResponse.data
      )
    );
    expect(result.current.fetchOrderError).toBeUndefined();
    expect(result.current.fetchOrderResponseLoading).toBe(false);
  });
});
