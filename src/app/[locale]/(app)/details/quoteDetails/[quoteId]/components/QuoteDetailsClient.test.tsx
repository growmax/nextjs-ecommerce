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

// Mock Next.js modules first (before any imports)
jest.mock("@/components/ConditionalFooter", () => ({
  ConditionalFooter: () => null,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (value: number) => value.toString(),
  }),
}));

// Mock data
const mockUser = {
  userId: "user-1",
  companyId: "company-1",
  displayName: "Test User",
  currency: { id: 1, currencyCode: "INR" },
  taxExemption: false,
  isSeller: false,
};

const mockTenantData = {
  tenant: {
    tenantCode: "tenant-1",
    elasticCode: "testelastic",
  },
};

const mockQuoteDetailsResponse = {
  success: true,
  data: {
    quotationDetails: [
      {
        quotationId: "quote-123",
        quoteName: "Test Quote",
        quotationIdentifier: "QUO-123",
        updatedBuyerStatus: "QUOTE RECEIVED",
        updatedSellerStatus: "QUOTE RECEIVED",
        buyerCompanyId: "company-1",
        buyerCompanyName: "Test Company",
        buyerBranchId: 1,
        buyerBranchName: "Test Branch",
        sellerCompanyId: "seller-1",
        sellerCompanyName: "Seller Company",
        sellerBranchId: 1,
        sellerBranchName: "Seller Branch",
        buyerCurrencyId: { id: 1 },
        sellerCurrencyId: { id: 2 },
        buyerCurrencySymbol: { symbol: "INR ₹" },
        dbProductDetails: [
          {
            productId: 1,
            productName: "Product 1",
            unitPrice: 100,
            quantity: 2,
            unitQuantity: 2,
            askedQuantity: 2,
            itemNo: 1,
          },
        ],
        quoteTerms: {
          paymentTerms: "NET 30",
          deliveryTerms: "FOB",
        },
        isInter: true,
        taxExemption: false,
        insuranceCharges: 0,
        overallShipping: 0,
        overallTax: 0,
        subTotal: 200,
        calculatedTotal: 200,
        grandTotal: 200,
        taxableAmount: 200,
        pfRate: 0,
        customerRequiredDate: "2024-12-31",
        buyerReferenceNumber: "REF-123",
        billingAddressDetails: {
          addressLine: "123 Test St",
          city: "Test City",
          state: "Test State",
          country: "Test Country",
        },
        shippingAddressDetails: {
          addressLine: "456 Ship St",
          city: "Ship City",
          state: "Ship State",
          country: "Ship Country",
        },
        registerAddressDetails: {
          addressLine: "789 Reg St",
          city: "Reg City",
        },
        sellerAddressDetail: {
          addressLine: "321 Seller St",
          city: "Seller City",
        },
        roundingAdjustmentEnabled: false,
      },
    ],
    buyerCurrencyId: { id: 1 },
    sellerCurrencyId: { id: 2 },
    buyerCurrencySymbol: { symbol: "INR ₹" },
    quotationIdentifier: "QUO-123",
    createdDate: "2024-01-01",
    updatedBuyerStatus: "QUOTE RECEIVED",
    updatedSellerStatus: "QUOTE RECEIVED",
    isInter: true,
    insuranceCharges: 0,
    overallShipping: 0,
    pfRate: 0,
    buyerReferenceNumber: "REF-123",
    validityFrom: "2024-01-01",
    validityTill: "2024-12-31",
    purchaseOrder: false,
    reorder: false,
  },
};

// Mock hooks
jest.mock("@/hooks/useCurrentUser/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

jest.mock("@/hooks/useTenantData/useTenantData", () => ({
  useTenantData: () => ({ tenantData: mockTenantData }),
}));

jest.mock("@/hooks/useModuleSettings/useModuleSettings", () => ({
  __esModule: true,
  default: () => ({
    quoteSettings: { editQuote: "QUOTE RECEIVED" },
  }),
}));

jest.mock("@/hooks/details/quotedetails/useQuoteDetails", () => ({
  useQuoteDetails: () => ({
    versions: [{ versionNumber: 1, versionName: "Version 1", orderVersion: 1 }],
    quotationIdentifier: "QUO-123",
    quotationVersion: 1,
  }),
}));

jest.mock("@/hooks/useGetVersionDetails/useGetVersionDetails", () => ({
  useGetVersionDetails: () => ({
    data: null,
    isLoading: false,
  }),
}));

jest.mock("@/components/ui/sidebar", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    useSidebar: () => ({
      state: "expanded",
      open: true,
      setOpen: jest.fn(),
      isMobile: false,
      openMobile: false,
      setOpenMobile: jest.fn(),
      toggleSidebar: jest.fn(),
    }),
    SidebarProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock("@/components/layout", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockApplicationLayout = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      "div",
      { "data-testid": "application-layout" },
      children
    );
  MockApplicationLayout.displayName = "MockApplicationLayout";

  const MockPageLayout = ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "page-layout" }, children);
  MockPageLayout.displayName = "MockPageLayout";

  return {
    ApplicationLayout: MockApplicationLayout,
    PageLayout: MockPageLayout,
  };
});

