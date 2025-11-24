import { useUserDetails } from "@/contexts/UserDetailsContext";
import { redirectTo } from "@/lib/utils/navigation"; // Import the utility to mock it
import { act, renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import useLogout from "./useLogout";

// Mock the hooks and utility
jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/lib/utils/navigation"); // Mock the redirectTo utility

// Type assertion for the mocked hooks and utility
const useUserDetailsMock = useUserDetails as jest.MockedFunction<
  typeof useUserDetails
>;
const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;
const redirectToMock = redirectTo as jest.MockedFunction<typeof redirectTo>; // Mocked redirectTo

describe("useLogout", () => {
  const mockLogout = jest.fn();
  const mockPush = jest.fn(); // Mock useRouter().push

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    redirectToMock.mockClear(); // Clear mock calls for redirectTo

    useUserDetailsMock.mockReturnValue({
      logout: mockLogout,
    } as any);
    useRouterMock.mockReturnValue({
      push: mockPush,

      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
    } as any);
  });

  it("should redirect to '/' after successful logout", async () => {
    // Arrange
    mockLogout.mockResolvedValueOnce(undefined); // Simulate successful logout

    const { result } = renderHook(() => useLogout());

    // Act
    await act(async () => {
      await result.current.handleLogout();
    });

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(redirectToMock).toHaveBeenCalledTimes(1);
    expect(redirectToMock).toHaveBeenCalledWith("/");
    expect(result.current.isLoggingOut).toBe(false);
  });

  it("should handle logout error gracefully and not redirect", async () => {
    // Arrange
    const errorMessage = "Logout failed on server";
    mockLogout.mockRejectedValueOnce(new Error(errorMessage)); // Simulate failed logout

    // Suppress console.error for this test since we're intentionally testing error handling
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useLogout());

    // Act
    await act(async () => {
      await result.current.handleLogout();
    });

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(redirectToMock).not.toHaveBeenCalled(); // Should not redirect on error
    expect(result.current.isLoggingOut).toBe(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("should prevent double-clicking by returning early if already logging out", async () => {
    // Arrange
    mockLogout.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLogout());

    // Act
    act(() => {
      result.current.handleLogout(); // First call
    });

    // At this point, isLoggingOut should be true
    expect(result.current.isLoggingOut).toBe(true);

    // Now, make the second call while isLoggingOut is true
    act(() => {
      result.current.handleLogout(); // Second call
    });

    // Wait for the first call's async part to complete
    await act(async () => {
      await Promise.resolve(); // Allow promises to resolve
    });

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1); // Only called once
    expect(redirectToMock).toHaveBeenCalledTimes(1);
    expect(result.current.isLoggingOut).toBe(false);
  });

  it("should set isLoggingOut to true during logout and then back to false", async () => {
    // Arrange
    mockLogout.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLogout());

    // Act & Assert
    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleLogout();
    });

    expect(result.current.isLoggingOut).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoggingOut).toBe(false);
  });
});
