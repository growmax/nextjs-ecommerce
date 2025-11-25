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

jest.mock("@/hooks/usePageScroll/usePageScroll", () => ({
  usePageScroll: jest.fn(),
}));

jest.mock("next/dynamic", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (_loader: any) => {
      const DynamicComponent = ({ params: _params }: any) =>
        React.createElement(
          "div",
          { "data-testid": "order-details-client" },
          "OrderDetailsClient"
        );
      DynamicComponent.displayName = "DynamicOrderDetailsClient";
      return DynamicComponent;
    },
  };
});

jest.mock("./components/OrderDetailsSkeleton", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSkeleton = () =>
    React.createElement(
      "div",
      { "data-testid": "order-details-skeleton" },
      "Loading..."
    );
  MockSkeleton.displayName = "MockOrderDetailsSkeleton";
  return {
    __esModule: true,
    default: MockSkeleton,
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
import OrderDetailsPage from "@/app/[locale]/(app)/details/orderDetails/[orderId]/page";

describe("OrderDetailsPage", () => {
  it("should render the page with Suspense wrapper", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsPage params={params} />);

    // Should render the client component (mocked)
    await screen.findByTestId("order-details-client");
    expect(screen.getByTestId("order-details-client")).toBeInTheDocument();
  });

  it("should handle params correctly", async () => {
    const params = Promise.resolve({ orderId: "order-456", locale: "en" });

    render(<OrderDetailsPage params={params} />);

    await screen.findByTestId("order-details-client");
    expect(screen.getByTestId("order-details-client")).toBeInTheDocument();
  });
});
