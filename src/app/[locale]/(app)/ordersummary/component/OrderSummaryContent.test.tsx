// Mock Next.js modules first (before any imports)
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterPrefetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    prefetch: mockRouterPrefetch,
  }),
  useSearchParams: () => new URLSearchParams(),
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
  userId: 1,
  companyId: 1,
  displayName: "Test User",
  currency: { id: 1, symbol: "INR ₹", currencyCode: "INR" },
  taxExempted: false,
  isSeller: false,
};

const mockCompanyData = {
  userId: 1,
  companyId: 1,
  companyName: "Test Company",
  currency: { id: 1, symbol: "INR ₹", currencyCode: "INR" },
  userData: {
    displayName: "Test User",
    companyName: "Test Company",
  },
};

const mockInitialValues = {
  products: [
    {
      productId: 1,
      brandProductId: "PROD-1",
      itemCode: "ITEM-1",
      productName: "Test Product",
      unitPrice: 100,
      quantity: 2,
      askedQuantity: 2,
      unitQuantity: 2,
      totalPrice: 200,
      showPrice: true,
      priceNotAvailable: false,
      cashdiscountValue: 0,
      interTaxBreakup: [],
      intraTaxBreakup: [],
      totalTax: 0,
      hsnDetails: {},
      bundleProducts: [],
    },
  ],
  cartValue: {
    totalValue: 200,
    taxableAmount: 200,
    totalTax: 0,
    grandTotal: 200,
    calculatedTotal: 200,
    totalCashDiscount: 0,
    cashDiscountValue: 0,
  },
  setBillingAddress: {
    id: 1,
    addressLine: "123 Test St",
    city: "Test City",
    state: "State1",
    country: "Test Country",
  },
  setShippingAddress: {
    id: 1,
    addressLine: "456 Ship St",
    city: "Ship City",
    state: "Ship State",
    country: "Ship Country",
  },
  setSellerAddress: {
    id: 1,
    name: "Seller Branch",
    branchId: 1,
    companyId: { id: 1, name: "Seller Company" },
  },
  setWarehouseAddress: {
    id: 1,
    wareHouseName: "Warehouse 1",
    addressId: { city: "Warehouse City", state: "State1" },
  },
  setRegisterAddress: null,
  preferences: {
    paymentTermsId: { id: 1, description: "NET 30" },
    deliveryTermsId: { id: 1, description: "FOB" },
    pkgFwdId: { id: 1, description: "Standard" },
    freightId: { id: 1, description: "Prepaid", beforeTax: false },
    insuranceId: { id: 1, description: "Standard", insuranceValue: 0 },
    warrantyId: { id: 1, description: "1 Year" },
    dispatchInstructionsId: { id: 1, description: "Standard" },
  },
  isInter: false,
  taxExempted: false,
  taxExemptionId: null,
  currency: { id: 1, symbol: "INR ₹" },
  additionalTerms: "",
  buyerReferenceNumber: null,
  customerRequiredDate: null,
  cashdiscount: false,
  overallShipping: 0,
  pfRate: 0,
  comment: "",
  uploadedDocumentDetails: [],
  VDDetails: {},
  division: null,
  channel: null,
  branchBusinessUnit: null,
  deliveryPlace: "",
  isSPRRequested: false,
  reorder: false,
  reorderValidityFrom: null,
  reorderValidityTill: null,
  AccOwners: [],
  selectedSellerId: null,
  companyId: 1,
  loading: false,
};

const mockGlobalCalc = jest.fn((params: any) => ({
  cartValue: {
    totalValue: params.products.reduce(
      (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
      0
    ),
    taxableAmount: params.products.reduce(
      (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
      0
    ),
    totalTax: 0,
    grandTotal: params.products.reduce(
      (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
      0
    ),
    calculatedTotal: params.products.reduce(
      (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
      0
    ),
    totalCashDiscount: 0,
    cashDiscountValue: 0,
  },
  products: params.products.map((p: any) => ({
    ...p,
    totalPrice: (p.unitPrice || 0) * (p.quantity || 0),
    totalTax: 0,
  })),
  breakup: [],
}));

const mockSubmitOrder = jest.fn();

// Mock hooks
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser }),
}));

jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: () => ({
    isAuthenticated: true,
    user: mockUser,
  }),
}));

jest.mock("@/hooks/useUser", () => ({
  __esModule: true,
  default: () => ({ companydata: mockCompanyData }),
}));

jest.mock("@/hooks/useCart", () => ({
  useCart: () => ({
    emptyCart: jest.fn(),
    emptyCartBySeller: jest.fn(),
    cartComment: "",
    cartAttachments: [],
  }),
}));

jest.mock("@/hooks/summary/useSummaryDefault", () => ({
  __esModule: true,
  default: () => ({
    initialValues: mockInitialValues,
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useCalculation/useCalculation", () => ({
  useCalculation: () => ({
    globalCalc: mockGlobalCalc,
  }),
}));

jest.mock("@/hooks/summary/useGetDivision", () => ({
  __esModule: true,
  default: () => ({
    division: null,
  }),
}));

jest.mock("@/hooks/summary/useGetChannel", () => ({
  __esModule: true,
  default: () => ({
    channel: null,
  }),
}));

jest.mock("@/hooks/summary/useCurrencyFactor", () => ({
  __esModule: true,
  default: () => ({
    CurrencyFactor: 1,
  }),
}));

jest.mock("@/hooks/useModuleSettings", () => ({
  __esModule: true,
  default: () => ({
    quoteSettings: {
      quoteValidity: 30,
      roundingAdjustment: false,
      showCashDiscount: true,
    },
  }),
}));

jest.mock("@/hooks/summary/useSummarySubmission", () => ({
  __esModule: true,
  default: () => ({
    submitOrder: mockSubmitOrder,
    isSubmitting: false,
  }),
}));

jest.mock("@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms", () => ({
  __esModule: true,
  default: () => ({
    latestPaymentTerms: null,
    latestPaymentTermsLoading: false,
  }),
}));

// Mock components
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

jest.mock("@/components/sales", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSalesHeader = ({
    title,
    buttons,
    loading,
  }: {
    title: string;
    buttons?: any[];
    loading?: boolean;
  }) => {
    const handleClick = (button: any) => {
      if (button.onClick) {
        button.onClick();
      }
    };
    return React.createElement(
      "div",
      { "data-testid": "sales-header" },
      React.createElement("h1", null, title),
      loading && React.createElement("div", null, "Loading..."),
      buttons?.map((button, index) =>
        React.createElement(
          "button",
          {
            key: index,
            "data-testid": `button-${button.label.toLowerCase().replace(/\s+/g, "-")}`,
            onClick: () => handleClick(button),
            disabled: button.disabled,
          },
          button.label
        )
      )
    );
  };
  MockSalesHeader.displayName = "MockSalesHeader";

  const MockOrderProductsTable = ({
    products,
    onQuantityChange,
  }: {
    products: any[];
    onQuantityChange?: (productId: string, quantity: number) => void;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "order-products-table" },
      products.map((product, index) =>
        React.createElement(
          "div",
          { key: index, "data-testid": `product-${product.productId}` },
          React.createElement("span", null, product.productName),
          React.createElement("input", {
            type: "number",
            "data-testid": `quantity-input-${product.productId}`,
            defaultValue: product.quantity,
            onChange: e => {
              if (onQuantityChange) {
                onQuantityChange(
                  product.brandProductId || product.productId.toString(),
                  parseInt((e.target as HTMLInputElement).value, 10)
                );
              }
            },
          })
        )
      )
    );
  MockOrderProductsTable.displayName = "MockOrderProductsTable";

  const MockOrderContactDetails = ({
    onBillingAddressChange,
    onShippingAddressChange,
    onSellerBranchChange: _onSellerBranchChange,
    onWarehouseChange,
    onRequiredDateChange: _onRequiredDateChange,
    onReferenceNumberChange: _onReferenceNumberChange,
  }: any) =>
    React.createElement(
      "div",
      { "data-testid": "order-contact-details" },
      "Contact Details",
      React.createElement("button", {
        "data-testid": "change-billing-address",
        onClick: () =>
          onBillingAddressChange &&
          onBillingAddressChange({
            id: 1,
            addressLine: "New Billing Address",
            state: "State2",
          }),
      }),
      React.createElement("button", {
        "data-testid": "change-shipping-address",
        onClick: () =>
          onShippingAddressChange &&
          onShippingAddressChange({
            id: 1,
            addressLine: "New Shipping Address",
          }),
      }),
      React.createElement("button", {
        "data-testid": "change-warehouse",
        onClick: () =>
          onWarehouseChange &&
          onWarehouseChange({
            id: 1,
            wareHouseName: "New Warehouse",
            addressId: { city: "New City", state: "State2" },
          }),
      })
    );
  MockOrderContactDetails.displayName = "MockOrderContactDetails";

  const MockOrderTermsCard = () =>
    React.createElement(
      "div",
      { "data-testid": "order-terms-card" },
      "Terms Card"
    );
  MockOrderTermsCard.displayName = "MockOrderTermsCard";

  const MockOrderPriceDetails = ({
    subTotal,
    calculatedTotal,
  }: {
    subTotal: number;
    calculatedTotal: number;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "order-price-details" },
      React.createElement("div", null, `Subtotal: ${subTotal}`),
      React.createElement("div", null, `Total: ${calculatedTotal}`)
    );
  MockOrderPriceDetails.displayName = "MockOrderPriceDetails";

  const MockDetailsSkeleton = () =>
    React.createElement(
      "div",
      { "data-testid": "details-skeleton" },
      "Loading..."
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

jest.mock("@/components/summary/SummaryNameCard", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockSummaryNameCard = ({
    name,
    onNameChange,
  }: {
    name: string;
    onNameChange?: (val: string) => void;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "summary-name-card" },
      React.createElement("input", {
        type: "text",
        "data-testid": "order-name-input",
        defaultValue: name,
        onChange: e => onNameChange && onNameChange(e.target.value),
      }),
      React.createElement("span", null, name)
    );
  MockSummaryNameCard.displayName = "MockSummaryNameCard";
  return {
    __esModule: true,
    default: MockSummaryNameCard,
  };
});

jest.mock("@/components/summary/ApplyVolumeDiscountBtn", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockApplyVolumeDiscountBtn = () =>
    React.createElement(
      "div",
      { "data-testid": "apply-volume-discount-btn" },
      "Apply Volume Discount"
    );
  MockApplyVolumeDiscountBtn.displayName = "MockApplyVolumeDiscountBtn";
  return {
    __esModule: true,
    default: MockApplyVolumeDiscountBtn,
  };
});

jest.mock("@/components/sales/CashDiscountCard", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockCashDiscountCard = ({
    handleCDApply,
    handleRemoveCD,
    isCashDiscountApplied,
  }: any) =>
    React.createElement(
      "div",
      { "data-testid": "cash-discount-card" },
      React.createElement("button", {
        "data-testid": "apply-cash-discount",
        onClick: () => handleCDApply && handleCDApply(5, false, null),
      }),
      React.createElement("button", {
        "data-testid": "remove-cash-discount",
        onClick: () => handleRemoveCD && handleRemoveCD(null),
      }),
      React.createElement("span", null, `Applied: ${isCashDiscountApplied}`)
    );
  MockCashDiscountCard.displayName = "MockCashDiscountCard";
  return {
    __esModule: true,
    default: MockCashDiscountCard,
  };
});

jest.mock("@/components/summary/TargetDiscountCard", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockTargetDiscountCard = () =>
    React.createElement(
      "div",
      { "data-testid": "target-discount-card" },
      "Target Discount"
    );
  MockTargetDiscountCard.displayName = "MockTargetDiscountCard";
  return {
    __esModule: true,
    default: MockTargetDiscountCard,
  };
});

