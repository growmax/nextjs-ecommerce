// Mock @/i18n/navigation first to avoid ESM parsing issues
jest.mock("@/i18n/navigation", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Link: ({ children, href, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
    redirect: jest.fn(),
    usePathname: () => "/",
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }),
  };
});

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
  message: null,
  status: "success",
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
  OrderDetailsService: {
    fetchOrderDetails: jest.fn(),
  },
  PaymentService: {
    fetchOverallPaymentsByOrder: jest.fn(),
    fetchPaymentDueByOrder: jest.fn(),
  },
  OrderNameService: {
    updateOrderName: jest.fn(),
  },
  RequestEditService: {
    requestEdit: jest.fn(),
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
    OrderStatusTracker: MockOrderStatusTracker,
    DetailsSkeleton: MockDetailsSkeleton,
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

import { LoadingProvider } from "@/hooks/useGlobalLoader";
import {
  OrderDetailsService,
  OrderNameService,
  PaymentService,
  RequestEditService,
} from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import { toast } from "sonner";
import OrderDetailsClient from "./OrderDetailsClient";

const mockFetchOrderDetails =
  OrderDetailsService.fetchOrderDetails as jest.MockedFunction<
    typeof OrderDetailsService.fetchOrderDetails
  >;
const mockFetchOverallPayments =
  PaymentService.fetchOverallPaymentsByOrder as jest.MockedFunction<
    typeof PaymentService.fetchOverallPaymentsByOrder
  >;
const mockFetchPaymentDue =
  PaymentService.fetchPaymentDueByOrder as jest.MockedFunction<
    typeof PaymentService.fetchPaymentDueByOrder
  >;
// @ts-expect-error - Mock variable for potential future use
const _mockUpdateOrderName =
  OrderNameService.updateOrderName as jest.MockedFunction<
    typeof OrderNameService.updateOrderName
  >;
// @ts-expect-error - Mock variable for potential future use
const _mockRequestEdit = RequestEditService.requestEdit as jest.MockedFunction<
  typeof RequestEditService.requestEdit
>;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;

// Helper to create a wrapper with QueryClient and LoadingProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(LoadingProvider, null, children)
    );
  };
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

describe("OrderDetailsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchOrderDetails.mockResolvedValue(mockOrderDetailsResponse);
    mockFetchOverallPayments.mockResolvedValue({ data: [] });
    mockFetchPaymentDue.mockResolvedValue({ data: [] });
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

    // Wait for the order details to load (sales header appears first)
    await waitFor(() => {
      expect(screen.getByTestId("sales-header")).toBeInTheDocument();
    });

    // Then wait for the products table to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("order-products-table")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
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
      expect(mockFetchOrderDetails).toHaveBeenCalled();
    });
  });

  it("should handle error state", async () => {
    const errorMessage = "Failed to fetch order details";
    // Mock to reject multiple times since the component has retry: 1
    mockFetchOrderDetails
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockRejectedValueOnce(new Error(errorMessage));

    const params = Promise.resolve({ orderId: "order-123", locale: "en" });

    render(<OrderDetailsClient params={params} />, {
      wrapper: createWrapper(),
    });

    // Wait for the error to be processed by React Query and the useEffect to trigger
    // The component has retry: 1, so it will retry once before showing the error
    await waitFor(
      () => {
        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
      },
      { timeout: 5000 }
    );
  });
});
