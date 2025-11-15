import { renderHook } from "@testing-library/react";
import {
  mockCompetitorDetails,
  mockEmptyResponse,
  mockError,
  mockFetchCompetitorsResponse,
  mockManufacturerCompetitorService,
  mockSellerCompanyId,
  mockSellerCompanyIdString,
} from "./useGetManufacturerCompetitors.mocks";

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock ManufacturerCompetitorService
jest.mock("@/lib/api", () => ({
  ManufacturerCompetitorService: mockManufacturerCompetitorService,
}));

import useGetManufacturerCompetitors from "./useGetManufacturerCompetitors";
import useSWR from "swr";

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe("useGetManufacturerCompetitors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManufacturerCompetitorService.fetchCompetitors.mockResolvedValue(
      mockFetchCompetitorsResponse
    );
  });

  it("should fetch and return competitors successfully", () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual(mockCompetitorDetails);
    expect(result.current.competitorsLoading).toBe(false);
    expect(result.current.competitorsError).toBeUndefined();
  });

  it("should return empty array when no competitors are found", () => {
    mockUseSWR.mockReturnValue({
      data: mockEmptyResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
    expect(result.current.competitorsError).toBeUndefined();
  });

  it("should handle string sellerCompanyId", () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyIdString)
    );

    expect(result.current.competitors).toEqual(mockCompetitorDetails);
  });

  it("should not fetch when sellerCompanyId is undefined", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(undefined)
    );

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should not fetch when cond is false", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId, false)
    );

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should fetch when cond is true and sellerCompanyId is provided", () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId, true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      `get-Competitor-${mockSellerCompanyId}`,
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    );
  });

  it("should show loading state when isLoading is true", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitorsLoading).toBe(true);
    expect(result.current.competitors).toEqual([]);
  });

  it("should handle error state", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitorsError).toBe(mockError);
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should create correct SWR key with sellerCompanyId", () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId, true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      `get-Competitor-${mockSellerCompanyId}`,
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    );
  });

  it("should call fetcher with correct service method when sellerCompanyId is provided", async () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId));

    // Get the fetcher function that was passed to useSWR
    const swrCall = mockUseSWR.mock.calls[0];
    if (!swrCall) {
      throw new Error("useSWR was not called");
    }
    const passedFetcher = swrCall[1];
    if (!passedFetcher) {
      throw new Error("Fetcher function was not provided");
    }

    // Call the fetcher to verify it uses the service correctly
    await passedFetcher();

    expect(
      mockManufacturerCompetitorService.fetchCompetitors
    ).toHaveBeenCalledWith(mockSellerCompanyId);
  });

  it("should return empty array from fetcher when sellerCompanyId is not provided", async () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(undefined));

    // Get the fetcher function that was passed to useSWR
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

    expect(result).toEqual({ data: { competitorDetails: [] } });
    expect(
      mockManufacturerCompetitorService.fetchCompetitors
    ).not.toHaveBeenCalled();
  });

  it("should handle undefined data correctly", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should handle data without competitorDetails", () => {
    mockUseSWR.mockReturnValue({
      data: { data: {} },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
  });

  it("should handle different sellerCompanyId types", () => {
    const testCases = [
      { sellerCompanyId: 123, expected: "get-Competitor-123" },
      { sellerCompanyId: "123", expected: "get-Competitor-123" },
      { sellerCompanyId: 456, expected: "get-Competitor-456" },
    ];

    testCases.forEach(({ sellerCompanyId, expected }) => {
      mockUseSWR.mockReturnValue({
        data: mockFetchCompetitorsResponse,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useGetManufacturerCompetitors(sellerCompanyId, true));

      expect(mockUseSWR).toHaveBeenCalledWith(expected, expect.any(Function), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      });
    });
  });

  it("should use SWR options with revalidateOnFocus and revalidateOnReconnect set to false", () => {
    mockUseSWR.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId));

    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    );
  });
});
