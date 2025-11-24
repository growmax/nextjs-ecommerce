// Mock @/i18n/navigation first to avoid ESM parsing issues
jest.mock("@/i18n/navigation", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Link: ({ children, href, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
    redirect: jest.fn(),
    usePathname: () => "/",
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }),
  };
});

import { NavMain } from "@/components/nav-main";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import * as UserDetailsContext from "@/contexts/UserDetailsContext";
import { render, screen } from "@testing-library/react";
import { AppSidebar } from "./app-sidebar";

// Mock the hooks and child components
jest.mock("@/components/ui/sidebar", () => ({
  ...jest.requireActual("@/components/ui/sidebar"), // import and retain default exports
  useSidebar: jest.fn(),
}));
jest.mock("@/components/nav-main", () => ({
  NavMain: jest.fn(() => <div data-testid="nav-main" />),
}));
jest.mock("@/components/nav-user", () => ({
  NavUser: jest.fn(() => <div data-testid="nav-user" />),
}));
jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: jest.fn(),
}));

// Type assertion for the mocked hooks and components
const useSidebarMock = useSidebar as jest.Mock;
const NavMainMock = NavMain as jest.Mock;
const useUserDetailsMock = UserDetailsContext.useUserDetails as jest.Mock;

// Helper to create valid mock context data
const createMockUserDetails = (isAuthenticated: boolean) => ({
  isAuthenticated,
  isLoading: false,
  user: isAuthenticated
    ? { userId: "test-user", displayName: "Test User" }
    : null,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(() => isAuthenticated),
});

describe("AppSidebar", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide default mock implementations
    useSidebarMock.mockReturnValue({
      isMobile: false,
      setOpenMobile: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      useUserDetailsMock.mockReturnValue(createMockUserDetails(false));
    });

    it('should render only "Home" in the main navigation', () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      // Check that NavMain receives only the "Home" item
      const navMainProps = NavMainMock.mock.calls[0][0];
      expect(navMainProps.items).toHaveLength(1);
      // The component uses t("home") which returns the key "home" with our mock
      expect(navMainProps.items[0].title).toBe("home");
    });

    it("should not render NavUser when user is not authenticated", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );
      expect(screen.queryByTestId("nav-user")).not.toBeInTheDocument();
    });
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      useUserDetailsMock.mockReturnValue(createMockUserDetails(true));
    });

    it("should render all navigation items", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      // Check that NavMain receives all items
      const navMainProps = NavMainMock.mock.calls[0][0];
      const titles = navMainProps.items.map(
        (item: { title: string }) => item.title
      );

      // The component uses translation keys like t("home"), t("dashboard"), etc.
      // which return the keys "home", "dashboard", etc. with our mock
      expect(titles).toContain("home");
      expect(titles).toContain("dashboard");
      expect(titles).toContain("sales");
      expect(titles).toContain("settings");
      expect(navMainProps.items).toHaveLength(4);
    });

    it("should render sub-items for Sales and Settings", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const navMainProps = NavMainMock.mock.calls[0][0];
      const salesItem = navMainProps.items.find(
        (item: { title: string }) => item.title === "sales"
      );
      const settingsItem = navMainProps.items.find(
        (item: { title: string }) => item.title === "settings"
      );

      expect(salesItem).toBeDefined();
      expect(settingsItem).toBeDefined();
      // The component uses translation keys which return the keys with our mock
      expect(salesItem.items.map((i: { title: string }) => i.title)).toEqual([
        "orders",
        "quotes",
      ]);
      expect(settingsItem.items.map((i: { title: string }) => i.title)).toEqual(
        ["company", "profile"]
      );
    });

    it("should render NavUser when user is authenticated", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );
      expect(screen.getByTestId("nav-user")).toBeInTheDocument();
    });
  });

  describe("on mobile", () => {
    it("should call setOpenMobile(false) on navigation", () => {
      const setOpenMobileMock = jest.fn();
      useSidebarMock.mockReturnValue({
        isMobile: true,
        setOpenMobile: setOpenMobileMock,
      });
      useUserDetailsMock.mockReturnValue(createMockUserDetails(true));

      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      // Get the onNavigate function from the props passed to NavMain
      const navMainProps = NavMainMock.mock.calls[0][0];
      const handleNavigation = navMainProps.onNavigate;

      // Simulate a navigation event
      handleNavigation("/some-url");

      expect(setOpenMobileMock).toHaveBeenCalledWith(false);
    });
  });
});
