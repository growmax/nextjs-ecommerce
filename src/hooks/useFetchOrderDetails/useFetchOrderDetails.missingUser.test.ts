import { renderHook } from "@testing-library/react";
import useFetchOrderDetails from "@/hooks/useFetchOrderDetails/useFetchOrderDetails";
// Mock useCurrentUser to return null user before importing the hook
jest.mock("@/hooks/useCurrentUser/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: null }),
}));
jest.mock("@/hooks/useTenantData/useTenantData", () => ({
  useTenantData: () => ({ tenantData: { tenant: { tenantCode: "tenant-1" } } }),
}));
jest.mock("@/hooks/useModuleSettings/useModuleSettings", () => () => ({
  quoteSettings: {},
}));
jest.mock("@/lib/api", () => ({
  OrderDetailsService: { fetchOrderDetails: jest.fn() },
}));

describe("useFetchOrderDetails (missing user)", () => {
  it("returns loading state if required params are missing", () => {
    const { result } = renderHook(() => useFetchOrderDetails("order-123"));
    expect(result.current.fetchOrderResponseLoading).toBe(true);
    expect(result.current.fetchOrderResponse).toBeUndefined();
  });
});
