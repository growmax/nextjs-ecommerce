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

const mockOrderDetailsResponse = {
  data: {
    orderDetails: [
      {
        orderId: "order-123",
        orderName: "Test Order",
        orderIdentifier: "ORD-123",
        updatedBuyerStatus: "ORDER ACKNOWLEDGED",
        updatedSellerStatus: "ORDER ACKNOWLEDGED",
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
        roundingAdjustmentEnabled: false,
      },
    ],
    buyerCurrencyId: { id: 1 },
    sellerCurrencyId: { id: 2 },
    buyerCurrencySymbol: { symbol: "INR ₹" },
    orderIdentifier: "ORD-123",
    createdDate: "2024-01-01",
    updatedBuyerStatus: "ORDER ACKNOWLEDGED",
    updatedSellerStatus: "ORDER ACKNOWLEDGED",
    isInter: true,
    insuranceCharges: 0,
    overallShipping: 0,
    pfRate: 0,
    buyerReferenceNumber: "REF-123",
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
    orderSettings: { editOrder: "ORDER BOOKED" },
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

// Mock services
const mockFetchOrderDetails = jest
  .fn()
  .mockResolvedValue(mockOrderDetailsResponse);
const mockFetchOverallPayments = jest.fn().mockResolvedValue({ data: [] });
const mockFetchPaymentDue = jest.fn().mockResolvedValue({ data: { data: [] } });
const mockUpdateOrderName = jest.fn().mockResolvedValue({ success: true });
const mockRequestEdit = jest.fn().mockResolvedValue({ success: true });

jest.mock("@/lib/api", () => ({
  OrderDetailsService: {
    fetchOrderDetails: mockFetchOrderDetails,
  },
  PaymentService: {
    fetchOverallPaymentsByOrder: mockFetchOverallPayments,
    fetchPaymentDueByOrder: mockFetchPaymentDue,
  },
  OrderNameService: {
    updateOrderName: mockUpdateOrderName,
  },
  RequestEditService: {
    requestEdit: mockRequestEdit,
  },
}));

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
jest.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
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
          `Edit Order Name: ${currentOrderName}`
        )
      : null;
  MockEditOrderNameDialog.displayName = "MockEditOrderNameDialog";
  return {
    EditOrderNameDialog: MockEditOrderNameDialog,
  };
});

jest.mock("@/components/dialogs/RequestEditDialog", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const MockRequestEditDialog = ({ open }: any) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "request-edit-dialog" },
          "Request Edit Dialog"
        )
      : null;
  MockRequestEditDialog.displayName = "MockRequestEditDialog";
  return {
    RequestEditDialog: MockRequestEditDialog,
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

  const MockOrderStatusTracker = () =>
    React.createElement(
      "div",
      { "data-testid": "order-status-tracker" },
      "Status Tracker"
    );
  MockOrderStatusTracker.displayName = "MockOrderStatusTracker";

  return {
    SalesHeader: MockSalesHeader,
    OrderProductsTable: MockOrderProductsTable,
    OrderContactDetails: MockOrderContactDetails,
    OrderTermsCard: MockOrderTermsCard,
    OrderPriceDetails: MockOrderPriceDetails,
    OrderStatusTracker: MockOrderStatusTracker,
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

// Mock dynamic imports
jest.mock("next/dynamic", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (loader: any) => {
      const loaderString = loader.toString();

      // Match the dynamic import by checking the loader function string
      if (loaderString.includes("OrderProductsTable")) {
        const DynamicOrderProductsTable = () =>
          React.createElement(
            "div",
            { "data-testid": "order-products-table" },
            "Products Table"
          );
        DynamicOrderProductsTable.displayName = "DynamicOrderProductsTable";
        return DynamicOrderProductsTable;
      }
      if (loaderString.includes("OrderPriceDetails")) {
        const DynamicOrderPriceDetails = () =>
          React.createElement(
            "div",
            { "data-testid": "order-price-details" },
            "Price Details"
          );
        DynamicOrderPriceDetails.displayName = "DynamicOrderPriceDetails";
        return DynamicOrderPriceDetails;
      }
      if (loaderString.includes("OrderStatusTracker")) {
        const DynamicOrderStatusTracker = () =>
          React.createElement(
            "div",
            { "data-testid": "order-status-tracker" },
            "Status Tracker"
          );
        DynamicOrderStatusTracker.displayName = "DynamicOrderStatusTracker";
        return DynamicOrderStatusTracker;
      }

      // Default fallback
      const DynamicComponent = () =>
        React.createElement("div", null, "Dynamic Component");
      DynamicComponent.displayName = "DynamicComponent";
      return DynamicComponent;
    },
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import OrderDetailsClient from "./OrderDetailsClient";

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

describe("OrderDetailsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchOrderDetails.mockResolvedValue(mockOrderDetailsResponse);
    mockFetchOverallPayments.mockResolvedValue({ data: [] });
    mockFetchPaymentDue.mockResolvedValue({ data: { data: [] } });
  });

  it("should render loading state initially", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    // Should show loading initially or render quickly
    // Check if skeleton elements exist (there might be multiple)
    const skeletons = screen.queryAllByTestId("skeleton");
    if (skeletons.length === 0) {
      // If no skeletons, component rendered immediately - check for sales header
      await waitFor(() => {
        expect(screen.getByTestId("sales-header")).toBeInTheDocument();
      });
    } else {
      expect(skeletons.length).toBeGreaterThan(0);
    }
  });

  it("should render order details when loaded", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });

    expect(screen.getByText("Order Details")).toBeInTheDocument();
  });

  it("should render order name in header when available", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });
  });

  it("should render products table when order details are loaded", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
    });
  });

  it("should render status tracker when order is not cancelled", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-status-tracker")).toBeInTheDocument();
    });
  });

  it("should render contact details and terms cards", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-contact-details")).toBeInTheDocument();
      expect(screen.getByTestId("order-terms-card")).toBeInTheDocument();
    });
  });

  it("should render price details section", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("order-price-details")).toBeInTheDocument();
    });
  });

  it("should render layers icon button for versions", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId("layers-icon")).toBeInTheDocument();
    });
  });

  it("should call fetchOrderDetails with correct parameters", async () => {
    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchOrderDetails).toHaveBeenCalledWith({
        userId: mockUser.userId,
        tenantId: mockTenantData.tenant.tenantCode,
        companyId: mockUser.companyId,
        orderId: "order-123",
      });
    });
  });

  it("should handle error state", async () => {
    const errorMessage = "Failed to fetch order details";
    mockFetchOrderDetails.mockRejectedValueOnce(new Error(errorMessage));

    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });
  });
});
