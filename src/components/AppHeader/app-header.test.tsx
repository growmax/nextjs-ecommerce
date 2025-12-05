import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock next-intl BEFORE importing AppHeader to avoid ESM parsing issues
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (value: number) => value.toString(),
    relativeTime: (date: Date) => date.toISOString(),
  }),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock i18n config to avoid ESM parsing issues
jest.mock("@/i18n/config", () => ({
  getTranslations: jest.fn(),
  getLocale: jest.fn(() => "en"),
  getFormatter: jest.fn(),
}));

// Mock LanguageSwitcher to avoid next-intl dependency chain
jest.mock("@/components/LanguageSwitcher/LanguageSwitcher", () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}));

const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock("@/hooks/useNavigationWithLoader", () => ({
  useNavigationWithLoader: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/hooks/useTenantData", () => ({
  useTenantData: jest.fn(),
}));

import { AppHeader } from "./app-header";

jest.mock("@/components/AppHeader/SearchDialogBox/SearchDialogBox", () => {
  return function MockSearchDialogBox({
    open,
    suggestionItems,
    handleSelect,
  }: any) {
    if (!open) return null;
    return (
      <div data-testid="search-dialog-box">
        <input data-testid="command-input" />
        {suggestionItems.map((item: any) => (
          <div
            key={item.key}
            data-testid="command-item"
            onClick={() => handleSelect(item.href)}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: (props: any) => (
    <button aria-label="sidebar-trigger" {...props} />
  ),
  useSidebar: () => ({ state: "expanded" }),
}));

jest.mock("@/hooks/Profile/useUserProfile", () => ({
  __esModule: true,
  default: () => ({ userProfile: { displayName: "Test User", picture: "" } }),
}));

jest.mock("@/hooks/Auth/useLogout", () => ({
  __esModule: true,
  default: () => ({ isLoggingOut: false, handleLogout: jest.fn() }),
}));

jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: () => ({ isAuthenticated: true }),
}));

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ cartCount: 2 }),
}));

jest.mock(
  "@/lib/api/services/ElacticQueryService/query-builder/query-builder",
  () => ({
    buildProductSearchQuery: jest
      .fn()
      .mockReturnValue({ query: { match: { name: "laptop" } } }),
  })
);

import { TenantProvider } from "@/contexts/TenantContext";

// Helper to create a wrapper with TenantProvider
function createWrapper() {
  const mockInitialData = {
    status: "success",
    message: null,
    data: {
      tenant: {
        id: 1,
        tenantCode: "test-tenant",
        tenantDescription: "Test Tenant",
        tenantDomain: "test.com",
        elasticCode: "test-elastic",
        typeSenseCode: "test-typesense",
        typeSenseKey: null,
        assertS3BucketName: "test-bucket",
        apikey: null,
        enablePartnerToPartnerPurchase: false,
        plainId: "test-plain",
        SSLCreated: false,
        sslCreatedDate: null,
        checkSSL: false,
        domainNameVerified: false,
        demoRequired: false,
        finalCompleted: false,
        initCompleted: false,
        otherInitdataCompleted: false,
        tenantId: 1,
      },
      sellerCompanyId: {
        id: 1,
        name: "Test Company",
        logo: "",
        companyIdentifier: "TEST-001",
        defaultEmail: "test@example.com",
        reportEmail: "report@example.com",
        inventoryEmail: "inventory@example.com",
        website: "https://test.com",
        tenantId: 1,
        vendorId: null,
        verified: true,
        activated: true,
        profileAccess: true,
        taxExempted: false,
        bnplEnabled: false,
        bnplPhone: null,
        bnplCustomerId: null,
        inviteAccess: null,
        addressId: null,
        taxExemptionId: null,
        finStartDate: null,
        finEndDate: null,
        finStartMonth: null,
        financialYear: null,
        accountTypeId: { id: 1, name: "Test Account" },
        businessTypeId: { id: 1, name: "Test Business", tenantId: 1 },
        currencyId: {
          id: 1,
          currencyCode: "USD",
          symbol: "$",
          decimal: ".",
          thousand: ",",
          precision: 2,
          description: "US Dollar",
          tenantId: 1,
        },
        subIndustryId: {
          id: 1,
          name: "Test Industry",
          description: "Test",
          tenantId: 1,
          industryId: { id: 1, name: "Test", tenantId: 1 },
        },
        taxDetailsId: {
          id: 1,
          pan: "TEST123",
          panImage: null,
          tenantId: 1,
        },
      },
      sellerCurrency: {
        id: 1,
        currencyCode: "USD",
        symbol: "$",
        decimal: ".",
        thousand: ",",
        precision: 2,
        description: "US Dollar",
        tenantId: 1,
      },
    },
  } as const;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      TenantProvider,
      { initialData: mockInitialData } as React.ComponentProps<
        typeof TenantProvider
      >,
      children
    );
  };
  Wrapper.displayName = "TenantProviderWrapper";
  return Wrapper;
}

describe("AppHeader", () => {
  beforeEach(() => {
    // Setup navigation hooks mocks
    mockUsePathname.mockReturnValue('/test-path');
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  it("navigates to search page on Ctrl/Cmd+K shortcut", () => {
    const mockPush = jest.fn();
    const mockUseNavigationWithLoader = jest.requireMock("@/hooks/useNavigationWithLoader");
    mockUseNavigationWithLoader.useNavigationWithLoader = jest.fn(() => ({
      push: mockPush,
      replace: jest.fn(),
    }));
    
    render(<AppHeader />, { wrapper: createWrapper() });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    
    expect(mockPush).toHaveBeenCalledWith("/search");
  });

  it("navigates to search page when Enter is pressed in search input", () => {
    const mockPush = jest.fn();
    const mockUseNavigationWithLoader = jest.requireMock("@/hooks/useNavigationWithLoader");
    mockUseNavigationWithLoader.useNavigationWithLoader = jest.fn(() => ({
      push: mockPush,
      replace: jest.fn(),
    }));
    
    render(<AppHeader />, { wrapper: createWrapper() });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText("placeholder");
    
    // Type a search query
    fireEvent.change(searchInput, { target: { value: "test query" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });
    
    expect(mockPush).toHaveBeenCalledWith("/search?q=test%20query");
  });
});
