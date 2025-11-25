// Mock i18n config FIRST to prevent next-intl/server ES module loading
jest.mock("@/i18n/config", () => ({
  locales: ["en", "es"],
  defaultLocale: "en",
}));

// Mock navigation to prevent next-intl ES module loading
jest.mock("@/i18n/navigation", () => ({
  Link: "a",
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

// Mock ConditionalFooter to avoid next-intl ES module errors
jest.mock("@/components/ConditionalFooter", () => ({
  ConditionalFooter: () => null,
}));

// Mock next-intl BEFORE any other imports
jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: jest.fn(),
    number: jest.fn(),
  }),
}));

import "@testing-library/jest-dom";
import React from "react";

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

import QuotesLandingPageClient from "@/app/[locale]/(app)/landing/quoteslanding/components/QuotesLandingPageClient";
import { describe, it } from "@jest/globals";
import { render } from "@testing-library/react";

describe("QuotesLandingPageClient", () => {
  it("should render DashboardToolbar with correct title", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    expect(toolbar).toBeInTheDocument();
    // The component uses t("title") which returns the key "title" with our mock
    expect(toolbar.textContent).toContain("title");
  });

  it("should render QuotesLandingTable component", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    expect(getByTestId("quotes-table")).toBeInTheDocument();
  });

  it("should render Export button in toolbar", () => {
    const { getByTestId } = render(<QuotesLandingPageClient />);

    const toolbar = getByTestId("dashboard-toolbar");
    // The component uses t("export") which returns the key "export" with our mock
    expect(toolbar.textContent).toContain("export");
  });
});
