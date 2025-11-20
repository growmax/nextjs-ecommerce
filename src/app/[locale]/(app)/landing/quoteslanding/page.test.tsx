// Mock Next.js modules first (before any imports)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("@/hooks/usePageScroll", () => ({
  usePageScroll: jest.fn(),
}));

jest.mock("next/dynamic", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (_loader: any) => {
      const DynamicComponent = () =>
        React.createElement(
          "div",
          { "data-testid": "quotes-landing-page-client" },
          "QuotesLandingPageClient"
        );
      DynamicComponent.displayName = "DynamicQuotesLandingPageClient";
      return DynamicComponent;
    },
  };
});

import { render, screen } from "@testing-library/react";
import React from "react";
import { usePageScroll } from "@/hooks/usePageScroll";
import QuotesLandingPage from "./page";

describe("QuotesLandingPage", () => {
  it("should render the page with dynamic client component", () => {
    render(<QuotesLandingPage />);

    expect(
      screen.getByTestId("quotes-landing-page-client")
    ).toBeInTheDocument();
  });

  it("should call usePageScroll hook", () => {
    render(<QuotesLandingPage />);
    expect(usePageScroll).toHaveBeenCalled();
  });
});
