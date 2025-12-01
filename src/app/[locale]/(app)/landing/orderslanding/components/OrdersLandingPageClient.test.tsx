import "@testing-library/jest-dom";
import React from "react";

// Mock next-intl BEFORE any other imports
jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: jest.fn(),
    number: jest.fn(),
  }),
}));

// Mock DashboardToolbar to avoid next-intl dependency chain
jest.mock("@/components/custom/dashboard-toolbar", () => {
  return {
    DashboardToolbar: jest.fn(({ title, primary }) =>
      React.createElement("div", { "data-testid": "dashboard-toolbar" }, [
        title && React.createElement("span", { key: "title" }, title),
        primary &&
          primary.condition &&
          React.createElement("button", { key: "primary" }, primary.value),
      ])
    ),
  };
});

// Mock other dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({
    state: "expanded", // Test with expanded sidebar
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

jest.mock("./OrdersLandingTable/OrdersLandingTable", () => {
  return jest.fn(() => <div data-testid="orders-table">Orders Table</div>);
});

import { describe, it } from "@jest/globals";
import { render } from "@testing-library/react";
import OrdersLandingPageClient from "./OrdersLandingPageClient";

describe("OrdersLandingPageClient", () => {
  it("should render DashboardToolbar with correct title", () => {
    const { getByTestId } = render(<OrdersLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    expect(toolbar).toBeInTheDocument();
    // The component uses t("title") which returns the key "title" with our mock
    expect(toolbar.textContent).toContain("title");
  });

  it("should render OrdersLandingTable component", () => {
    const { getByTestId } = render(<OrdersLandingPageClient />);

    expect(getByTestId("orders-table")).toBeInTheDocument();
  });

  it("should render Export button in toolbar", () => {
    const { getByTestId } = render(<OrdersLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    // The component uses t("export") which returns the key "export" with our mock
    expect(toolbar.textContent).toContain("export");
  });
});
