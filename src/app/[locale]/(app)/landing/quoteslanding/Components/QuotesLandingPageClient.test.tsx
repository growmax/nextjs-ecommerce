import React from "react";
import "@testing-library/jest-dom";

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
        React.createElement("span", { key: "title" }, title),
        primary &&
          React.createElement("button", { key: "primary" }, primary.value),
      ])
    ),
  };
});

// Mock other dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
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

jest.mock("./QuotesLandingTable/QuotesLandingTable", () => {
  return {
    __esModule: true,
    default: jest.fn(() =>
      React.createElement(
        "div",
        { "data-testid": "quotes-table" },
        "Quotes Table"
      )
    ),
  };
});

import { render } from "@testing-library/react";
import { describe, it } from "@jest/globals";
import QuotesLandingPageClient from "./QuotesLandingPageClient";

describe("QuotesLandingPageClient", () => {
  it("should render DashboardToolbar with correct title", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(toolbar.textContent).toContain("Quotes");
  });

  it("should render QuotesLandingTable component", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    expect(getByTestId("quotes-table")).toBeInTheDocument();
  });

  it("should render Export button in toolbar", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    expect(toolbar.textContent).toContain("Export");
  });
});
