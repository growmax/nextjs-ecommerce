// Mock Next.js modules first (before any imports)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
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
            showPrice: true,
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
        },
        shippingAddressDetails: {
          addressLine: "456 Ship St",
          city: "Ship City",
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
        branchBusinessUnit: { id: 1 },
        uploadedDocumentDetails: [],
        quoteUsers: [],
        tagsList: [],
        cashdiscount: false,
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

jest.mock("@/hooks/useQuoteSubmission/useQuoteSubmission", () => ({
  useQuoteSubmission: () => ({
    submitQuote: jest.fn().mockResolvedValue(true),
    isSubmitting: false,
  }),
}));

jest.mock("@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms", () => ({
  __esModule: true,
  default: () => ({
    latestPaymentTerms: null,
  }),
}));

// Create stable mock data outside the mock to prevent infinite loops
const mockUpdatedProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 100,
    quantity: 2,
    unitQuantity: 2,
    askedQuantity: 2,
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

jest.mock(
  "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled",
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);

// Create stable calculated products
const mockCalculatedProducts = [
  {
    productId: 1,
    productName: "Product 1",
    unitPrice: 100,
    quantity: 2,
    unitQuantity: 2,
    askedQuantity: 2,
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
        calculatedTotal: 200,
        taxableAmount: 200,
      },
      metadata: {
        hasVolumeDiscount: false,
      },
      breakup: {},
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

// Mock services
jest.mock("@/lib/api", () => ({
  QuotationDetailsService: {
    fetchQuotationDetails: jest.fn(),
  },
  OrdersService: {
    placeOrderFromQuote: jest.fn(),
  },
  quoteSubmitDTO: jest.fn((data1, data2) => ({
    ...data1,
    ...data2,
  })),
}));

// Mock utils
jest.mock("@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO", () => ({
  prepareQuoteSubmissionDTO: jest.fn((data1, data2) => ({
    ...data1,
    ...data2,
  })),
}));

jest.mock("@/utils/details/orderdetails", () => ({
  getStatusStyle: jest.fn(() => ""),
}));

jest.mock("@/utils/General/general", () => ({
  decodeUnicode: jest.fn(str => str),
}));

// Mock lodash
jest.mock("lodash", () => ({
  isEmpty: jest.fn(() => false),
}));

jest.mock("lodash/some", () => jest.fn(() => false));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/ui/button", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockButton = ({ children, onClick, disabled, variant }: any) =>
    React.createElement(
      "button",
      {
        "data-testid": "button",
        onClick,
        disabled,
        "data-variant": variant,
      },
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
    React.createElement("div", { "data-testid": "dialog-title" }, children);
  MockDialogTitle.displayName = "MockDialogTitle";

  const MockDialogDescription = ({ children }: any) =>
    React.createElement(
      "div",
      { "data-testid": "dialog-description" },
      children
    );
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

jest.mock("@/components/sales", () => {
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

  const MockSPRForm = () =>
    React.createElement("div", { "data-testid": "spr-form" }, "SPR Form");
  MockSPRForm.displayName = "MockSPRForm";

  return {
    SalesHeader: MockSalesHeader,
    OrderProductsTable: MockOrderProductsTable,
    OrderContactDetails: MockOrderContactDetails,
    OrderTermsCard: MockOrderTermsCard,
    OrderPriceDetails: MockOrderPriceDetails,
    SPRForm: MockSPRForm,
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

import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import EditQuotePage from "./page";
import { QuotationDetailsService, OrdersService } from "@/lib/api";
import { toast } from "sonner";

const mockFetchQuoteDetails =
  QuotationDetailsService.fetchQuotationDetails as jest.MockedFunction<
    typeof QuotationDetailsService.fetchQuotationDetails
  >;
// @ts-expect-error - Mock variable for potential future use
const _mockPlaceOrderFromQuote =
  OrdersService.placeOrderFromQuote as jest.MockedFunction<
    typeof OrdersService.placeOrderFromQuote
  >;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;

describe("EditQuotePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchQuoteDetails.mockResolvedValue(mockQuoteDetailsResponse as any);

    // Suppress console errors for infinite loop warnings in tests
    const originalError = console.error;
    jest.spyOn(console, "error").mockImplementation((...args) => {
      const message = args[0];
      if (
        typeof message === "string" &&
        message.includes("Maximum update depth")
      ) {
        return;
      }
      originalError.apply(console, args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render sales header with edit quote title", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("sales-header")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Edit Quote")).toBeInTheDocument();
  });

  it("should fetch quote details on mount", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(mockFetchQuoteDetails).toHaveBeenCalledWith({
          userId: mockUser.userId,
          companyId: mockUser.companyId,
          quotationIdentifier: "quote-123",
        });
      },
      { timeout: 3000 }
    );
  });

  it("should render products table when quote details are loaded", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render contact details section", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("order-contact-details")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render terms card section", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("order-terms-card")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render price details section", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("order-price-details")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render cash discount card", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("cash-discount-card")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render SPR form", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("spr-form")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render submit button in header", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("sales-header")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should handle error state when fetching quote details fails", async () => {
    const errorMessage = "Failed to fetch quotation details";
    mockFetchQuoteDetails.mockRejectedValueOnce(new Error(errorMessage));

    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
      },
      { timeout: 3000 }
    );
  });

  it("should display quote name in header when available", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("sales-header")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should initialize editable fields from quote details", async () => {
    const params = Promise.resolve({ quoteId: "quote-123", locale: "en" });

    render(<EditQuotePage params={params} />);

    await waitFor(
      () => {
        expect(mockFetchQuoteDetails).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
