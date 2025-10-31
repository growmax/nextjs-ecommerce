"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import {
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderStatusTracker,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
import { zoneDateTimeCalculator } from "@/utils/dateformat";
import { differenceInDays, isAfter } from "date-fns";

// Import types for proper typing
interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCodeId?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  sellerCompanyName?: string;
  sellerBranchName?: string;
}

interface OrderTerms {
  paymentTerms?: string;
  paymentTermsCode?: string;
  deliveryTerms?: string;
  deliveryTermsCode?: string;
  deliveryTermsCode2?: string;
  freight?: string;
  insurance?: string;
  packageForwarding?: string;
  packageForwardingCode?: string;
  dispatchInstructions?: string;
  dispatchInstructionsCode?: string;
  additionalTerms?: string;
}

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
    locale: string;
  }>;
}

// Helper function to decode Unicode escape sequences
const decodeUnicode = (str: string): string => {
  try {
    // Replace Unicode escape sequences with actual characters
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_match, grp) =>
      String.fromCharCode(parseInt(grp, 16))
    );
  } catch {
    return str;
  }
};

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

  // Extract data for header
  const orderName = orderDetails?.data?.orderDetails?.[0]?.orderName;
  const status = orderDetails?.data?.updatedBuyerStatus as string | undefined;
  const isCancelled = status?.toUpperCase() === "ORDER CANCELLED";
  const isEditInProgress = status?.toUpperCase() === "EDIT IN PROGRESS";
  const cancelMsg = orderDetails?.data?.orderDetails?.[0]?.cancelMsg as
    | string
    | null
    | undefined;
  const createdDate = orderDetails?.data?.createdDate as string | undefined;

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
          {/* Left Side - Status Tracker and Products Table - 70% */}
          <div className="w-full lg:w-[70%] space-y-3 sm:space-y-4 md:space-y-6">
            {/* Cancellation Card */}
            {isCancelled && cancelMsg && !loading && orderDetails && (
              <div className="mt-17 bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left Section - Order Identifier and Date */}
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      {orderDetails?.data?.orderIdentifier || orderId}
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
            {!loading && !error && orderDetails && (
              <div className={isCancelled && cancelMsg ? "" : "mt-17"}>
                <OrderStatusTracker
                  {...(orderId && { orderId })}
                  {...(orderDetails.data?.createdDate && {
                    createdDate: orderDetails.data.createdDate,
                  })}
                  {...(orderDetails.data?.updatedBuyerStatus && {
                    currentStatus: orderDetails.data.updatedBuyerStatus,
                  })}
                  {...(orderDetails.data?.orderDetails?.[0]?.grandTotal && {
                    total: orderDetails.data.orderDetails[0].grandTotal,
                  })}
                  paid={totalPaid}
                  {...(orderDetails.data?.orderDetails?.[0]?.grandTotal && {
                    toPay:
                      (orderDetails.data.orderDetails[0].grandTotal || 0) -
                      (totalPaid || 0),
                  })}
                  {...(orderDetails.data?.buyerCurrencySymbol?.symbol && {
                    currencySymbol:
                      orderDetails.data.buyerCurrencySymbol.symbol,
                  })}
                  {...(paymentHistory && { paymentHistory })}
                  {...(lastDateToPay && { lastDateToPay })}
                  className={isCancelled && cancelMsg ? "mt-0" : undefined}
                />
              </div>
            )}

            {/* Products Table */}
            {!loading && !error && orderDetails && (
              <OrderProductsTable
                products={
                  orderDetails.data?.orderDetails?.[0]?.dbProductDetails || []
                }
                {...(orderDetails.data?.orderDetails?.[0]?.dbProductDetails
                  ?.length && {
                  totalCount:
                    orderDetails.data.orderDetails[0].dbProductDetails.length,
                })}
                onExport={() => {
                  const products =
                    orderDetails.data?.orderDetails?.[0]?.dbProductDetails ||
                    [];
                  const filename = `Order_${orderId}_Products.csv`;
                  exportProductsToCsv(products as ProductCsvRow[], filename);
                }}
              />
            )}

            {/* Contact Details and Terms Cards - Side by Side */}
            {!loading && !error && orderDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Contact Details Card */}
                <OrderContactDetails
                  billingAddress={
                    orderDetails.data?.orderDetails?.[0]
                      ?.billingAddressDetails as unknown as AddressDetails
                  }
                  shippingAddress={
                    orderDetails.data?.orderDetails?.[0]
                      ?.shippingAddressDetails as unknown as AddressDetails
                  }
                  registerAddress={
                    orderDetails.data?.orderDetails?.[0]
                      ?.registerAddressDetails as unknown as AddressDetails
                  }
                  sellerAddress={
                    orderDetails.data?.orderDetails?.[0]
                      ?.sellerAddressDetail as unknown as AddressDetails
                  }
                  buyerCompanyName={
                    orderDetails.data?.orderDetails?.[0]
                      ?.buyerCompanyName as unknown as string
                  }
                  buyerBranchName={
                    orderDetails.data?.orderDetails?.[0]
                      ?.buyerBranchName as unknown as string
                  }
                  warehouseName={
                    ((
                      orderDetails.data?.orderDetails?.[0]
                        ?.dbProductDetails?.[0] as unknown as Record<
                        string,
                        Record<string, string>
                      >
                    )?.wareHouse?.wareHouseName ||
                      (
                        orderDetails.data?.orderDetails?.[0]
                          ?.dbProductDetails?.[0] as unknown as Record<
                          string,
                          string
                        >
                      )?.orderWareHouseName) as string | undefined
                  }
                  warehouseAddress={
                    (
                      orderDetails.data?.orderDetails?.[0]
                        ?.dbProductDetails?.[0] as unknown as Record<
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
                    orderDetails.data?.orderDetails?.[0]
                      ?.sellerBranchName as unknown as string | undefined
                  }
                  requiredDate={
                    (orderDetails.data?.orderDetails?.[0]
                      ?.customerRequiredDate ||
                      orderDetails.data?.orderDeliveryDate) as unknown as
                      | string
                      | undefined
                  }
                  referenceNumber={
                    (orderDetails.data?.buyerReferenceNumber as string) || "-"
                  }
                />

                {/* Terms Card */}
                <OrderTermsCard
                  orderTerms={
                    orderDetails.data?.orderDetails?.[0]
                      ?.orderTerms as unknown as OrderTerms
                  }
                />
              </div>
            )}
          </div>

          {/* Right Side - Price Details - 30% */}
          {!loading && !error && orderDetails && (
            <div className="w-full lg:w-[30%] mt-17">
              <OrderPriceDetails
                totalItems={
                  orderDetails.data?.orderDetails?.[0]?.dbProductDetails
                    ?.length || 0
                }
                totalLP={
                  orderDetails.data?.orderDetails?.[0]?.dbProductDetails?.reduce(
                    (sum, product) => sum + (product.unitListPrice || 0),
                    0
                  ) || 0
                }
                discount={(() => {
                  const products =
                    orderDetails.data?.orderDetails?.[0]?.dbProductDetails ||
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
                  Number(orderDetails.data?.orderDetails?.[0]?.subTotal) || 0
                }
                taxableAmount={
                  Number(orderDetails.data?.orderDetails?.[0]?.taxableAmount) ||
                  0
                }
                tax={
                  Number(orderDetails.data?.orderDetails?.[0]?.overallTax) || 0
                }
                taxDetails={[
                  {
                    name: "IGST",
                    value:
                      Number(
                        orderDetails.data?.orderDetails?.[0]?.overallTax
                      ) || 0,
                  },
                ]}
                total={
                  Number(orderDetails.data?.orderDetails?.[0]?.grandTotal) || 0
                }
                currency={
                  (
                    orderDetails.data?.buyerCurrencySymbol as {
                      symbol?: string;
                    }
                  )?.symbol || "INR ₹"
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Name Dialog */}
      <EditOrderNameDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentOrderName={orderName || ""}
        onSave={handleSaveOrderName}
        loading={loading}
      />
    </div>
  );
}
