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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import useFetchOrderDetails from "./useFetchOrderDetails";

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

describe("useFetchOrderDetails", () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
    mockOrderDetailsService.fetchOrderDetails.mockResolvedValue(
      mockOrderDetailsResponse
    );
  });

  it("fetches and returns order details", async () => {
    const { result } = renderHook(() => useFetchOrderDetails("order-123"), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete - check that loading becomes false
    await waitFor(
      () => {
        expect(result.current.fetchOrderResponseLoading).toBe(false);
      },
      { timeout: 10000 }
    );

    // The hook processes the response and returns data.data
    // Since initialDataValuvation returns the data as-is, we expect the processed data
    expect(result.current.fetchOrderResponse).toEqual(
      mockOrderDetailsResponse.data
    );
    expect(result.current.fetchOrderError).toBeNull();
    expect(result.current.fetchOrderResponseLoading).toBe(false);
  }, 10000);
});
