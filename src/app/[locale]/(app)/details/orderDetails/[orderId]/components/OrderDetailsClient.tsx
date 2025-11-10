"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Layers } from "lucide-react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import { RequestEditDialog } from "@/components/dialogs/RequestEditDialog";
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import {
  OrderContactDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useOrderDetails } from "@/hooks/details/orderdetails/useOrderDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useTenantData } from "@/hooks/useTenantData";
import type {
  OrderDetailsResponse,
  PaymentDueDataItem,
  PaymentHistoryItem,
} from "@/lib/api";
import {
  OrderDetailsService,
  OrderNameService,
  PaymentService,
  RequestEditService,
} from "@/lib/api";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";
import type {
  AddressDetails,
  OrderDetailsPageProps,
  OrderTerms,
  SelectedVersion,
} from "@/types/details/orderdetails/index.types";
import { zoneDateTimeCalculator } from "@/utils/date-format";
import {
  getLastDateToPay,
  getStatusStyle,
  getUserPreferences,
  isEditInProgress,
  isOrderCancelled,
} from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/general";

// Dynamic imports for heavy components
// Import from index.ts which re-exports as named exports
const OrderProductsTable = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderProductsTable),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
);

const OrderPriceDetails = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderPriceDetails),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

const OrderStatusTracker = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderStatusTracker),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

