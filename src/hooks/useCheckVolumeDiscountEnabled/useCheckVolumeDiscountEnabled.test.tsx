import { renderHook } from "@testing-library/react";
import {
  mockAxios,
  mockAxiosError,
  mockAxiosResponseDisabled,
  mockAxiosResponseEnabled,
  mockCompanyId,
  mockCompanyIdString,
} from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled.mocks";

// Mock axios
jest.mock("axios", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock SWR
jest.mock("swr/immutable", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled";
import useSWRImmutable from "swr/immutable";

const mockUseSWR = useSWRImmutable as jest.MockedFunction<
  typeof useSWRImmutable
>;

describe("useCheckVolumeDiscountEnabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return volume discount enabled when API returns true", () => {
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
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
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseDisabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
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
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyIdString)
    );

    expect(result.current.ShowVDButton).toBe(true);
    expect(result.current.VolumeDiscountAvailable).toBe(true);
  });

  it("should not fetch when companyId is undefined", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(undefined)
    );

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
    // vdLoading is true when !data && !error (even when key is null)
    expect(result.current.vdLoading).toBe(true);
  });

  it("should not fetch when companyId is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useCheckVolumeDiscountEnabled(null));

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
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
      useCheckVolumeDiscountEnabled(mockCompanyId, false)
    );

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should fetch when cond is true and companyId is provided", () => {
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId, true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ["Check_Is_Volume_Discount_Enabled", mockCompanyId, true],
      expect.any(Function)
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

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(true);
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should not show loading state when error is present", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockAxiosError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(false);
    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should not show loading state when data is available", () => {
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.vdLoading).toBe(false);
  });

  it("should create correct SWR key with companyId and cond", () => {
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId, true));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ["Check_Is_Volume_Discount_Enabled", mockCompanyId, true],
      expect.any(Function)
    );
  });

  it("should call fetcher with correct axios configuration when key is not null", async () => {
    (mockAxios as any).mockResolvedValue(mockAxiosResponseEnabled);
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    renderHook(() => useCheckVolumeDiscountEnabled(mockCompanyId));

    // Get the fetcher function that was passed to useSWR
    const swrCall = mockUseSWR.mock.calls[0];
    if (!swrCall) {
      throw new Error("useSWR was not called");
    }
    const passedFetcher = swrCall[1];
    if (!passedFetcher) {
      throw new Error("Fetcher function was not provided");
    }

    // Call the fetcher to verify it uses axios correctly
    await passedFetcher();

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
    mockUseSWR.mockReturnValue({
      data: {
        data: {
          data: null,
        },
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
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
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.ShowVDButton).toBe(false);
    expect(result.current.VolumeDiscountAvailable).toBe(false);
  });

  it("should always return VDapplied as false", () => {
    mockUseSWR.mockReturnValue({
      data: mockAxiosResponseEnabled,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() =>
      useCheckVolumeDiscountEnabled(mockCompanyId)
    );

    expect(result.current.VDapplied).toBe(false);
  });

  it("should handle different companyId types", () => {
    const testCases = [
      { companyId: 123, expected: 123 },
      { companyId: "123", expected: "123" },
      { companyId: 456, expected: 456 },
    ];

    testCases.forEach(({ companyId, expected }) => {
      mockUseSWR.mockReturnValue({
        data: mockAxiosResponseEnabled,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useCheckVolumeDiscountEnabled(companyId));

      expect(mockUseSWR).toHaveBeenCalledWith(
        ["Check_Is_Volume_Discount_Enabled", expected, true],
        expect.any(Function)
      );
    });
  });
});
