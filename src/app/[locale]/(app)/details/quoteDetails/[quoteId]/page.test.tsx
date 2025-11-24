// Mock Next.js modules first (before any imports)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("@/hooks/usePageScroll", () => ({
  usePageScroll: jest.fn(),
}));

jest.mock("@/components/sales", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockDetailsSkeleton = ({ showStatusTracker, showHeader }: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "details-skeleton",
        "data-show-status": showStatusTracker,
        "data-show-header": showHeader,
      },
      "DetailsSkeleton"
    );
  MockDetailsSkeleton.displayName = "MockDetailsSkeleton";
  return {
    DetailsSkeleton: MockDetailsSkeleton,
  };
});

jest.mock("next/dynamic", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (_loader: any) => {
      const DynamicComponent = ({ params: _params }: any) =>
        React.createElement(
          "div",
          { "data-testid": "quote-details-client" },
          "QuoteDetailsClient"
        );
      DynamicComponent.displayName = "DynamicQuoteDetailsClient";
      return DynamicComponent;
    },
  };
});

// Mock Suspense to render children directly
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

import { render, screen } from "@testing-library/react";
import React from "react";
import QuoteDetailsPage from "./page";

describe("QuoteDetailsPage", () => {
  it("should render the page with Suspense wrapper", async () => {
    const params = Promise.resolve({ quoteId: "quote-123" });

    render(<QuoteDetailsPage params={params} />);

    // Should render the client component (mocked)
    await screen.findByTestId("quote-details-client");
    expect(screen.getByTestId("quote-details-client")).toBeInTheDocument();
  });

  it("should handle params correctly", async () => {
    const params = Promise.resolve({ quoteId: "quote-456" });

    render(<QuoteDetailsPage params={params} />);

    await screen.findByTestId("quote-details-client");
    expect(screen.getByTestId("quote-details-client")).toBeInTheDocument();
  });
});
