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
jest.mock("@/contexts/UserDetailsContext");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useSearch");
jest.mock("@/components/AvatarCard/AvatarCard", () => ({
  AvatarCard: jest.fn(() => <div data-testid="avatar-card" />),
}));

// Type assertion for the mocked hooks
const useUserProfileMock = useUserProfile as jest.Mock;
const useLogoutMock = useLogout as jest.Mock;
const useCartMock = useCart as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const useSearchMock = useSearch as jest.Mock;
const useUserDetailsMock = UserDetailsContext.useUserDetails as jest.Mock;

describe("AppHeader", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfileMock.mockReturnValue({ userProfile: null });
    useLogoutMock.mockReturnValue({
      isLoggingOut: false,
      handleLogout: jest.fn(),
    });
    useCartMock.mockReturnValue({ cartCount: 0 });
    useRouterMock.mockReturnValue({ push: mockPush });
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
    });
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

      expect(mockPush).toHaveBeenCalledWith("/login");
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
      useUserProfileMock.mockReturnValue({ userProfile: mockUser });
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

  describe("Command dialog (search)", () => {
    it("should open the command dialog with shortcut and show items", async () => {
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      // Open with Cmd/Ctrl+K shortcut
      fireEvent.keyDown(document, { key: "k", metaKey: true });

      // The command input placeholder should be visible
      const input = await screen.findByPlaceholderText(
        /type a command or search/i
      );
      expect(input).toBeInTheDocument();

      // Suggestions we added should be visible
      expect(screen.getByText(/orders/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it("selecting Orders navigates to orders page", async () => {
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      fireEvent.keyDown(document, { key: "k", ctrlKey: true });

      const orders = await screen.findByText(/orders/i);
      fireEvent.click(orders);

      expect(mockPush).toHaveBeenCalledWith("/landing/orderslanding");
    });

    it("selecting Dashboard navigates to dashboard page", async () => {
      render(
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      );

      fireEvent.keyDown(document, { key: "k", ctrlKey: true });

      const dash = await screen.findByText(/dashboard/i);
      fireEvent.click(dash);

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