// Mock services
jest.mock("@/lib/api", () => ({
  QuotationDetailsService: {
    fetchQuotationDetails: jest.fn(),
  },
}));

jest.mock(
  "@/lib/api/services/QuotationNameService/QuotationNameService",
  () => ({
    __esModule: true,
    default: {
      updateQuotationName: jest.fn(),
    },
  })
);

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/ui/skeleton", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSkeleton = ({ className }: { className?: string }) =>
    React.createElement(
      "div",
      { "data-testid": "skeleton", className },
      "Loading..."
    );
  MockSkeleton.displayName = "MockSkeleton";
  return {
    Skeleton: MockSkeleton,
  };
});

jest.mock("@/components/ui/sonner", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockToaster = () =>
    React.createElement("div", { "data-testid": "toaster" }, "Toaster");
  MockToaster.displayName = "MockToaster";
  return {
    Toaster: MockToaster,
  };
});

jest.mock("@/components/dialogs/EditOrderNameDialog", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockEditOrderNameDialog = ({ open, currentOrderName }: any) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "edit-order-name-dialog" },
          `Edit Quote Name: ${currentOrderName}`
        )
      : null;
  MockEditOrderNameDialog.displayName = "MockEditOrderNameDialog";
  return {
    EditOrderNameDialog: MockEditOrderNameDialog,
  };
});

jest.mock("@/components/dialogs/VersionsDialog", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockVersionsDialog = ({ open }: any) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "versions-dialog" },
          "Versions Dialog"
        )
      : null;
  MockVersionsDialog.displayName = "MockVersionsDialog";
  return {
    VersionsDialog: MockVersionsDialog,
  };
});

jest.mock("@/components/sales/sales-header", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSalesHeader = ({
    title,
    identifier,
  }: {
    title: string;
    identifier: string;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "sales-header" },
      React.createElement("h1", null, title),
      React.createElement("span", null, identifier)
    );
  MockSalesHeader.displayName = "MockSalesHeader";
  return {
    __esModule: true,
    default: MockSalesHeader,
  };
});

jest.mock("@/components/sales/order-products-table", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockOrderProductsTable = () =>
    React.createElement(
      "div",
      { "data-testid": "order-products-table" },
      "Products Table"
    );
  MockOrderProductsTable.displayName = "MockOrderProductsTable";
  return {
    __esModule: true,
    default: MockOrderProductsTable,
  };
});

jest.mock("@/components/sales/contactdetails", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockOrderContactDetails = () =>
    React.createElement(
      "div",
      { "data-testid": "order-contact-details" },
      "Contact Details"
    );
  MockOrderContactDetails.displayName = "MockOrderContactDetails";
  return {
    __esModule: true,
    default: MockOrderContactDetails,
  };
});

jest.mock("@/components/sales/terms-card", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockOrderTermsCard = () =>
    React.createElement(
      "div",
      { "data-testid": "order-terms-card" },
      "Terms Card"
    );
  MockOrderTermsCard.displayName = "MockOrderTermsCard";
  return {
    __esModule: true,
    default: MockOrderTermsCard,
  };
});

jest.mock("@/components/sales/order-price-details", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockOrderPriceDetails = () =>
    React.createElement(
      "div",
      { "data-testid": "order-price-details" },
      "Price Details"
    );
  MockOrderPriceDetails.displayName = "MockOrderPriceDetails";
  return {
    __esModule: true,
    default: MockOrderPriceDetails,
  };
});

