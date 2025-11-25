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
      const DynamicComponent = () =>
        React.createElement(
          "div",
          { "data-testid": "orders-landing-page-client" },
          "OrdersLandingPageClient"
        );
      DynamicComponent.displayName = "DynamicOrdersLandingPageClient";
      return DynamicComponent;
    },
  };
});

import { usePageScroll } from "@/hooks/usePageScroll/usePageScroll";
import { render, screen } from "@testing-library/react";
import OrdersLandingPage from "@/app/[locale]/(app)/landing/orderslanding/page";

describe("OrdersLandingPage", () => {
  it("should render the page with dynamic client component", () => {
    render(<OrdersLandingPage />);

    expect(
      screen.getByTestId("orders-landing-page-client")
    ).toBeInTheDocument();
  });

  it("should call usePageScroll hook", () => {
    render(<OrdersLandingPage />);
    expect(usePageScroll).toHaveBeenCalled();
  });
});
