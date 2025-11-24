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

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  __esModule: true,
  useQuery: jest.fn(),
}));

// Mock ManufacturerCompetitorService
jest.mock("@/lib/api", () => ({
  ManufacturerCompetitorService: mockManufacturerCompetitorService,
}));

import { useQuery } from "@tanstack/react-query";
import useGetManufacturerCompetitors from "./useGetManufacturerCompetitors";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe("useGetManufacturerCompetitors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManufacturerCompetitorService.fetchCompetitors.mockResolvedValue(
      mockFetchCompetitorsResponse
    );
  });

  it("should fetch and return competitors successfully", () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual(mockCompetitorDetails);
    expect(result.current.competitorsLoading).toBe(false);
    expect(result.current.competitorsError).toBeUndefined();
  });

  it("should return empty array when no competitors are found", () => {
    mockUseQuery.mockReturnValue({
      data: mockEmptyResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
    expect(result.current.competitorsError).toBeUndefined();
  });

  it("should handle string sellerCompanyId", () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyIdString)
    );

    expect(result.current.competitors).toEqual(mockCompetitorDetails);
  });

  it("should not fetch when sellerCompanyId is undefined", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(undefined)
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should not fetch when cond is false", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId, false)
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should fetch when cond is true and sellerCompanyId is provided", () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId, true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["competitors", mockSellerCompanyId],
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitorsLoading).toBe(true);
    expect(result.current.competitors).toEqual([]);
  });

  it("should handle error state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitorsError).toBe(mockError);
    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should create correct query key with sellerCompanyId", () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId, true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["competitors", mockSellerCompanyId],
      })
    );
  });

  it("should call queryFn with correct service method when sellerCompanyId is provided", async () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId));

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

    // Call the queryFn to verify it uses the service correctly
    await queryFn();

    expect(
      mockManufacturerCompetitorService.fetchCompetitors
    ).toHaveBeenCalledWith(mockSellerCompanyId);
  });

  it("should return empty array from queryFn when sellerCompanyId is not provided", async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(undefined));

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

    // Call the queryFn
    const result = await queryFn();

    expect(result).toEqual({ data: { competitorDetails: [] } });
    expect(
      mockManufacturerCompetitorService.fetchCompetitors
    ).not.toHaveBeenCalled();
  });

  it("should handle undefined data correctly", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
    expect(result.current.competitorsLoading).toBe(false);
  });

  it("should handle data without competitorDetails", () => {
    mockUseQuery.mockReturnValue({
      data: { data: {} },
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useGetManufacturerCompetitors(mockSellerCompanyId)
    );

    expect(result.current.competitors).toEqual([]);
  });

  it("should handle different sellerCompanyId types", () => {
    const testCases = [
      { sellerCompanyId: 123, expected: ["competitors", 123] },
      { sellerCompanyId: "123", expected: ["competitors", "123"] },
      { sellerCompanyId: 456, expected: ["competitors", 456] },
    ];

    testCases.forEach(({ sellerCompanyId, expected }) => {
      mockUseQuery.mockReturnValue({
        data: mockFetchCompetitorsResponse,
        error: undefined,
        isLoading: false,
        refetch: jest.fn(),
      } as any);

      renderHook(() => useGetManufacturerCompetitors(sellerCompanyId, true));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expected,
        })
      );
    });
  });

  it("should use React Query options with refetchOnWindowFocus and refetchOnReconnect set to false", () => {
    mockUseQuery.mockReturnValue({
      data: mockFetchCompetitorsResponse,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useGetManufacturerCompetitors(mockSellerCompanyId));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      })
    );
  });
});
