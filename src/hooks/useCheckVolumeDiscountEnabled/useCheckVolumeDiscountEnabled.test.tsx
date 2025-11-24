import { renderHook } from "@testing-library/react";
import {
  mockAxios,
  mockAxiosError,
  mockAxiosResponseDisabled,
  mockAxiosResponseEnabled,
  mockCompanyId,
  mockCompanyIdString,
} from "./useCheckVolumeDiscountEnabled.mocks";

// Mock axios
jest.mock("axios", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  __esModule: true,
  useQuery: jest.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import useCheckVolumeDiscountEnabled from "./useCheckVolumeDiscountEnabled";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe("useCheckVolumeDiscountEnabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return volume discount enabled when API returns true", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(true);
    expect(result.current.VolumeDiscountAvailable).toBe(true);
    expect(result.current.VDapplied).toBe(false);
    expect(result.current.vdLoading).toBe(false);
  });

  it("should return volume discount disabled when API returns false", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseDisabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
    expect(result.current.VDapplied).toBe(false);
    expect(result.current.vdLoading).toBe(false);
  });

  it("should handle string companyId", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyIdString)
    );

    expect(result.current.ShowVDButton).toBe(true);
    expect(result.current.VolumeDiscountAvailable).toBe(true);
  });

  it("should not fetch when companyId is undefined", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(undefined)
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
    expect(result.current.vdLoading).toBe(false);
  });

  it("should not fetch when companyId is null", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCheckVolumeDiscountEnabled(null));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should not fetch when cond is false", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId, false)
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should fetch when cond is true and companyId is provided", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId, true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["volumeDiscount", mockCompanyId],
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

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(true);
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should not show loading state when error is present", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: mockAxiosError,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(false);
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should not show loading state when data is available", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(false);
  });

  it("should create correct query key with companyId", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId, true));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["volumeDiscount", mockCompanyId],
      })
    );
  });

  it("should call queryFn with correct axios configuration when enabled", async () => {
    (mockAxios as any).mockResolvedValue(mockAxiosResponseEnabled);
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId));

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

    // Call the queryFn to verify it uses axios correctly
    await queryFn();

    // Verify axios was called with correct config
    expect(mockAxios).toHaveBeenCalledWith({
      url: "/api/sales/checkIsVDEnabledByCompanyId",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { companyId: mockCompanyId },
    });
  });

  it("should handle falsy data values correctly", () => {
    mockUseQuery.mockReturnValue({
      data: {
        data: {
          data: null,
        },
      },
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should handle undefined data correctly", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should always return VDapplied as false", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.VDapplied).toBe(false);
  });

  it("should handle different companyId types", () => {
    const testCases = [
      { companyId: 123, expected: ["volumeDiscount", 123] },
      { companyId: "123", expected: ["volumeDiscount", "123"] },
      { companyId: 456, expected: ["volumeDiscount", 456] },
    ];

    testCases.forEach(({ companyId, expected }) => {
      mockUseQuery.mockReturnValue({
        data: mockAxiosResponseEnabled,
        error: undefined,
        isLoading: false,
        refetch: jest.fn(),
      } as any);

      renderHook(() => useCheckVolumeDiscountEnabled(companyId));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expected,
        })
      );
    });
  });

  it("should use React Query options with refetchOnWindowFocus set to false", () => {
    mockUseQuery.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchOnWindowFocus: false,
      })
    );
  });
});