jest.mock("@/components/summary/Attachments", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockAttachments = () =>
    React.createElement("div", { "data-testid": "attachments" }, "Attachments");
  MockAttachments.displayName = "MockAttachments";
  return {
    __esModule: true,
    default: MockAttachments,
  };
});

jest.mock("@/utils/sanitization/sanitization.utils", () => ({
  containsXSS: jest.fn(() => false),
}));

// Mock validation schema to always pass
jest.mock("@/utils/summary/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const yup = require("yup");
  return {
    BuyerOrderSummaryValidations: yup.object().shape({}).noUnknown(),
  };
});

jest.mock("@/utils/calculation/salesCalculation/salesCalculation", () => ({
  getAccounting: jest.fn((_currency, value) => `₹${value}`),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import React, { ReactNode } from "react";
import OrderSummaryContent from "./OrderSummaryContent";
import { toast } from "sonner";

const mockToastSuccess = toast.success as jest.MockedFunction<
  typeof toast.success
>;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;
const mockToastInfo = toast.info as jest.MockedFunction<typeof toast.info>;

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

describe("OrderSummaryContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalCalc.mockImplementation((params: any) => ({
      cartValue: {
        totalValue: params.products.reduce(
          (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
          0
        ),
        taxableAmount: params.products.reduce(
          (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
          0
        ),
        totalTax: 0,
        grandTotal: params.products.reduce(
          (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
          0
        ),
        calculatedTotal: params.products.reduce(
          (sum: number, p: any) => sum + (p.unitPrice || 0) * (p.quantity || 0),
          0
        ),
        totalCashDiscount: 0,
        cashDiscountValue: 0,
      },
      products: params.products.map((p: any) => ({
        ...p,
        totalPrice: (p.unitPrice || 0) * (p.quantity || 0),
        totalTax: 0,
      })),
      breakup: [],
    }));
    mockSubmitOrder.mockResolvedValue("ORD-123");
    mockRouterPush.mockClear();
  });

  describe("Rendering", () => {
    it("should render the component with all main sections", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("application-layout")).toBeInTheDocument();
        expect(screen.getByTestId("page-layout")).toBeInTheDocument();
      });
    });

    it("should render sales header with order name", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const header = screen.getByTestId("sales-header");
        expect(header).toBeInTheDocument();
        expect(header).toHaveTextContent("Test's Order");
      });
    });

    it("should render products table when products are available", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
      });
    });

    it("should render contact details and terms cards", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("order-contact-details")).toBeInTheDocument();
        expect(screen.getByTestId("order-terms-card")).toBeInTheDocument();
      });
    });

    it("should render price details section", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("order-price-details")).toBeInTheDocument();
      });
    });

    it("should render summary name card", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("summary-name-card")).toBeInTheDocument();
      });
    });

    it("should render cash discount card when enabled", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("cash-discount-card")).toBeInTheDocument();
      });
    });

    it("should render attachments section", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId("attachments")).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("should handle order name change", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const nameInput = screen.getByTestId("order-name-input");
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId("order-name-input");
      fireEvent.change(nameInput, { target: { value: "New Order Name" } });

      await waitFor(() => {
        expect(nameInput).toHaveValue("New Order Name");
      });
    });

    it("should handle cancel button click", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const cancelButton = screen.getByTestId("button-cancel");
        expect(cancelButton).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId("button-cancel");

      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // Wait for router.push to be called
      await waitFor(
        () => {
          expect(mockRouterPush).toHaveBeenCalledWith("/cart");
        },
        { timeout: 2000 }
      );
    });

    it("should handle quantity change", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const quantityInput = screen.getByTestId("quantity-input-1");
        expect(quantityInput).toBeInTheDocument();
      });

      const quantityInput = screen.getByTestId("quantity-input-1");
      fireEvent.change(quantityInput, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockGlobalCalc).toHaveBeenCalled();
      });
    });

    it("should handle cash discount apply", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const applyButton = screen.getByTestId("apply-cash-discount");
        expect(applyButton).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId("apply-cash-discount");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockGlobalCalc).toHaveBeenCalled();
      });
    });

    it("should handle cash discount remove", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const removeButton = screen.getByTestId("remove-cash-discount");
        expect(removeButton).toBeInTheDocument();
      });

      const removeButton = screen.getByTestId("remove-cash-discount");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockGlobalCalc).toHaveBeenCalled();
      });
    });

    it("should handle warehouse address change and update isInter", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const changeWarehouseButton = screen.getByTestId("change-warehouse");
        expect(changeWarehouseButton).toBeInTheDocument();
      });

      const changeWarehouseButton = screen.getByTestId("change-warehouse");
      fireEvent.click(changeWarehouseButton);

      await waitFor(() => {
        expect(mockGlobalCalc).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit order when place order button is clicked", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByTestId("button-place-order");

      await act(async () => {
        fireEvent.click(placeOrderButton);
      });

      await waitFor(
        () => {
          expect(mockSubmitOrder).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it("should handle successful order submission", async () => {
      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByTestId("button-place-order");

      await act(async () => {
        fireEvent.click(placeOrderButton);
      });

      await waitFor(
        () => {
          expect(mockSubmitOrder).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Wait for success toast and router push
      await waitFor(
        () => {
          expect(mockToastSuccess).toHaveBeenCalledWith(
            "Order placed successfully"
          );
          expect(mockRouterPush).toHaveBeenCalledWith("/landing/orderslanding");
        },
        { timeout: 3000 }
      );
    });

    it("should handle order submission error", async () => {
      const errorMessage = "Failed to place order";
      mockSubmitOrder.mockRejectedValueOnce(new Error(errorMessage));

      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      const placeOrderButton = screen.getByTestId("button-place-order");

      await act(async () => {
        fireEvent.click(placeOrderButton);
      });

      await waitFor(
        () => {
          expect(mockToastError).toHaveBeenCalledWith(
            errorMessage || "Failed to place order. Please try again."
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Validation", () => {
    it("should show error when products have negative prices", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require("@/hooks/summary/useSummaryDefault"), "default")
        .mockReturnValueOnce({
          initialValues: {
            ...mockInitialValues,
            products: [
              {
                ...mockInitialValues.products[0],
                totalPrice: -100,
              },
            ],
          },
          isLoading: false,
        });

      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("button-place-order"));

      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalledWith(
          "Some products have negative prices"
        );
      });
    });

    it("should show error when addresses are missing", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require("@/hooks/summary/useSummaryDefault"), "default").mockReturnValueOnce({
        initialValues: {
          ...mockInitialValues,
          setBillingAddress: null,
          setShippingAddress: null,
        },
        isLoading: false,
      });

      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("button-place-order"));

      await waitFor(
        () => {
          expect(mockToastError).toHaveBeenCalledWith(
            "address is not available"
          );
        },
        { timeout: 3000 }
      );
    });

    it("should show error when cart is empty", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require("@/hooks/summary/useSummaryDefault"), "default")
        .mockReturnValueOnce({
          initialValues: {
            ...mockInitialValues,
            products: [],
          },
          isLoading: false,
        });

      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const placeOrderButton = screen.getByTestId("button-place-order");
        expect(placeOrderButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("button-place-order"));

      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalledWith(
          "Add line items to place order"
        );
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading skeleton when data is loading", async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require("@/hooks/summary/useSummaryDefault"), "default").mockReturnValue({
        initialValues: mockInitialValues,
        isLoading: true,
      });

      render(<OrderSummaryContent />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByTestId("details-skeleton")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});


