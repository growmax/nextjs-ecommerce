import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { AppHeader } from "./app-header";

jest.mock("@/components/ui/command", () => ({
  CommandDialog: ({ children, open }: any) =>
    open ? <div>{children}</div> : null,
  CommandInput: ({ onValueChange }: any) => (
    <input
      data-testid="command-input"
      onChange={e => onValueChange(e.target.value)}
    />
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onSelect }: any) => (
    <div data-testid="command-item" onClick={() => onSelect()}>
      {children}
    </div>
  ),
}));

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
  it("renders and opens the command dialog on Ctrl/Cmd+K shortcut", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("command-input")).toBeInTheDocument();
  });

  it("closes the dialog when selecting a suggestion", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    const item = screen.getAllByTestId("command-item")[0]!;
    fireEvent.click(item);

    expect(screen.queryByTestId("command-input")).not.toBeInTheDocument();
  });
});
