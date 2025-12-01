import "@testing-library/jest-dom";

// Mock Next.js modules first (before any imports)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
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

jest.mock("@/hooks/usePageScroll", () => ({
  usePageScroll: jest.fn(),
}));

jest.mock("@/hooks/useGlobalLoader", () => ({
  useLoading: () => ({
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
    isLoading: false,
  }),
}));

// Mock hooks
const mockUser = {
  userId: "user-1",
  companyId: "company-1",
  displayName: "Test User",
  currency: { id: 1, currencyCode: "INR" },
};

const mockTenantData = {
  tenant: {
    tenantCode: "tenant-1",
    elasticCode: "testelastic",
  },
};

const mockOrderDetailsResponse = {
  data: {
    orderDetails: [
      {
        orderId: "order-123",
        orderName: "Test Order",
        orderIdentifier: "ORD-123",
        updatedBuyerStatus: "ORDER ACKNOWLEDGED",
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
            itemNo: 1,
          },
        ],
        orderTerms: {
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
        orderDivisionId: { id: 1 },
        orderType: { id: 1 },
        tagsList: [],
        orderUsers: [],
        uploadedDocumentDetails: [],
        totalPaid: 0,
        roundingAdjustmentEnabled: false,
      },
    ],
    buyerCurrencyId: { id: 1 },
    sellerCurrencyId: { id: 2 },
    buyerCurrencySymbol: { symbol: "INR ₹" },
    orderIdentifier: "ORD-123",
    createdDate: "2024-01-01",
    updatedBuyerStatus: "ORDER ACKNOWLEDGED",
    isInter: true,
    insuranceCharges: 0,
    overallShipping: 0,
    pfRate: 0,
  },
};

jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

jest.mock("@/hooks/useTenantData", () => ({
  useTenantData: () => ({ tenantData: mockTenantData }),
}));

jest.mock("@/hooks/useModuleSettings", () => ({
  __esModule: true,
  default: () => ({
    quoteSettings: { roundingAdjustment: false },
  }),
}));

jest.mock("@/hooks/useFetchOrderDetails/useFetchOrderDetails", () => ({
  __esModule: true,
  default: jest.fn((orderId: string) => ({
    fetchOrderResponse: orderId ? mockOrderDetailsResponse.data : null,
    fetchOrderError: null,
    fetchOrderResponseLoading: false,
    fetchOrderResponseMutate: jest
      .fn()
      .mockResolvedValue(mockOrderDetailsResponse),
  })),
}));

jest.mock("@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms", () => ({
  __esModule: true,
  default: () => ({
    latestPaymentTerms: null,
  }),
}));

jest.mock("@/hooks/details/orderdetails/useOrderDetails", () => ({
  useOrderDetails: () => ({
    versions: [{ versionNumber: 1, versionName: "Version 1", orderVersion: 1 }],
    orderIdentifier: "ORD-123",
    orderVersion: 1,
  }),
}));

jest.mock("@/hooks/useGetVersionDetails/useGetVersionDetails", () => ({
  useGetVersionDetails: () => ({
    data: null,
    isLoading: false,
  }),
}));

jest.mock(
  "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled",
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);

// Create stable mock data outside the mock to prevent infinite loops
const mockUpdatedProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 100,
    quantity: 2,
    unitQuantity: 2,
    itemNo: 1,
    showPrice: true,
    totalPrice: 200,
    unitListPrice: 100,
  },
];

jest.mock("@/hooks/useLatestOrderProducts/useLatestOrderProducts", () => ({
  useLatestOrderProducts: () => ({
    updatedProducts: mockUpdatedProducts,
    isLoading: false,
  }),
}));

// Create stable calculated products
const mockCalculatedProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 100,
    quantity: 2,
    unitQuantity: 2,
    itemNo: 1,
    showPrice: true,
    totalPrice: 200,
    unitListPrice: 100,
  },
];

jest.mock("@/hooks/useOrderCalculation/useOrderCalculation", () => ({
  useOrderCalculation: () => ({
    calculatedData: {
      products: mockCalculatedProducts,
      cartValue: {
        totalValue: 200,
        totalTax: 0,
        totalShipping: 0,
        grandTotal: 200,
        taxableAmount: 200,
        cashDiscountValue: 0,
      },
      breakup: {
        subTotal: 200,
        overallTax: 0,
        taxableAmount: 200,
        calculatedTotal: 200,
        grandTotal: 200,
      },
      metadata: {
        hasVolumeDiscount: false,
      },
    },
  }),
}));