export default function OrderDetailsClient({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const locale = useLocale();

  const [orderId, setOrderId] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [requestEditDialogOpen, setRequestEditDialogOpen] = useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<SelectedVersion | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [paymentDueData, setPaymentDueData] = useState<PaymentDueDataItem[]>(
    []
  );

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

  // Get user preferences using utility
  const preferences = getUserPreferences();

  // Calculate total paid from payment history
  const totalPaid = paymentHistory.reduce(
    (sum, item) => sum + (item.amountReceived || 0),
    0
  );

  // Prevent duplicate fetches for the same identifiers (helps with StrictMode double effects)
  const lastFetchKeyRef = useRef<string | null>(null);

  // Derive only primitive dependencies to satisfy exhaustive-deps
  const userId = user?.userId;
  const companyId = user?.companyId;
  const tenantCode = tenantData?.tenant?.tenantCode;

  // Load params asynchronously
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
      setParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Wait for params, user and tenant data to be available
      if (!paramsLoaded || !orderId || !userId || !tenantCode || !companyId) {
        return;
      }

      // Build a stable key from primitives only
      const fetchKey = [orderId, userId, companyId, tenantCode].join("|");

      // Skip if we've already fetched for this exact key (prevents duplicate calls in dev)
      if (lastFetchKeyRef.current === fetchKey) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await OrderDetailsService.fetchOrderDetails({
          userId,
          tenantId: tenantCode,
          companyId,
          orderId,
        });

        setOrderDetails(response);
        lastFetchKeyRef.current = fetchKey;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch order details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paramsLoaded, orderId, userId, companyId, tenantCode]);

  // Fetch overall payments when order details are loaded
  useEffect(() => {
    const fetchPayments = async () => {
      if (!orderId || !orderDetails) {
        setPaymentHistory([]);
        return;
      }

      try {
        const response =
          await PaymentService.fetchOverallPaymentsByOrder(orderId);
        const items = Array.isArray(response?.data) ? response.data : [];
        setPaymentHistory(items);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
        setPaymentHistory([]);
      }
    };

    fetchPayments();
  }, [orderId, orderDetails]);

  // Fetch payment due details when order details are loaded
  useEffect(() => {
    const fetchPaymentDue = async () => {
      if (!orderId || !orderDetails) {
        setPaymentDueData([]);
        return;
      }

      try {
        const response = await PaymentService.fetchPaymentDueByOrder(orderId);
        // Handle nested response structure from API (data.data.data)
        let data: PaymentDueDataItem[] = [];
        if (response && typeof response === "object") {
          // Try different nested structures
          if (
            "data" in response &&
            response.data &&
            typeof response.data === "object" &&
            "data" in response.data &&
            Array.isArray((response.data as { data: unknown }).data)
          ) {
            data = (response.data as { data: PaymentDueDataItem[] }).data;
          } else if ("data" in response && Array.isArray(response.data)) {
            data = response.data;
          } else if (Array.isArray(response)) {
            data = response;
          }
        }
        setPaymentDueData(data);
      } catch (err) {
        console.error("Failed to fetch payment due details:", err);
        setPaymentDueData([]);
      }
    };

    fetchPaymentDue();
  }, [orderId, orderDetails]);

  // Use custom hook for order details logic
  const {
    versions: orderVersions,
    orderIdentifier,
    orderVersion,
  } = useOrderDetails({
    orderDetails,
    orderId,
    selectedVersion,
  });

  const { data: versionData, isLoading: versionLoading } = useGetVersionDetails(
    {
      orderIdentifier,
      orderVersion,
      triggerVersionCall,
    }
  );

  // Track processed versions to prevent duplicate processing
  const processedVersionRef = useRef<string | null>(null);

  // Update order details when version data is loaded
  useEffect(() => {
    if (versionData && selectedVersion) {
      // Create a unique key for this version to prevent duplicate processing
      const versionKey = `${selectedVersion.versionNumber}-${selectedVersion.orderVersion}`;

      // Skip if we've already processed this version
      if (processedVersionRef.current === versionKey) {
        return;
      }

      // Mark this version as processed
      processedVersionRef.current = versionKey;

      // Reset trigger after successful fetch
      setTriggerVersionCall(false);

      // Show success toast only if data is freshly loaded (not from cache)
      if (!versionLoading) {
        const versionName =
          orderVersions.find(
            (v: Version) => v.versionNumber === selectedVersion.versionNumber
          )?.versionName || `Version ${selectedVersion.versionNumber}`;
        toast.success(`Loaded ${versionName} details`);
      }
    }
  }, [versionData, versionLoading, selectedVersion, orderVersions]);

  // Handler functions
  const handleRefresh = async () => {
    if (!orderId || !user || !tenantData?.tenant) return;

    setLoading(true);
    try {
      const response = await OrderDetailsService.fetchOrderDetails({
        userId: user.userId,
        tenantId: tenantData.tenant.tenantCode,
        companyId: user.companyId,
        orderId,
      });
      setOrderDetails(response);
    } catch (error) {
      console.error("Error refreshing order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push(`/${locale}/landing/orderslanding`);
  };

  const handleEditQuote = () => {
    router.push(`/${locale}/details/orderDetails/${orderId}/edit`);
  };

  const handleEditOrder = () => {
    setEditDialogOpen(true);
  };

  const handleSaveOrderName = async (newOrderName: string) => {
    if (!user || !orderDetails?.data?.orderDetails?.[0]?.orderIdentifier) {
      throw new Error("Missing required data for updating order name");
    }

    try {
      // Call the API to update the order name
      await OrderNameService.updateOrderName({
        userId: user.userId,
        companyId: user.companyId,
        orderIdentifier: orderDetails.data.orderDetails[0].orderIdentifier,
        orderName: newOrderName,
      });

      // Update the local state to reflect the change
      if (orderDetails && orderDetails.data?.orderDetails) {
        const updatedOrderDetails = {
          ...orderDetails,
          data: {
            ...orderDetails.data,
            orderDetails: orderDetails.data.orderDetails.map((order, index) =>
              index === 0 ? { ...order, orderName: newOrderName } : order
            ),
          },
        };
        setOrderDetails(updatedOrderDetails);
      }
    } catch (error) {
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  // Extract data for header - use version data if available, otherwise use order details
  const displayOrderDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return orderDetails?.data;
  }, [versionData, selectedVersion, orderDetails?.data]);

  const status = (displayOrderDetails?.updatedBuyerStatus ||
    orderDetails?.data?.updatedBuyerStatus) as string | undefined;

  const pricingContext = useMemo(() => {
    const primaryHeader = displayOrderDetails || orderDetails?.data;
    const detail = primaryHeader?.orderDetails?.[0];

    const resolvedIsInter =
      typeof detail?.isInter === "boolean"
        ? detail.isInter
        : typeof primaryHeader?.isInter === "boolean"
          ? primaryHeader.isInter
          : true;

    const resolvedTaxExemption =
      typeof detail?.taxExemption === "boolean"
        ? detail.taxExemption
        : typeof primaryHeader?.taxExemption === "boolean"
          ? primaryHeader.taxExemption
          : Boolean((user as { taxExemption?: boolean })?.taxExemption);

    const resolvedInsurance = Number(
      detail?.insuranceCharges ?? primaryHeader?.insuranceCharges ?? 0
    );

    const resolvedShipping = Number(
      detail?.overallShipping ?? primaryHeader?.overallShipping ?? 0
    );

    const detailOrderTerms = detail?.orderTerms as
      | { pfValue?: number }
      | undefined;

    const resolvedPfRate = Number(
      detail?.pfRate ??
        detailOrderTerms?.pfValue ??
        primaryHeader?.pfRate ??
        0
    );

    return {
      isInter: resolvedIsInter,
      taxExemption: resolvedTaxExemption,
      insuranceCharges: Number.isFinite(resolvedInsurance)
        ? resolvedInsurance
        : 0,
      overallShipping: Number.isFinite(resolvedShipping)
        ? resolvedShipping
        : 0,
      pfRate: Number.isFinite(resolvedPfRate) ? resolvedPfRate : 0,
    };
  }, [displayOrderDetails, orderDetails?.data, user]);

  // Get module settings for order settings and SPR check
  const { orderSettings } = useModuleSettings(user);

  // Check if order is SPR requested
  const isSPRRequested = useMemo(() => {
    // Check if any product in the order has SPR requested
    const products =
      displayOrderDetails?.orderDetails?.[0]?.dbProductDetails ||
      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
      [];
    return products.some(
      (product: any) => product?.isSprRequested || product?.sprRequested // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  }, [displayOrderDetails, orderDetails]);

  // Request edit check function - matches JS logic exactly
  const requestEditCheck = () => {
    const sellerStatus = (displayOrderDetails?.updatedSellerStatus ||
      orderDetails?.data?.updatedSellerStatus) as string | undefined;

    // First check: Seller status conditions (if)
    if (
      sellerStatus === "INVOICED" ||
      sellerStatus === "INVOICED PARTIALLY" ||
      sellerStatus === "SHIPPED" ||
      (sellerStatus === "ORDER BOOKED" &&
        orderSettings?.editOrder === "ORDER ACCEPTED")
    ) {
      toast.info(
        `Order ${
          orderSettings?.editOrder === "ORDER BOOKED"
            ? "invoice"
            : "booked or invoiced"
        } already, edit is not possible`,
        {
          style: {
            backgroundColor: "#22c55e", // green-500
            color: "#ffffff", // white
            fontSize: "0.875rem", // text-sm
            padding: "0.5rem 0.75rem", // smaller padding
          },
          className: "text-sm px-3 py-2",
        }
      );
    }
    // Second check: Status is REQUESTED EDIT (else if)
    else if (status?.toUpperCase() === "REQUESTED EDIT") {
      toast.info("Requested for edit already, wait for seller to respond", {
        style: {
          backgroundColor: "#ABE7B2", // green-500
          color: "#ffffff", // white
          fontSize: "0.875rem", // text-sm
          padding: "0.5rem 0.75rem", // smaller padding
        },
        className: "text-sm px-3 py-2",
      });
    }
    // Third check: SPR requested (else)
    else {
      if (isSPRRequested) {
        toast.info(
          "Edit access is not possible for SPR orders, contact seller for any queries",
          {
            style: {
              backgroundColor: "#22c55e", // green-500
              color: "#ffffff", // white
              fontSize: "0.875rem", // text-sm
              padding: "0.5rem 0.75rem", // smaller padding
            },
            className: "text-sm px-3 py-2",
          }
        );
      } else {
        // Open the request edit dialog
        setRequestEditDialogOpen(true);
      }
    }
  };

  // Handle request edit button click
  const handleRequestEdit = () => {
    // Check if order is cancelled using the utility function
    if (isOrderCancelled(status)) {
      toast.info("Order was cancelled already", {
        style: {
          backgroundColor: "#22c55e", // green-500
          color: "#ffffff", // white
          fontSize: "0.875rem", // text-sm
          padding: "0.5rem 0.75rem", // smaller padding
        },
        className: "text-sm px-3 py-2",
      });
      return;
    }

    // Run request edit checks
    requestEditCheck();
  };

  // Handle confirm request edit
  const handleConfirmRequestEdit = async () => {
    if (!user || !orderId) {
      toast.error("Missing required information");
      return;
    }

    try {
      await RequestEditService.requestEdit({
        userId: user.userId,
        companyId: user.companyId,
        orderId,
        data: {}, // Empty data object as per API
      });

      toast.success("Edit request submitted successfully");

      // Refresh order details to get updated status
      await handleRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit edit request";
      toast.error(errorMessage);
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleClone = () => {
    toast.info("Clone functionality coming soon");
  };

  const handleDownloadPDF = () => {
    toast.info("Download PDF functionality coming soon");
  };

  // Handle version selection
  const handleVersionSelect = (version: Version) => {
    // Close dialog immediately
    setVersionsDialogOpen(false);

    // If version 1 is selected, reset to original order details
    if (version.versionNumber === 1) {
      // Reset to original order details
      if (orderDetails) {
        // Reset processed version ref
        processedVersionRef.current = null;
        // Re-fetch original order details
        setSelectedVersion(null);
        setTriggerVersionCall(false);
        handleRefresh();
      }
      return;
    }

    // Reset processed version ref for new version selection
    processedVersionRef.current = null;

    // Set selected version and trigger fetch
    setSelectedVersion({
      versionNumber: version.versionNumber,
      orderVersion: version.orderVersion || version.versionNumber,
      ...(version.orderIdentifier && {
        orderIdentifier: version.orderIdentifier,
      }),
    });
    setTriggerVersionCall(true);
  };

  const orderName =
    displayOrderDetails?.orderDetails?.[0]?.orderName ||
    orderDetails?.data?.orderDetails?.[0]?.orderName;
  const cancelled = isOrderCancelled(status);
  const editInProgress = isEditInProgress(status);
  const cancelMsg = (displayOrderDetails?.orderDetails?.[0]?.cancelMsg ||
    orderDetails?.data?.orderDetails?.[0]?.cancelMsg) as
    | string
    | null
    | undefined;
  const createdDate = (displayOrderDetails?.createdDate ||
    orderDetails?.data?.createdDate) as string | undefined;

  // Determine which buttons to show based on order status
  const headerButtons = editInProgress
    ? [
        {
          label: "EDIT ORDER",
          variant: "outline" as const,
          onClick: handleEditQuote,
        },
      ]
    : [
        {
          label: "REQUEST EDIT",
          variant: "outline" as const,
          onClick: handleRequestEdit,
        },
      ];

  // Get last date to pay using utility
  const lastDateToPay = getLastDateToPay(paymentDueData, preferences);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Sales Header - Fixed at top */}
      <div className="flex-shrink-0">
        <SalesHeader
          title={orderName ? decodeUnicode(orderName) : "Order Details"}
          identifier={orderId || "..."}
          {...(status && {
            status: {
              label: status,
              className: getStatusStyle(status),
            },
          })}
          onEdit={handleEditOrder}
          onRefresh={handleRefresh}
          onClose={handleClose}
          menuOptions={[
            {
              label: "Clone",
              onClick: handleClone,
            },
            {
              label: "Download PDF",
              onClick: handleDownloadPDF,
            },
          ]}
          buttons={headerButtons}
          showEditIcon={true}
          loading={loading}
        />
      </div>

      {/* Order Details Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
            {/* Left Side - Status Tracker and Products Table - 60% */}
            <div className="w-full lg:w-[65%] space-y-2 sm:space-y-3">
              {/* Cancellation Card */}
              {cancelled &&
                cancelMsg &&
                !loading &&
                (orderDetails || displayOrderDetails) && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Section - Order Identifier and Date */}
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-900 text-base sm:text-lg">
                          {displayOrderDetails?.orderIdentifier ||
                            orderDetails?.data?.orderIdentifier ||
                            orderId}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {zoneDateTimeCalculator(
                            createdDate,
                            preferences.timeZone,
                            preferences.dateFormat,
                            preferences.timeFormat,
                            true
                          ) || ""}
                        </div>
                      </div>

                      {/* Right Section - Cancellation Reason */}
                      <div className="flex flex-col gap-1 sm:text-right">
                        <div className="text-xs sm:text-sm font-medium text-gray-700">
                          Reason for cancellation
                        </div>
                        <div className="text-sm sm:text-base font-medium text-red-600">
                          {cancelMsg || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/* Status Tracker */}
              {!loading &&
                !error &&
                (orderDetails || displayOrderDetails) &&
                !cancelled && (
                  <div>
                    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                      <OrderStatusTracker
                        {...(orderId && { orderId })}
                        {...(displayOrderDetails?.createdDate && {
                          createdDate: displayOrderDetails.createdDate,
                        })}
                        {...(status && {
                          currentStatus: status,
                        })}
                        {...(displayOrderDetails?.orderDetails?.[0]
                          ?.grandTotal && {
                          total: displayOrderDetails.orderDetails[0].grandTotal,
                        })}
                        paid={totalPaid}
                        {...(displayOrderDetails?.orderDetails?.[0]
                          ?.grandTotal && {
                          toPay:
                            (displayOrderDetails.orderDetails[0].grandTotal ||
                              0) - (totalPaid || 0),
                        })}
                        {...((displayOrderDetails?.buyerCurrencySymbol
                          ?.symbol ||
                          orderDetails?.data?.buyerCurrencySymbol?.symbol) && {
                          currencySymbol:
                            displayOrderDetails?.buyerCurrencySymbol?.symbol ||
                            orderDetails?.data?.buyerCurrencySymbol?.symbol ||
                            "",
                        })}
                        {...(paymentHistory && { paymentHistory })}
                        {...(lastDateToPay && { lastDateToPay })}
                      />
                    </Suspense>
                  </div>
                )}

              {/* Products Table */}
              {!loading && !error && (orderDetails || displayOrderDetails) && (
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                  <OrderProductsTable
                    products={
                      displayOrderDetails?.orderDetails?.[0]
                        ?.dbProductDetails ||
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                      []
                    }
                    {...((displayOrderDetails?.orderDetails?.[0]
                      ?.dbProductDetails?.length ||
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails
                        ?.length) && {
                      totalCount:
                        displayOrderDetails?.orderDetails?.[0]?.dbProductDetails
                          ?.length ||
                        orderDetails?.data?.orderDetails?.[0]?.dbProductDetails
                          ?.length ||
                        0,
                    })}
                    onExport={() => {
                      const products =
                        displayOrderDetails?.orderDetails?.[0]
                          ?.dbProductDetails ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.dbProductDetails ||
                        [];
                      const filename = `Order_${orderId}_Products.csv`;
                      exportProductsToCsv(
                        products as ProductCsvRow[],
                        filename
                      );
                    }}
                  />
                </Suspense>
              )}

              {/* Contact Details and Terms Cards - Side by Side */}
              {!loading && !error && (orderDetails || displayOrderDetails) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {/* Contact Details Card */}
                  <OrderContactDetails
                    billingAddress={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.billingAddressDetails ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.billingAddressDetails) as unknown as AddressDetails
                    }
                    shippingAddress={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.shippingAddressDetails ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.shippingAddressDetails) as unknown as AddressDetails
                    }
                    registerAddress={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.registerAddressDetails ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.registerAddressDetails) as unknown as AddressDetails
                    }
                    sellerAddress={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.sellerAddressDetail ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.sellerAddressDetail) as unknown as AddressDetails
                    }
                    buyerCompanyName={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.buyerCompanyName ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.buyerCompanyName) as unknown as string
                    }
                    buyerBranchName={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.buyerBranchName ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.buyerBranchName) as unknown as string
                    }
                    warehouseName={
                      ((
                        (displayOrderDetails?.orderDetails?.[0]
                          ?.dbProductDetails?.[0] ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.dbProductDetails?.[0]) as unknown as Record<
                          string,
                          Record<string, string>
                        >
                      )?.wareHouse?.wareHouseName ||
                        (
                          (displayOrderDetails?.orderDetails?.[0]
                            ?.dbProductDetails?.[0] ||
                            orderDetails?.data?.orderDetails?.[0]
                              ?.dbProductDetails?.[0]) as unknown as Record<
                            string,
                            string
                          >
                        )?.orderWareHouseName) as string | undefined
                    }
                    warehouseAddress={
                      (
                        (displayOrderDetails?.orderDetails?.[0]
                          ?.dbProductDetails?.[0] ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.dbProductDetails?.[0]) as unknown as Record<
                          string,
                          Record<string, Record<string, string>>
                        >
                      )?.wareHouse?.addressId as unknown as {
                        addressLine?: string;
                        district?: string;
                        city?: string;
                        state?: string;
                        pinCodeId?: string;
                        country?: string;
                      }
                    }
                    salesBranch={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.sellerBranchName ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.sellerBranchName) as unknown as string | undefined
                    }
                    requiredDate={
                      (displayOrderDetails?.orderDetails?.[0]
                        ?.customerRequiredDate ||
                        displayOrderDetails?.orderDeliveryDate ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.customerRequiredDate ||
                        orderDetails?.data?.orderDeliveryDate) as unknown as
                        | string
                        | undefined
                    }
                    referenceNumber={
                      ((displayOrderDetails?.buyerReferenceNumber ||
                        orderDetails?.data?.buyerReferenceNumber) as string) ||
                      "-"
                    }
                  />

                  {/* Terms Card */}
                  <OrderTermsCard
                    orderTerms={
                      {
                        ...(displayOrderDetails?.orderDetails?.[0]
                          ?.orderTerms ||
                          orderDetails?.data?.orderDetails?.[0]?.orderTerms ||
                          {}),
                        additionalTerms: (displayOrderDetails?.orderDetails?.[0]
                          ?.additionalTerms ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.additionalTerms) as string | undefined,
                      } as OrderTerms
                    }
                  />
                </div>
              )}
            </div>

            {/* Right Side - Price Details - 40% */}
            {!loading && !error && (orderDetails || displayOrderDetails) && (
              <div className="w-full lg:w-[33%] mt-[55px]">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <OrderPriceDetails
                    products={
                      displayOrderDetails?.orderDetails?.[0]
                        ?.dbProductDetails ||
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                      []
                    }
                    isInter={pricingContext.isInter}
                    insuranceCharges={pricingContext.insuranceCharges}
                    precision={2}
                    Settings={{
                      roundingAdjustment:
                        displayOrderDetails?.orderDetails?.[0]
                          ?.roundingAdjustmentEnabled ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.roundingAdjustmentEnabled ||
                        false,
                    }}
                    isSeller={
                      (user as { isSeller?: boolean })?.isSeller || false
                    }
                    taxExemption={pricingContext.taxExemption}
                    currency={
                      (
                        (displayOrderDetails?.buyerCurrencySymbol ||
                          orderDetails?.data?.buyerCurrencySymbol) as {
                          symbol?: string;
                        }
                      )?.symbol || "INR ₹"
                    }
                    {...(displayOrderDetails?.orderDetails?.[0]
                      ?.overallShipping !== undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.overallShipping !==
                      undefined
                      ? {
                          overallShipping: pricingContext.overallShipping,
                        }
                      : {})}
                    {...(displayOrderDetails?.orderDetails?.[0]?.overallTax !==
                      undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.overallTax !==
                      undefined
                      ? {
                          overallTax: Number(
                            displayOrderDetails?.orderDetails?.[0]
                              ?.overallTax ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.overallTax ||
                              0
                          ),
                        }
                      : {})}
                    {...(displayOrderDetails?.orderDetails?.[0]
                      ?.calculatedTotal !== undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.calculatedTotal !==
                      undefined ||
                    displayOrderDetails?.orderDetails?.[0]?.grandTotal !==
                      undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.grandTotal !==
                      undefined
                      ? {
                          calculatedTotal: Number(
                            displayOrderDetails?.orderDetails?.[0]
                              ?.calculatedTotal ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.calculatedTotal ||
                              displayOrderDetails?.orderDetails?.[0]
                                ?.grandTotal ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.grandTotal ||
                              0
                          ),
                        }
                      : {})}
                    {...(displayOrderDetails?.orderDetails?.[0]?.subTotal !==
                      undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.subTotal !==
                      undefined
                      ? {
                          subTotal: Number(
                            displayOrderDetails?.orderDetails?.[0]?.subTotal ||
                              orderDetails?.data?.orderDetails?.[0]?.subTotal ||
                              0
                          ),
                        }
                      : {})}
                    {...(displayOrderDetails?.orderDetails?.[0]
                      ?.taxableAmount !== undefined ||
                    orderDetails?.data?.orderDetails?.[0]?.taxableAmount !==
                      undefined
                      ? {
                          taxableAmount: Number(
                            displayOrderDetails?.orderDetails?.[0]
                              ?.taxableAmount ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.taxableAmount ||
                              0
                          ),
                        }
                      : {})}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Icons - Positioned just below the SalesHeader component, flush to right edge */}
      <div className="fixed right-0 top-[116px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
        <button
          className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
            versionsDialogOpen ? "bg-primary/10" : ""
          }`}
          aria-label="Layers"
          onClick={() => setVersionsDialogOpen(true)}
        >
          <Layers
            className={`w-5 h-5 transition-colors ${
              versionsDialogOpen ? "text-primary" : "text-gray-700"
            }`}
          />
        </button>
      </div>

      {/* Edit Order Name Dialog */}
      <EditOrderNameDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentOrderName={orderName || ""}
        onSave={handleSaveOrderName}
        loading={loading}
      />

      <RequestEditDialog
        open={requestEditDialogOpen}
        onOpenChange={setRequestEditDialogOpen}
        onConfirm={handleConfirmRequestEdit}
        loading={loading}
      />

      {/* Versions Dialog */}
      <VersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        versions={orderVersions}
        orderId={orderId}
        loading={loading}
        currentVersionNumber={selectedVersion?.versionNumber || 1}
        onVersionSelect={handleVersionSelect}
      />

      {/* Toaster for toast notifications - positioned bottom-left with smaller size */}
      <Toaster
        position="bottom-left"
        richColors
        toastOptions={{
          style: {
            fontSize: "0.875rem", // text-sm
            padding: "0.5rem 0.75rem", // smaller padding
          },
          className: "text-sm px-3 py-2",
        }}
      />
    </div>
  );
}
