import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  mockShippingAddresses,
  mockStoredAddress,
  mockUseShipping,
  mockUseUserDetails,
  mockUserData,
} from "./useCurrentShippingAddress.mocks";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock useShipping
jest.mock("../useShipping", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useUser (default export)
jest.mock("../useUser", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    companydata: { userId: 123, companyId: 456 },
  })),
}));

// Mock useUserDetails
jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: jest.fn(),
}));

import { useUserDetails } from "@/contexts/UserDetailsContext";
import useShipping from "../useShipping";
import useCurrentShippingAddress from "./useCurrentShippingAddress";

const mockUseShippingHook = useShipping as jest.MockedFunction<
  typeof useShipping
>;
const mockUseUserDetailsHook = useUserDetails as jest.MockedFunction<
  typeof useUserDetails
>;

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
};

describe("useCurrentShippingAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockUseShippingHook.mockReturnValue(mockUseShipping);
    mockUseUserDetailsHook.mockReturnValue(mockUseUserDetails);
  });

  it("should initialize with first address from API when no localStorage data", async () => {
    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
    expect(localStorage.getItem("SelectedShippingAddressData")).toBe(
      JSON.stringify(mockShippingAddresses[0])
    );
  });

  it("should initialize with stored address from localStorage when available", async () => {
    localStorageMock.setItem(
      "SelectedShippingAddressData",
      JSON.stringify(mockStoredAddress)
    );

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    expect(result.current.SelectedShippingAddressData).toEqual(
      mockStoredAddress
    );
  });

  it("should clear data when user is not authenticated", async () => {
    localStorageMock.setItem(
      "SelectedShippingAddressData",
      JSON.stringify(mockStoredAddress)
    );

    mockUseUserDetailsHook.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(() => false),
    });

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toEqual({});
    });

    expect(localStorage.getItem("SelectedShippingAddressData")).toBeNull();
  });

  it("should return empty object when no addresses available", async () => {
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: [],
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    expect(result.current.SelectedShippingAddressData).toEqual({});
  });

  it("should wait for loading to complete before initializing", async () => {
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: [],
      ShippingAddressDataLoading: true,
      ShippingAddressDataError: null,
    });

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    // Should still be empty while loading
    expect(result.current.SelectedShippingAddressData).toEqual({});

    // Simulate loading complete
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: mockShippingAddresses,
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });
  });

  it("should ignore invalid localStorage data", async () => {
    localStorageMock.setItem("SelectedShippingAddressData", "invalid-json");

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should fall back to first address from API
    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should ignore localStorage data without id", async () => {
    const invalidAddress = { addressLine: "No ID" };
    localStorageMock.setItem(
      "SelectedShippingAddressData",
      JSON.stringify(invalidAddress)
    );

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should fall back to first address from API
    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should ignore localStorage data that is 'undefined' string", async () => {
    localStorageMock.setItem("SelectedShippingAddressData", "undefined");

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should fall back to first address from API
    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should ignore localStorage data that is 'null' string", async () => {
    localStorageMock.setItem("SelectedShippingAddressData", "null");

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should fall back to first address from API
    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should update address using mutate function", async () => {
    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    const newAddress = {
      id: "addr-new",
      addressLine: "999 New St",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
    };

    act(() => {
      result.current.SelectedShippingAddressDatamutate(newAddress);
    });

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toEqual(newAddress);
    });

    expect(localStorage.getItem("SelectedShippingAddressData")).toBe(
      JSON.stringify(newAddress)
    );
  });

  it("should only initialize once per authentication session", async () => {
    const { result, rerender } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    const initialAddress = result.current.SelectedShippingAddressData;

    // Change shipping address data
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: [
        {
          id: "addr-changed",
          addressLine: "Changed Address",
        },
      ],
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    rerender();

    // Should still have initial address (not re-initialized)
    expect(result.current.SelectedShippingAddressData).toEqual(initialAddress);
  });

  it("should handle null userData", async () => {
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: mockShippingAddresses,
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    const { result } = renderHook(() => useCurrentShippingAddress(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should handle undefined userData", async () => {
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: mockShippingAddresses,
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    const { result } = renderHook(
      () => useCurrentShippingAddress(undefined as any),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should reset initialization when authentication changes", async () => {
    // Start authenticated
    const { result, rerender } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Become unauthenticated
    mockUseUserDetailsHook.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(() => false),
    });
    rerender();

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toEqual({});
    });

    // Become authenticated again
    mockUseUserDetailsHook.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(() => true),
    });
    rerender();

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should re-initialize
    expect(result.current.SelectedShippingAddressData).toEqual(
      mockShippingAddresses[0]
    );
  });

  it("should return empty object as fallback when currentData is falsy", async () => {
    mockUseShippingHook.mockReturnValue({
      ShippingAddressData: [],
      ShippingAddressDataLoading: false,
      ShippingAddressDataError: null,
    });

    const { result } = renderHook(() =>
      useCurrentShippingAddress(mockUserData),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.SelectedShippingAddressData).toBeDefined();
    });

    // Should return empty object, not undefined
    expect(result.current.SelectedShippingAddressData).toEqual({});
  });
});
