import { SidebarProvider } from "@/components/ui/sidebar";
import { useCart } from "@/contexts/CartContext";
import * as UserDetailsContext from "@/contexts/UserDetailsContext";
import useLogout from "@/hooks/Auth/useLogout";
import useUserProfile from "@/hooks/Profile/useUserProfile";
import useSearch from "@/hooks/useSearch";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { AppHeader } from "./app-header";

// Mock the hooks and child components
jest.mock("@/hooks/Profile/useUserProfile");
jest.mock("@/hooks/Auth/useLogout");
jest.mock("@/contexts/CartContext");
jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));
jest.mock("@/hooks/useSearch");
jest.mock("@/components/AvatarCard/AvatarCard", () => ({
  AvatarCard: jest.fn(() => <div data-testid="avatar-card" />),
}));

// Type assertion for the mocked hooks
const useUserProfileMock = useUserProfile as jest.MockedFunction<typeof useUserProfile>;
const useLogoutMock = useLogout as jest.MockedFunction<typeof useLogout>;
const useCartMock = useCart as jest.MockedFunction<typeof useCart>;
const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;
const useSearchMock = useSearch as jest.MockedFunction<typeof useSearch>;
const useUserDetailsMock = UserDetailsContext.useUserDetails as jest.MockedFunction<typeof UserDetailsContext.useUserDetails>;

describe("AppHeader", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfileMock.mockReturnValue({ 
      userProfile: null,
      fetchUserProfile: jest.fn(),
    });
    useLogoutMock.mockReturnValue({
      isLoggingOut: false,
      handleLogout: jest.fn(),
    });
    useCartMock.mockReturnValue({
      cart: [],
      cartCount: 0,
      isLoading: false,
      cartComment: "",
      cartAttachments: [],
      handleCartComment: jest.fn(),
      handleUploadCartAttachments: jest.fn(),
      getCart: jest.fn(),
      refreshCart: jest.fn(),
      setCart: jest.fn(),
      updateCartCount: jest.fn(),
      syncGuestCart: jest.fn(),
      clearGuestCart: jest.fn(),
    } as any);
    useRouterMock.mockReturnValue({
      push: mockPush,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
    } as any);
    useSearchMock.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });
    // Default mock: user not authenticated
    useUserDetailsMock.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("when user is not authenticated", () => {
    it("should render the Login button and not the avatar", () => {
      // Mock is already set to not authenticated in beforeEach
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      const loginButtons = screen.getAllByRole("button", { name: /login/i });
      expect(loginButtons.length).toBeGreaterThan(0);

      const avatarCard = screen.queryByTestId("avatar-card");
      expect(avatarCard).not.toBeInTheDocument();
    });

    it("should navigate to /login when Login button is clicked", () => {
      // Mock is already set to not authenticated in beforeEach
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      const loginButtons = screen.getAllByRole("button", { name: /login/i });
      fireEvent.click(loginButtons[0]!);

      expect(mockPush).toHaveBeenCalledWith("/en/login");
    });
  });

  describe("when user is authenticated", () => {
    const mockUser = {
      userId: 1,
      userCode: "USER001",
      email: "john@example.com",
      displayName: "John Doe",
      picture: "https://example.com/avatar.png",
      companyId: 1,
      companyName: "Test Company",
      companyLogo: "https://example.com/logo.png",
      currency: {
        currencyCode: "USD",
        symbol: "$",
        precision: 2,
        decimal: ".",
        thousand: ",",
      },
      roleId: 1,
      roleName: "Admin",
      role: "Admin",
      accountRole: "Admin",
      tenantId: "tenant1",
      timeZone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "HH:mm:ss",
      isUserActive: 1,
      verified: true,
      seller: false,
      lastLoginAt: "2025-01-01T00:00:00Z",
      listAccessElements: [],
    };

    it("should render the Avatar card and not the Login button", () => {
      useUserDetailsMock.mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuth: jest.fn(),
      });
      useUserProfileMock.mockReturnValue({ 
        userProfile: mockUser as any,
        fetchUserProfile: jest.fn(),
      });
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      const avatarCards = screen.getAllByTestId("avatar-card");
      expect(avatarCards.length).toBeGreaterThan(0);

      const loginButton = screen.queryByRole("button", { name: /login/i });
      expect(loginButton).not.toBeInTheDocument();
    });
  });
});
