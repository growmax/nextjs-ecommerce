import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React, { ReactNode } from "react";
import useFetchOrderDetails from "./useFetchOrderDetails";
// Mock useCurrentUser to return null user before importing the hook
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: null }),
}));
jest.mock("@/hooks/useTenantData", () => ({
  useTenantData: () => ({ tenantData: { tenant: { tenantCode: "tenant-1" } } }),
}));
jest.mock("@/hooks/useModuleSettings", () => () => ({ quoteSettings: {} }));
jest.mock("@/lib/api", () => ({
  OrderDetailsService: { fetchOrderDetails: jest.fn() },
}));

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

describe("useFetchOrderDetails (missing user)", () => {
  it("returns loading state if required params are missing", () => {
    const { result } = renderHook(() => useFetchOrderDetails("order-123"), {
      wrapper: createWrapper(),
    });
    // When query is disabled (missing required params), isLoading is false
    // because React Query doesn't run the query when enabled is false
    expect(result.current.fetchOrderResponseLoading).toBe(false);
    expect(result.current.fetchOrderResponse).toBeUndefined();
  });
});
