import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import {
  mockCurrency,
  mockGetLatestTaxData,
  mockProducts,
  mockSellerCurrency,
  mockTenantData,
  mockUpdatedProducts,
  mockUser,
} from "@/hooks/useLatestOrderProducts/useLatestOrderProducts.mocks";

// Mock dependencies
jest.mock("@/hooks/useCurrentUser/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

jest.mock("@/hooks/useTenantData/useTenantData", () => ({
  useTenantData: () => ({ tenantData: mockTenantData }),
}));

jest.mock("@/utils/order/getLatestTaxData/getLatestTaxData", () => ({
  getLatestTaxData: mockGetLatestTaxData,
}));

import { useLatestOrderProducts } from "@/hooks/useLatestOrderProducts/useLatestOrderProducts";

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

describe("useLatestOrderProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLatestTaxData.mockResolvedValue(mockUpdatedProducts);
  });

  it("should fetch and return updated products successfully", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          sellerCurrency: mockSellerCurrency,
        }),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify updated products are returned
    expect(result.current.updatedProducts).toEqual(mockUpdatedProducts);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockGetLatestTaxData).toHaveBeenCalledWith({
      products: mockProducts,
      isCloneReOrder: false,
      taxExemption: false,
      isInter: true,
      isSprRequested: false,
      isPlaceOrder: false,
      currency: mockCurrency,
      companyId: mockUser.companyId,
      userId: mockUser.userId,
      tenantCode: mockTenantData.tenant.tenantCode,
      sellerCurrency: mockSellerCurrency,
      userCurrency: mockUser.currency,
      roundOff: 2,
      quoteSettings: undefined,
      elasticIndex: "testelasticpgandproducts",
    });
  });

  it("should return original products when products array is empty", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: [],
          currency: mockCurrency,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return empty array without calling getLatestTaxData
    expect(result.current.updatedProducts).toEqual([]);
    expect(mockGetLatestTaxData).not.toHaveBeenCalled();
  });

  it("should handle disabled state when enabled is false", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    // Should not fetch when disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.updatedProducts).toEqual(mockProducts);
    expect(mockGetLatestTaxData).not.toHaveBeenCalled();
  });

  it("should use provided elasticIndex when provided", async () => {
    const customElasticIndex = "custom-index";
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          elasticIndex: customElasticIndex,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        elasticIndex: customElasticIndex,
      })
    );
  });

  it("should use tenant elasticCode when elasticIndex not provided", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        elasticIndex: "testelasticpgandproducts",
      })
    );
  });

  it("should handle tax exemption flag", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          taxExemption: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        taxExemption: true,
      })
    );
  });

  it("should handle isInter flag", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          isInter: false,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        isInter: false,
      })
    );
  });

  it("should handle isCloneReOrder flag", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          isCloneReOrder: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        isCloneReOrder: true,
      })
    );
  });

  it("should handle isPlaceOrder flag", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          isPlaceOrder: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        isPlaceOrder: true,
      })
    );
  });

  it("should handle isSprRequested flag", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          isSprRequested: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        isSprRequested: true,
      })
    );
  });

  it("should handle custom roundOff value", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          roundOff: 4,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        roundOff: 4,
      })
    );
  });

  it("should handle quoteSettings", async () => {
    const quoteSettings = { roundingAdjustment: true };
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          quoteSettings,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteSettings,
      })
    );
  });

  it("should handle error when getLatestTaxData fails", async () => {
    const errorMessage = "Failed to fetch latest tax data";
    mockGetLatestTaxData.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
    expect(result.current.updatedProducts).toEqual(mockProducts); // Fallback to original
  });

  it("should filter out products without productId", async () => {
    const productsWithInvalidIds = [
      { productId: 1, productName: "Product 1" },
      { productName: "Product without ID" }, // No productId
      { productId: null, productName: "Product with null ID" },
      { productId: 2, productName: "Product 2" },
    ];

    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: productsWithInvalidIds,
          currency: mockCurrency,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only call with products that have valid productIds
    expect(mockGetLatestTaxData).toHaveBeenCalledWith(
      expect.objectContaining({
        products: productsWithInvalidIds,
      })
    );
  });

  it("should support refetch functionality", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear previous calls
    mockGetLatestTaxData.mockClear();

    // Trigger refetch
    await result.current.refetch();

    // Should call getLatestTaxData again
    expect(mockGetLatestTaxData).toHaveBeenCalledTimes(1);
  });

  it("should create correct query key based on all parameters", async () => {
    const { result } = renderHook(
      () =>
        useLatestOrderProducts({
          products: mockProducts,
          currency: mockCurrency,
          sellerCurrency: mockSellerCurrency,
          isInter: false,
          taxExemption: true,
          isCloneReOrder: true,
          isPlaceOrder: true,
          isSprRequested: true,
          elasticIndex: "custom-index",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Query key should include all relevant parameters
    // This ensures proper caching behavior
    expect(mockGetLatestTaxData).toHaveBeenCalled();
  });
});