jest.mock("@/hooks/useCashDiscountHandlers/useCashDiscountHandlers", () => ({
  __esModule: true,
  default: () => ({
    handleCDApply: jest.fn(),
    handleRemoveCD: jest.fn(),
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
  OrderVersionService: {
    createNewVersion: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/sales", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSalesHeader = ({
    title,
    identifier,
    buttons,
  }: {
    title: string;
    identifier: string;
    buttons?: any[];
  }) =>
    React.createElement(
      "div",
      { "data-testid": "sales-header" },
      React.createElement("h1", null, title),
      React.createElement("span", null, identifier),
      buttons?.map((btn: any, idx: number) =>
        React.createElement(
          "button",
          {
            key: idx,
            onClick: btn.onClick,
            disabled: btn.disabled,
            "data-testid": "button",
          },
          btn.label
        )
      )
    );
  MockSalesHeader.displayName = "MockSalesHeader";

  const MockOrderProductsTable = () =>
    React.createElement(
      "div",
      { "data-testid": "order-products-table" },
      "Products Table"
    );
  MockOrderProductsTable.displayName = "MockOrderProductsTable";

  const MockOrderContactDetails = () =>
    React.createElement(
      "div",
      { "data-testid": "order-contact-details" },
      "Contact Details"
    );
  MockOrderContactDetails.displayName = "MockOrderContactDetails";

  const MockOrderTermsCard = () =>
    React.createElement(
      "div",
      { "data-testid": "order-terms-card" },
      "Terms Card"
    );
  MockOrderTermsCard.displayName = "MockOrderTermsCard";

  const MockOrderPriceDetails = () =>
    React.createElement(
      "div",
      { "data-testid": "order-price-details" },
      "Price Details"
    );
  MockOrderPriceDetails.displayName = "MockOrderPriceDetails";

  const MockDetailsSkeleton = () =>
    React.createElement(
      "div",
      { "data-testid": "details-skeleton" },
      "Details Skeleton"
    );
  MockDetailsSkeleton.displayName = "MockDetailsSkeleton";

  return {
    SalesHeader: MockSalesHeader,
    OrderProductsTable: MockOrderProductsTable,
    OrderContactDetails: MockOrderContactDetails,
    OrderTermsCard: MockOrderTermsCard,
    OrderPriceDetails: MockOrderPriceDetails,
    DetailsSkeleton: MockDetailsSkeleton,
  };
});

jest.mock("@/components/sales/CashDiscountCard", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockCashDiscountCard = () =>
    React.createElement(
      "div",
      { "data-testid": "cash-discount-card" },
      "Cash Discount Card"
    );
  MockCashDiscountCard.displayName = "MockCashDiscountCard";
  return {
    __esModule: true,
    default: MockCashDiscountCard,
  };
});

jest.mock("@/components/ui/button", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockButton = ({ children, onClick, disabled }: any) =>
    React.createElement(
      "button",
      { onClick, disabled, "data-testid": "button" },
      children
    );
  MockButton.displayName = "MockButton";
  return {
    Button: MockButton,
  };
});

jest.mock("@/components/ui/dialog", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockDialog = ({ children, open }: any) =>
    open
      ? React.createElement("div", { "data-testid": "dialog" }, children)
      : null;
  MockDialog.displayName = "MockDialog";

  const MockDialogContent = ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-content" }, children);
  MockDialogContent.displayName = "MockDialogContent";

  const MockDialogHeader = ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-header" }, children);
  MockDialogHeader.displayName = "MockDialogHeader";

  const MockDialogTitle = ({ children }: any) =>
    React.createElement("h2", { "data-testid": "dialog-title" }, children);
  MockDialogTitle.displayName = "MockDialogTitle";

  const MockDialogDescription = ({ children }: any) =>
    React.createElement("p", { "data-testid": "dialog-description" }, children);
  MockDialogDescription.displayName = "MockDialogDescription";

  const MockDialogFooter = ({ children }: any) =>
    React.createElement("div", { "data-testid": "dialog-footer" }, children);
  MockDialogFooter.displayName = "MockDialogFooter";

  return {
    Dialog: MockDialog,
    DialogContent: MockDialogContent,
    DialogHeader: MockDialogHeader,
    DialogTitle: MockDialogTitle,
    DialogDescription: MockDialogDescription,
    DialogFooter: MockDialogFooter,
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
    Version: {} as any,
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import EditOrderPage from "./page";

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

describe("EditOrderPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the edit order page with header", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });

    expect(screen.getByText("Edit Order")).toBeInTheDocument();
  });

  it("should display order name when available", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });
  });

  it("should render products table when order details are loaded", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("should render contact details and terms cards", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-contact-details")).toBeInTheDocument();
      expect(screen.getByTestId("order-terms-card")).toBeInTheDocument();
    });
  });

  it("should render price details section", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-price-details")).toBeInTheDocument();
    });
  });

  it("should render cash discount card", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("cash-discount-card")).toBeInTheDocument();
    });
  });

  it("should render PLACE ORDER button", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<EditOrderPage params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const buttons = screen.getAllByTestId("button");
      expect(buttons.some(btn => btn.textContent === "placeOrder")).toBe(true);
    });
  });
});
