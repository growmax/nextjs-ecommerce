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
      expect(navMainProps.items[0].title).toBe("Home");
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

      expect(titles).toContain("Home");
      expect(titles).toContain("Dashboard");
      expect(titles).toContain("Sales");
      expect(titles).toContain("Settings");
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
        (item: { title: string }) => item.title === "Sales"
      );
      const settingsItem = navMainProps.items.find(
        (item: { title: string }) => item.title === "Settings"
      );

      expect(salesItem.items.map((i: { title: string }) => i.title)).toEqual([
        "Orders",
        "Quotes",
      ]);
      expect(settingsItem.items.map((i: { title: string }) => i.title)).toEqual(
        ["Company", "Profile"]
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
