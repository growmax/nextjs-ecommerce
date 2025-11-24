/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock card primitives
jest.mock("@/components/ui/card", () => {
  const React = require("react");
  return {
    CardContent: (props: any) =>
      React.createElement("div", props, props.children),
    CardTitle: (props: any) =>
      React.createElement("div", props, props.children),
  };
});

// Mock dropdown primitives
jest.mock("@/components/ui/dropdown-menu", () => {
  const React = require("react");
  return {
    DropdownMenuItem: (props: any) =>
      React.createElement(
        "button",
        {
          onClick: props.onClick,
          disabled: props.disabled,
          className: props.className,
        },
        props.children
      ),
    DropdownMenuLabel: (props: any) =>
      React.createElement("div", props, props.children),
    DropdownMenuSeparator: (props: any) => React.createElement("hr", props),
    DropdownMenuSub: (props: any) =>
      React.createElement("div", props, props.children),
    DropdownMenuSubContent: (props: any) =>
      React.createElement("div", props, props.children),
    DropdownMenuSubTrigger: (props: any) =>
      React.createElement("button", props, props.children),
  };
});

// Mock icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Building2: () =>
      React.createElement("svg", { "data-testid": "icon-building" }),
    FileText: () =>
      React.createElement("svg", { "data-testid": "icon-filetext" }),
    Home: () => React.createElement("svg", { "data-testid": "icon-home" }),
    IdCard: () => React.createElement("svg", { "data-testid": "icon-idcard" }),
    LayoutDashboard: () =>
      React.createElement("svg", { "data-testid": "icon-dashboard" }),
    Loader2: () => React.createElement("svg", { "data-testid": "icon-loader" }),
    LogOut: () => React.createElement("svg", { "data-testid": "icon-logout" }),
    Settings: () =>
      React.createElement("svg", { "data-testid": "icon-settings" }),
    ShoppingBag: () =>
      React.createElement("svg", { "data-testid": "icon-bag" }),
    ShoppingCart: () =>
      React.createElement("svg", { "data-testid": "icon-cart" }),
  };
});

// Mock router
const mockPush = jest.fn();
const mockPrefetch = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, prefetch: mockPrefetch }),
  useLocale: () => "en",
}));

// Mock useRoutePrefetch hook
jest.mock("@/hooks/useRoutePrefetch", () => ({
  useRoutePrefetch: () => ({
    prefetch: jest.fn(),
    prefetchMultiple: jest.fn(),
    prefetchAndNavigate: jest.fn(),
    clearCache: jest.fn(),
  }),
}));

// Mock hooks: useLogout and useUserProfile
const mockHandleLogout = jest.fn();
let mockIsLoggingOut = false;
jest.mock("@/hooks/Auth/useLogout", () => ({
  __esModule: true,
  default: () => ({
    isLoggingOut: mockIsLoggingOut,
    handleLogout: mockHandleLogout,
  }),
}));

const sampleProfile = {
  displayName: "Jane Smith",
  email: "jane@example.com",
  companyName: "Acme Inc",
  role: "Admin",
  accountRole: "Owner",
  lastLogin: "2025-11-12 10:00",
};

jest.mock("../../../hooks/Profile/useUserProfile", () => ({
  __esModule: true,
  default: () => ({ userProfile: sampleProfile }),
}));

import ProfileMenu from "./ProfileMenu";

describe("ProfileMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoggingOut = false;
  });

  it("renders user profile details when available", () => {
    render(React.createElement(ProfileMenu));

    // displayName may be grouped with role/accountRole in the same element; use substring match
    expect(
      screen.getByText((txt: string) => txt.includes(sampleProfile.displayName))
    ).toBeInTheDocument();
    expect(screen.getByText(sampleProfile.email)).toBeInTheDocument();
    expect(screen.getByText(sampleProfile.companyName)).toBeInTheDocument();
    expect(screen.getByText(/Last Login/i)).toBeInTheDocument();
  });

  it("navigates to pages when menu items are clicked", () => {
    render(React.createElement(ProfileMenu));

    fireEvent.click(screen.getByText("Home"));
    expect(mockPush).toHaveBeenCalledWith("/");

    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");

    fireEvent.click(screen.getByText("Orders"));
    expect(mockPush).toHaveBeenCalledWith("/landing/orderslanding");

    fireEvent.click(screen.getByText("Quotes"));
    expect(mockPush).toHaveBeenCalledWith("/landing/quoteslanding");

    fireEvent.click(screen.getByText("Profile"));
    expect(mockPush).toHaveBeenCalledWith("/settings/profile");

    fireEvent.click(screen.getByText("Company"));
    expect(mockPush).toHaveBeenCalledWith("/settings/company");
  });

  it("calls logout handler when logout is clicked and shows loading state", () => {
    // simulate not logging out initially
    mockIsLoggingOut = false;
    render(React.createElement(ProfileMenu));

    fireEvent.click(screen.getByText("Logout"));
    expect(mockHandleLogout).toHaveBeenCalled();

    // simulate logging out state
    mockIsLoggingOut = true;
    // Re-import mock hook by re-mocking module implementation
    jest.doMock("@/hooks/Auth/useLogout", () => ({
      __esModule: true,
      default: () => ({ isLoggingOut: true, handleLogout: mockHandleLogout }),
    }));

    // Rerender component to pick up new mock
    jest.resetModules();
    const ProfileMenuReloaded = require("./ProfileMenu").default;
    render(React.createElement(ProfileMenuReloaded));

    expect(screen.getByText(/Logging out/i)).toBeInTheDocument();
  });
});
