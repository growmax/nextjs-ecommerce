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

jest.mock("./Components/QuotesLandingPageClient", () => {
  return function MockQuotesLandingPageClient() {
    return (
      <div data-testid="quotes-landing-page-client">
        QuotesLandingPageClient
      </div>
    );
  };
});

jest.mock("@/hooks/useRouteRequestTracking", () => ({
  useRouteRequestTracking: jest.fn(),
}));

import { usePageScroll } from "@/hooks/usePageScroll";
import { render, screen } from "@testing-library/react";
import QuotesLandingPage from "./page";

describe("QuotesLandingPage", () => {
  it("should render the page with client component", () => {
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
