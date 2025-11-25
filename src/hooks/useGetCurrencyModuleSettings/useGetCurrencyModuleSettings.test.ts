import CartServices from "@/lib/api/CartServices";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings";
import {
  mockBuyerCurrency,
  mockCurrencyModuleResponse,
  mockEmptyCurrencyModuleResponse,
  mockUser,
} from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings.mocks";

// Mock CartServices
jest.mock("@/lib/api/CartServices", () => ({
  __esModule: true,
  default: {
    getCurrencyModuleSettings: jest.fn(),
  },
}));

const mockGetCurrencyModuleSettings =
  CartServices.getCurrencyModuleSettings as jest.MockedFunction<
    typeof CartServices.getCurrencyModuleSettings
  >;

describe("useGetCurrencyModuleSettings", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("should return minimum order and quote values for USD currency", async () => {
    mockGetCurrencyModuleSettings.mockResolvedValue(mockCurrencyModuleResponse);

    const { result } = renderHook(
      () => useGetCurrencyModuleSettings(mockUser, true, mockBuyerCurrency),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.minimumOrderValue).toBe("100");
      expect(result.current.minimumQuoteValue).toBe("50");
    });

    expect(mockGetCurrencyModuleSettings).toHaveBeenCalledWith({
      userId: "user-123",
      companyId: "company-456",
    });
  });

  it("should return undefined when no currency data is available", async () => {
    mockGetCurrencyModuleSettings.mockResolvedValue(
      mockEmptyCurrencyModuleResponse
    );

    const { result } = renderHook(
      () => useGetCurrencyModuleSettings(mockUser, true, mockBuyerCurrency),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.minimumOrderValue).toBeUndefined();
      expect(result.current.minimumQuoteValue).toBeUndefined();
    });
  });

  it("should not fetch when condition is false", () => {
    const { result } = renderHook(
      () => useGetCurrencyModuleSettings(mockUser, false, mockBuyerCurrency),
      { wrapper }
    );

    expect(result.current.minimumOrderValue).toBeUndefined();
    expect(result.current.minimumQuoteValue).toBeUndefined();
    expect(mockGetCurrencyModuleSettings).not.toHaveBeenCalled();
  });

  it("should not fetch when userId or companyId is missing", () => {
    const incompleteUser = { userId: undefined, companyId: undefined } as any;

    renderHook(
      () =>
        useGetCurrencyModuleSettings(
          incompleteUser as any,
          true,
          mockBuyerCurrency
        ),
      { wrapper }
    );

    expect(mockGetCurrencyModuleSettings).not.toHaveBeenCalled();
  });

  it("should use buyerCurrency code when available", async () => {
    const customBuyerCurrency = { currencyCode: "EUR" };
    mockGetCurrencyModuleSettings.mockResolvedValue(mockCurrencyModuleResponse);

    const { result } = renderHook(
      () => useGetCurrencyModuleSettings(mockUser, true, customBuyerCurrency),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.minimumOrderValue).toBe("90");
      expect(result.current.minimumQuoteValue).toBe("45");
    });
  });

  it("should fallback to user currency when buyerCurrency is not provided", async () => {
    const emptyBuyerCurrency = { currencyCode: undefined } as any;
    mockGetCurrencyModuleSettings.mockResolvedValue(mockCurrencyModuleResponse);

    const { result } = renderHook(
      () =>
        useGetCurrencyModuleSettings(mockUser, true, emptyBuyerCurrency as any),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.minimumOrderValue).toBe("100");
      expect(result.current.minimumQuoteValue).toBe("50");
    });
  });
});
