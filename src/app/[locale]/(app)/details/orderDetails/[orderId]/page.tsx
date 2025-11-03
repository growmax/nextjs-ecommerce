"use client";

import { Layers } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import {
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderStatusTracker,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails";
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
} from "@/lib/api";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";
import {
  AddressDetails,
  OrderDetailsPageProps,
  OrderTerms,
} from "@/types/details/orderdetails/index.types";
import { zoneDateTimeCalculator } from "@/utils/dateformat";
import { decodeUnicode } from "@/utils/general";
import { differenceInDays, isAfter } from "date-fns";

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
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
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<{
    versionNumber: number;
    orderVersion?: number;
    orderIdentifier?: string;
  } | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [paymentDueData, setPaymentDueData] = useState<PaymentDueDataItem[]>(
    []
  );

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

  // Get user preferences for date/time formatting
  const getUserPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem("userPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        return {
          timeZone: prefs.timeZone || "Asia/Kolkata",
          dateFormat: prefs.dateFormat || "dd/MM/yyyy",
          timeFormat: prefs.timeFormat || "hh:mm a",
        };
      }
    } catch {
      // Fallback to defaults
    }
    return {
      timeZone: "Asia/Kolkata",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "hh:mm a",
    };
  };

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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.error("Failed to fetch payment due details:", err);
        setPaymentDueData([]);
      }
    };

    fetchPaymentDue();
  }, [orderId, orderDetails]);

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
      toast.success("Order details refreshed successfully");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error refreshing order details:", error);
      toast.error("Failed to refresh order details");
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

  const handleRequestEdit = () => {
    toast.info("Request edit functionality coming soon");
  };

  const handleClone = () => {
    toast.info("Clone functionality coming soon");
  };

  const handleDownloadPDF = () => {
    toast.info("Download PDF functionality coming soon");
  };

  // Helper to get status badge styling based on status
  const getStatusStyle = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ORDER ACKNOWLEDGED":
      case "ACKNOWLEDGED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN PROGRESS":
      case "PROCESSING":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Extract versions from order details
  const versions = useMemo(() => {
    return (
      orderDetails?.data?.orderDetails
        ?.map((order, index) => {
          const version: {
            versionNumber: number;
            versionName?: string;
            sentBy: string;
            sentDate: string;
            orderId: string;
            orderIdentifier: string;
            orderVersion?: number;
          } = {
            versionNumber: index + 1,
            sentBy: (order.modifiedByUsername as string) || "",
            sentDate: (order.versionCreatedTimestamp as string) || "",
            orderId,
            orderIdentifier: orderDetails?.data?.orderIdentifier || "",
            orderVersion: (order.orderVersion as number) || index + 1,
          };
          if (order.versionName) {
            version.versionName = order.versionName as string;
          }
          return version;
        })
        .filter(Boolean) || []
    );
  }, [
    orderDetails?.data?.orderDetails,
    orderDetails?.data?.orderIdentifier,
    orderId,
  ]);

  // Get version details if a version is selected
  // Get orderIdentifier from selectedVersion if available, otherwise from orderDetails
  const orderIdentifier = useMemo(() => {
    // First try to use orderIdentifier from selectedVersion (directly from clicked version)
    if (selectedVersion?.orderIdentifier) {
      return selectedVersion.orderIdentifier;
    }
    // Otherwise try to find it from versions array
    const versionWithIdentifier = versions.find(
      (v: Version) => v.versionNumber === selectedVersion?.versionNumber
    );
    if (versionWithIdentifier?.orderIdentifier) {
      return versionWithIdentifier.orderIdentifier;
    }
    // Finally use orderDetails orderIdentifier or fallback to orderId
    return orderDetails?.data?.orderIdentifier || orderId || "";
  }, [versions, selectedVersion, orderDetails?.data?.orderIdentifier, orderId]);

  const orderVersion = useMemo(() => {
    if (!selectedVersion) return null;
    return selectedVersion.orderVersion || selectedVersion.versionNumber;
  }, [selectedVersion]);

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
    if (versionData && !versionLoading && selectedVersion) {
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

      // Show success toast
      const versionName =
        versions.find(
          (v: Version) => v.versionNumber === selectedVersion.versionNumber
        )?.versionName || `Version ${selectedVersion.versionNumber}`;
      toast.success(`Loaded ${versionName} details`);

      // Close the dialog after successful API call
      setVersionsDialogOpen(false);
    }
  }, [versionData, versionLoading, selectedVersion, versions]);

  // Handle version selection
  const handleVersionSelect = (version: Version) => {
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
      orderIdentifier: version.orderIdentifier,
    });
    setTriggerVersionCall(true);
  };

  // Extract data for header - use version data if available, otherwise use order details
  const displayOrderDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return orderDetails?.data;
  }, [versionData, selectedVersion, orderDetails?.data]);

  const orderName =
    displayOrderDetails?.orderDetails?.[0]?.orderName ||
    orderDetails?.data?.orderDetails?.[0]?.orderName;
  const status = (displayOrderDetails?.updatedBuyerStatus ||
    orderDetails?.data?.updatedBuyerStatus) as string | undefined;
  const isCancelled = status?.toUpperCase() === "ORDER CANCELLED";
  const isEditInProgress = status?.toUpperCase() === "EDIT IN PROGRESS";
  const cancelMsg = (displayOrderDetails?.orderDetails?.[0]?.cancelMsg ||
    orderDetails?.data?.orderDetails?.[0]?.cancelMsg) as
    | string
    | null
    | undefined;
  const createdDate = (displayOrderDetails?.createdDate ||
    orderDetails?.data?.createdDate) as string | undefined;

  // Determine which buttons to show based on order status
  const headerButtons = isEditInProgress
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

  // Process payment due data to extract last date to pay
  const getLastDateToPay = (): string => {
    if (paymentDueData.length === 0) {
      return "- No due";
    }

    const firstItem = paymentDueData[0];
    if (!firstItem) {
      return "- No due";
    }

    // Get the appropriate breakup array
    const breakup = firstItem.invoiceIdentifier
      ? firstItem.invoiceDueBreakup
      : firstItem.orderDueBreakup;

    if (!breakup || breakup.length === 0) {
      return "- No due";
    }

    const firstBreakup = breakup[0];
    const dueDate = firstBreakup?.dueDate;

    if (!dueDate) {
      return "-";
    }

    // Check if the date is overdue
    const dueDateObj = new Date(dueDate);
    const isDue = isAfter(new Date(), dueDateObj);

    if (isDue) {
      const daysOverdue = differenceInDays(new Date(), dueDateObj);
      return `Overdue by ${daysOverdue} ${daysOverdue > 1 ? "days" : "day"}`;
    }

    // Format the date using user preferences
    const formattedDate = zoneDateTimeCalculator(
      dueDate,
      preferences.timeZone,
      preferences.dateFormat,
      preferences.timeFormat,
      true
    );

    return formattedDate || "-";
  };

  const lastDateToPay = getLastDateToPay();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sales Header */}
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

      {/* Order Details Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative pt-28">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* Left Side - Status Tracker and Products Table - 60% */}
          <div className="w-full lg:w-[65%] space-y-3 sm:space-y-4 md:space-y-6">
            {/* Cancellation Card */}
            {isCancelled &&
              cancelMsg &&
              !loading &&
              !versionLoading &&
              (orderDetails || displayOrderDetails) && (
                <div className="mt-17 bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm">
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
              !versionLoading &&
              !error &&
              (orderDetails || displayOrderDetails) && (
                <div className={isCancelled && cancelMsg ? "" : "mt-17"}>
                  <OrderStatusTracker
                    {...(orderId && { orderId })}
                    {...(displayOrderDetails?.createdDate && {
                      createdDate: displayOrderDetails.createdDate,
                    })}
                    {...(status && {
                      currentStatus: status,
                    })}
                    {...(displayOrderDetails?.orderDetails?.[0]?.grandTotal && {
                      total: displayOrderDetails.orderDetails[0].grandTotal,
                    })}
                    paid={totalPaid}
                    {...(displayOrderDetails?.orderDetails?.[0]?.grandTotal && {
                      toPay:
                        (displayOrderDetails.orderDetails[0].grandTotal || 0) -
                        (totalPaid || 0),
                    })}
                    {...((displayOrderDetails?.buyerCurrencySymbol?.symbol ||
                      orderDetails?.data?.buyerCurrencySymbol?.symbol) && {
                      currencySymbol:
                        displayOrderDetails?.buyerCurrencySymbol?.symbol ||
                        orderDetails?.data?.buyerCurrencySymbol?.symbol ||
                        "",
                    })}
                    {...(paymentHistory && { paymentHistory })}
                    {...(lastDateToPay && { lastDateToPay })}
                    className={isCancelled && cancelMsg ? "mt-0" : undefined}
                  />
                </div>
              )}

            {/* Products Table */}
            {!loading &&
              !versionLoading &&
              !error &&
              (orderDetails || displayOrderDetails) && (
                <OrderProductsTable
                  products={
                    displayOrderDetails?.orderDetails?.[0]?.dbProductDetails ||
                    orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                    []
                  }
                  {...((displayOrderDetails?.orderDetails?.[0]?.dbProductDetails
                    ?.length ||
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
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                      [];
                    const filename = `Order_${orderId}_Products.csv`;
                    exportProductsToCsv(products as ProductCsvRow[], filename);
                  }}
                />
              )}

            {/* Contact Details and Terms Cards - Side by Side */}
            {!loading &&
              !versionLoading &&
              !error &&
              (orderDetails || displayOrderDetails) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                      (displayOrderDetails?.orderDetails?.[0]?.orderTerms ||
                        orderDetails?.data?.orderDetails?.[0]
                          ?.orderTerms) as unknown as OrderTerms
                    }
                  />
                </div>
              )}
          </div>

          {/* Right Side - Price Details - 40% */}
          {!loading &&
            !versionLoading &&
            !error &&
            (orderDetails || displayOrderDetails) && (
              <div className="w-full lg:w-[40%] mt-17 lg:mr-6">
                <OrderPriceDetails
                  totalItems={
                    displayOrderDetails?.orderDetails?.[0]?.dbProductDetails
                      ?.length ||
                    orderDetails?.data?.orderDetails?.[0]?.dbProductDetails
                      ?.length ||
                    0
                  }
                  totalLP={
                    (
                      displayOrderDetails?.orderDetails?.[0]
                        ?.dbProductDetails ||
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                      []
                    ).reduce(
                      (sum, product) => sum + (product.unitListPrice || 0),
                      0
                    ) || 0
                  }
                  discount={(() => {
                    const products =
                      displayOrderDetails?.orderDetails?.[0]
                        ?.dbProductDetails ||
                      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
                      [];
                    let totalDiscount = 0;

                    products.forEach(product => {
                      const unitListPrice = product.unitListPrice || 0;
                      const discountPercentage = product.discount || 0;
                      if (discountPercentage > 0) {
                        const productDiscount =
                          (unitListPrice * discountPercentage) / 100;
                        totalDiscount += productDiscount;
                      }
                    });

                    return totalDiscount;
                  })()}
                  subtotal={
                    Number(
                      displayOrderDetails?.orderDetails?.[0]?.subTotal ||
                        orderDetails?.data?.orderDetails?.[0]?.subTotal
                    ) || 0
                  }
                  taxableAmount={
                    Number(
                      displayOrderDetails?.orderDetails?.[0]?.taxableAmount ||
                        orderDetails?.data?.orderDetails?.[0]?.taxableAmount
                    ) || 0
                  }
                  tax={
                    Number(
                      displayOrderDetails?.orderDetails?.[0]?.overallTax ||
                        orderDetails?.data?.orderDetails?.[0]?.overallTax
                    ) || 0
                  }
                  taxDetails={[
                    {
                      name: "IGST",
                      value:
                        Number(
                          displayOrderDetails?.orderDetails?.[0]?.overallTax ||
                            orderDetails?.data?.orderDetails?.[0]?.overallTax
                        ) || 0,
                    },
                  ]}
                  total={
                    Number(
                      displayOrderDetails?.orderDetails?.[0]?.grandTotal ||
                        orderDetails?.data?.orderDetails?.[0]?.grandTotal
                    ) || 0
                  }
                  currency={
                    (
                      (displayOrderDetails?.buyerCurrencySymbol ||
                        orderDetails?.data?.buyerCurrencySymbol) as {
                        symbol?: string;
                      }
                    )?.symbol || "INR ₹"
                  }
                />
              </div>
            )}
        </div>
      </div>

      {/* Right Sidebar Icons */}
      <div className="fixed right-0 top-32 z-50 bg-white border-l border-gray-200 shadow-md rounded-l-lg p-0.5">
        <button
          className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
            versionsDialogOpen ? "bg-purple-50" : ""
          }`}
          aria-label="Layers"
          onClick={() => setVersionsDialogOpen(true)}
        >
          <Layers
            className={`w-5 h-5 transition-colors ${
              versionsDialogOpen ? "text-purple-600" : "text-gray-700"
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

      {/* Versions Dialog */}
      <VersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        versions={versions}
        orderId={orderId}
        loading={loading || versionLoading}
        currentVersionNumber={selectedVersion?.versionNumber || 1}
        onVersionSelect={handleVersionSelect}
      />
    </div>
  );
}