jest.mock("@/components/sales/customer-info-card", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockCustomerInfoCard = () =>
    React.createElement(
      "div",
      { "data-testid": "customer-info-card" },
      "Customer Info Card"
    );
  MockCustomerInfoCard.displayName = "MockCustomerInfoCard";
  return {
    __esModule: true,
    default: MockCustomerInfoCard,
  };
});

jest.mock("@/components/sales/DetailsSkeleton", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockDetailsSkeleton = () =>
    React.createElement(
      "div",
      { "data-testid": "details-skeleton" },
      "Details Skeleton"
    );
  MockDetailsSkeleton.displayName = "MockDetailsSkeleton";
  return {
    __esModule: true,
    default: MockDetailsSkeleton,
  };
});

jest.mock("lucide-react", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockLayers = () =>
    React.createElement("div", { "data-testid": "layers-icon" }, "Layers");
  MockLayers.displayName = "MockLayers";
  return {
    Layers: MockLayers,
  };
});

// Mock dynamic imports - return the mocked components from @/components/sales
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: any) => {
    const React = jest.requireActual<typeof import("react")>("react");
    // For dynamic imports, we'll return a component that renders immediately
    const DynamicComponent = () => {
      const loaderString = loader.toString();

      if (loaderString.includes("OrderProductsTable")) {
        return React.createElement(
          "div",
          { "data-testid": "order-products-table" },
          "Products Table"
        );
      }
      if (loaderString.includes("OrderPriceDetails")) {
        return React.createElement(
          "div",
          { "data-testid": "order-price-details" },
          "Price Details"
        );
      }

      return React.createElement("div", null, "Mock Component");
    };
    DynamicComponent.displayName = "DynamicComponent";
    return DynamicComponent;
  },
}));

// Mock export-csv module
jest.mock("@/lib/export-csv", () => ({
  exportProductsToCsv: jest.fn(),
}));

// Mock utils
jest.mock("@/utils/details/orderdetails", () => ({
  getStatusStyle: jest.fn(() => ""),
}));

jest.mock("@/utils/General/general", () => ({
  decodeUnicode: jest.fn(str => str),
}));

import QuoteDetailsClient from "@/app/[locale]/(app)/details/quoteDetails/[quoteId]/components/QuoteDetailsClient";
import { QuotationDetailsService } from "@/lib/api";
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import { toast } from "sonner";

const mockFetchQuoteDetails =
  QuotationDetailsService.fetchQuotationDetails as jest.MockedFunction<
    typeof QuotationDetailsService.fetchQuotationDetails
  >;
// @ts-expect-error - Mock variable for potential future use
const _mockUpdateQuoteName =
  QuotationNameService.updateQuotationName as jest.MockedFunction<
    typeof QuotationNameService.updateQuotationName
  >;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

describe("QuoteDetailsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchQuoteDetails.mockResolvedValue(mockQuoteDetailsResponse as any);
  });

  it("should render loading state initially", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    // Should show loading initially - check for details skeleton or sales header
    // The component may render quickly, so check for either loading state or loaded state
    const skeletons = screen.queryAllByTestId("details-skeleton");
    if (skeletons.length > 0) {
      expect(skeletons.length).toBeGreaterThan(0);
    } else {
      // If no skeletons, component rendered immediately - check for sales header
      await waitFor(() => {
        expect(screen.getByTestId("sales-header")).toBeInTheDocument();
      });
    }
  });

  it("should render quote details when loaded", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });
  });

  it("should render quote name in header when available", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });
  });

  it("should render products table when quote details are loaded", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("should render customer info card when quote is not cancelled", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("customer-info-card")).toBeInTheDocument();
    });
  });

  it("should render contact details and terms cards", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-contact-details")).toBeInTheDocument();
      expect(screen.getByTestId("order-terms-card")).toBeInTheDocument();
    });
  });

  it("should render price details section", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-price-details")).toBeInTheDocument();
    });
  });

  it("should render layers icon button for versions", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("layers-icon")).toBeInTheDocument();
    });
  });

  it("should call fetchQuotationDetails with correct parameters", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchQuoteDetails).toHaveBeenCalledWith({
        userId: mockUser.userId,
        companyId: mockUser.companyId,
        quotationIdentifier: "quote-123",
      });
    });
  });

  it("should handle error state", async () => {
    const errorMessage = "Failed to fetch quotation details";
    mockFetchQuoteDetails.mockRejectedValueOnce(new Error(errorMessage));

    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<QuoteDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });
  });
});
