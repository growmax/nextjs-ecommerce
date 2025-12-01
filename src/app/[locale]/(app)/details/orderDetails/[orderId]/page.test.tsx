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

jest.mock("./components/OrderDetailsClient", () => {
  return function MockOrderDetailsClient() {
    return <div data-testid="order-details-client">OrderDetailsClient</div>;
  };
});

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: jest.fn(() => ({ value: "mock-token" })),
  })),
}));

jest.mock("@/lib/api", () => ({
  OrderDetailsService: {
    fetchOrderDetailsWithContext: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/lib/services/JWTService", () => ({
  JWTService: {
    getInstance: () => ({
      decodeToken: () => ({
        sub: "123",
        companyId: "456",
        iss: "tenant-1",
      }),
    }),
  },
}));

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
import OrderDetailsPage from "./page";

describe("OrderDetailsPage", () => {
  it("should render the page with Suspense wrapper", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    const ui = await OrderDetailsPage({ params });
    render(ui);

    // Should render the client component (mocked)
    expect(screen.getByTestId("order-details-client")).toBeInTheDocument();
  });

  it("should handle params correctly", async () => {
    const params = Promise.resolve({ orderId: "order-456", locale: "en" });

    const ui = await OrderDetailsPage({ params });
    render(ui);

    expect(screen.getByTestId("order-details-client")).toBeInTheDocument();
  });
});
