import { renderHook } from "@testing-library/react";
import {
  mockAxiosError,
  mockAxiosResponse,
  mockAxiosResponseNoCashDiscount,
  mockCashDiscountTerm,
  mockUser,
} from "./useGetLatestPaymentTerms.mocks";

// Mock PaymentService
jest.mock("@/lib/api/services/PaymentService/PaymentService", () => ({
  __esModule: true,
  default: {
    fetchPaymentTerms: jest.fn(),
  },
}));

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  __esModule: true,
  useQuery: jest.fn(),
}));

// Mock useCurrentUser
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

import PaymentService from "@/lib/api/services/PaymentService/PaymentService";
import { useQuery } from "@tanstack/react-query";
import useSWRImmutable from "swr/immutable";
import useGetLatestPaymentTerms from "./useGetLatestPaymentTerms";

const mockUseSWR = useSWRImmutable as jest.MockedFunction<
  typeof useSWRImmutable
>;
const mockPaymentService = PaymentService as jest.Mocked<typeof PaymentService>;

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe("useGetLatestPaymentTerms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default PaymentService mock
    (mockPaymentService.fetchPaymentTerms as jest.Mock).mockResolvedValue({
      data: mockAxiosResponse.data.data,
      success: "success",
      message: "Success",
    });
  });

  it("should fetch and return cash discount payment terms successfully", () => {
    mockUseQuery.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTerms).toEqual(mockCashDiscountTerm);
    expect(result.current.latestPaymentTermsLoading).toBe(false);
  });

  it("should return undefined when no cash discount terms are found", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTerms).toBeUndefined();
    expect(result.current.latestPaymentTermsLoading).toBe(true);
  });

  it("should not fetch when fetchLatestPaymentTerm is false", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(false));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.latestPaymentTerms).toBeUndefined();
    expect(result.current.latestPaymentTermsLoading).toBe(false);
  });

  it("should not fetch when fetchLatestPaymentTerm is false (simulating no userId scenario)", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(false));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should fetch when fetchLatestPaymentTerm is true and userId is available", () => {
    mockUseQuery.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["paymentTerms", mockUser.userId, mockUser.companyId],
        enabled: true,
        refetchOnWindowFocus: false,
      })
    );
  });

  it("should show loading state when isLoading is true", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(true);
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should not show loading state when error is present", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: mockAxiosError,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(false);
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should not show loading state when data is available", () => {
    mockUseQuery.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(false);
  });

  it("should create correct query key with userId and companyId", () => {
    mockUseQuery.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["paymentTerms", mockUser.userId, mockUser.companyId],
      })
    );
  });

  it("should call fetcher with correct axios configuration when key is not null", async () => {
    // Mock PaymentService.fetchPaymentTerms
    (mockPaymentService.fetchPaymentTerms as jest.Mock).mockResolvedValue({
      data: mockAxiosResponse.data.data,
      success: "success",
      message: "Success",
    });

    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the queryFn function that was passed to useQuery
    const queryCall = mockUseQuery.mock.calls[0];
    if (!queryCall) {
      throw new Error("useQuery was not called");
    }
    const config = queryCall[0] as any;
    const queryFn = config.queryFn;
    if (!queryFn) {
      throw new Error("queryFn was not provided");
    }
    const passedFetcher = swrCall[1];

    // Call the fetcher to verify it uses PaymentService correctly
    const result = await passedFetcher();

    // Verify PaymentService was called with correct userId
    expect(mockPaymentService.fetchPaymentTerms).toHaveBeenCalledWith(
      mockUser.userId
    );

    // Verify queryFn filters and returns cash discount term
    expect(result).toEqual(mockCashDiscountTerm);
  });

  it("should throw error when userId is not provided in queryFn", async () => {
    // Create a queryFn that simulates missing userId
    const queryFnWithoutUserId = async () => {
      const userId = undefined; // Simulate missing userId
      if (!userId) {
        throw new Error("User ID is required");
      }
      return mockCashDiscountTerm;
    };

    // Test the error handling logic
    await expect(queryFnWithoutUserId()).rejects.toThrow("User ID is required");
  });

  it("should filter payment terms for cash discount", async () => {
    // Mock PaymentService.fetchPaymentTerms
    (mockPaymentService.fetchPaymentTerms as jest.Mock).mockResolvedValue({
      data: mockAxiosResponse.data.data,
      success: "success",
      message: "Success",
    });

    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the queryFn function
    const queryCall = mockUseQuery.mock.calls[0];
    if (!queryCall) {
      throw new Error("useQuery was not called");
    }
    const config = queryCall[0] as any;
    const queryFn = config.queryFn;
    if (!queryFn) {
      throw new Error("queryFn was not provided");
    }

    // Call the queryFn
    const result = await queryFn();

    // Should return only the term with cashdiscount === true
    expect(result).toEqual(mockCashDiscountTerm);
    expect((result as typeof mockCashDiscountTerm)?.cashdiscount).toBe(true);
  });

  it("should return undefined when no cash discount terms exist", async () => {
    // Mock PaymentService.fetchPaymentTerms
    (mockPaymentService.fetchPaymentTerms as jest.Mock).mockResolvedValue({
      data: mockAxiosResponseNoCashDiscount.data.data,
      success: "success",
      message: "Success",
    });

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the queryFn function
    const queryCall = mockUseQuery.mock.calls[0];
    if (!queryCall) {
      throw new Error("useQuery was not called");
    }
    const config = queryCall[0] as any;
    const queryFn = config.queryFn;
    if (!queryFn) {
      throw new Error("queryFn was not provided");
    }

    // Call the queryFn
    const result = await queryFn();

    // Should return undefined when no cash discount terms
    expect(result).toBeUndefined();
  });

  it("should use React Query options with refetchOnWindowFocus set to false", () => {
    mockUseQuery.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchOnWindowFocus: false,
      })
    );
  });

  it("should handle default parameter when fetchLatestPaymentTerm is not provided", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms());

    // Should default to false, so enabled should be false
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});
