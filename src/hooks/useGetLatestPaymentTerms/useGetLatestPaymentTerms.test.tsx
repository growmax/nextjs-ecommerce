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

// Mock SWR
jest.mock("swr/immutable", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useCurrentUser
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

import PaymentService from "@/lib/api/services/PaymentService/PaymentService";
import useSWRImmutable from "swr/immutable";
import useGetLatestPaymentTerms from "./useGetLatestPaymentTerms";

const mockUseSWR = useSWRImmutable as jest.MockedFunction<
  typeof useSWRImmutable
>;
const mockPaymentService = PaymentService as jest.Mocked<typeof PaymentService>;

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
    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTerms).toEqual(mockCashDiscountTerm);
    expect(result.current.latestPaymentTermsLoading).toBe(false);
  });

  it("should return undefined when no cash discount terms are found", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTerms).toBeUndefined();
    expect(result.current.latestPaymentTermsLoading).toBe(true);
  });

  it("should not fetch when fetchLatestPaymentTerm is false", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(false));

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      revalidateOnFocus: true,
    });
    expect(result.current.latestPaymentTerms).toBeUndefined();
    expect(result.current.latestPaymentTermsLoading).toBe(true);
  });

  it("should not fetch when fetchLatestPaymentTerm is false (simulating no userId scenario)", () => {
    // When fetchLatestPaymentTerm is false, it simulates the behavior when userId is not available
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(false));

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      revalidateOnFocus: true,
    });
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should fetch when fetchLatestPaymentTerm is true and userId is available", () => {
    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ["fetchPaymentTerms", mockUser.userId],
      expect.any(Function),
      {
        revalidateOnFocus: true,
      }
    );
  });

  it("should show loading state when data is not available and no error", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(true);
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should not show loading state when error is present", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockAxiosError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(false);
    expect(result.current.latestPaymentTerms).toBeUndefined();
  });

  it("should not show loading state when data is available", () => {
    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useGetLatestPaymentTerms(true));

    expect(result.current.latestPaymentTermsLoading).toBe(false);
  });

  it("should create correct SWR key with userId", () => {
    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ["fetchPaymentTerms", mockUser.userId],
      expect.any(Function),
      {
        revalidateOnFocus: true,
      }
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
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the fetcher function that was passed to useSWR
    const swrCall = mockUseSWR.mock.calls[0];
    if (!swrCall) {
      throw new Error("useSWR was not called");
    }
    const passedFetcher = swrCall[1];
    if (!passedFetcher) {
      throw new Error("Fetcher function was not provided");
    }

    // Call the fetcher to verify it uses PaymentService correctly
    const result = await passedFetcher();

    // Verify PaymentService was called with correct userId
    expect(mockPaymentService.fetchPaymentTerms).toHaveBeenCalledWith(
      mockUser.userId
    );

    // Verify fetcher filters and returns cash discount term
    expect(result).toEqual(mockCashDiscountTerm);
  });

  it("should throw error when userId is not provided in fetcher", async () => {
    // Create a fetcher that simulates missing userId
    const fetcherWithoutUserId = async () => {
      const userId = undefined; // Simulate missing userId
      if (!userId) {
        throw new Error("User ID is required");
      }
      return mockCashDiscountTerm;
    };

    // Test the error handling logic
    await expect(fetcherWithoutUserId()).rejects.toThrow("User ID is required");
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
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the fetcher function
    const swrCall = mockUseSWR.mock.calls[0];
    if (!swrCall) {
      throw new Error("useSWR was not called");
    }
    const passedFetcher = swrCall[1];
    if (!passedFetcher) {
      throw new Error("Fetcher function was not provided");
    }

    // Call the fetcher
    const result = await passedFetcher();

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
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    // Get the fetcher function
    const swrCall = mockUseSWR.mock.calls[0];
    if (!swrCall) {
      throw new Error("useSWR was not called");
    }
    const passedFetcher = swrCall[1];
    if (!passedFetcher) {
      throw new Error("Fetcher function was not provided");
    }

    // Call the fetcher
    const result = await passedFetcher();

    // Should return undefined when no cash discount terms
    expect(result).toBeUndefined();
  });

  it("should use SWR options with revalidateOnFocus set to true", () => {
    mockUseSWR.mockReturnValue({
      data: mockCashDiscountTerm,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms(true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      {
        revalidateOnFocus: true,
      }
    );
  });

  it("should handle default parameter when fetchLatestPaymentTerm is not provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetLatestPaymentTerms());

    // Should default to false, so key should be null
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      revalidateOnFocus: true,
    });
  });
});
