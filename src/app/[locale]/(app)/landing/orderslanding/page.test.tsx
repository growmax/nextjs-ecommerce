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

jest.mock("./components/OrdersLandingPageClient", () => {
  return function MockOrdersLandingPageClient() {
    return (
      <div data-testid="orders-landing-page-client">
        OrdersLandingPageClient
      </div>
    );
  };
});

jest.mock("@/hooks/useRouteRequestTracking", () => ({
  useRouteRequestTracking: jest.fn(),
}));

import { usePageScroll } from "@/hooks/usePageScroll";
import { render, screen } from "@testing-library/react";
import OrdersLandingPage from "./page";

describe("OrdersLandingPage", () => {
  it("should render the page with client component", () => {
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
