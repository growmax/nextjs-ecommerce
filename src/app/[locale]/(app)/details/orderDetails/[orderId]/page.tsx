"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  OrderProductsTable,
  OrderStatusTracker,
  OrderContactDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import CartPriceDetails from "@/components/custom/CartPriceDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import type { OrderDetailsResponse } from "@/lib/api";
import { OrderDetailsService } from "@/lib/api";

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

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

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
      if (!paramsLoaded || !orderId || !user || !tenantData?.tenant) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await OrderDetailsService.fetchOrderDetails({
          userId: user.userId,
          tenantId: tenantData.tenant.tenantCode,
          companyId: user.companyId,
          orderId,
        });

        setOrderDetails(response);
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
  }, [paramsLoaded, orderId, user, tenantData]);

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
    toast.info("Edit order functionality coming soon");
  };

  const handlePlaceOrder = () => {
    toast.info("Place order functionality coming soon");
  };

  const handleClone = () => {
    toast.info("Clone functionality coming soon");
  };

  const handleDownloadPDF = () => {
    toast.info("Download PDF functionality coming soon");
  };

  const handleExportProducts = () => {
    toast.info("Export products functionality coming soon");
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
  const status = orderDetails?.data?.updatedBuyerStatus;

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
        buttons={[
          {
            label: "EDIT ORDER",
            variant: "outline",
            onClick: handleEditQuote,
          },
          {
            label: "PLACE ORDER",
            variant: "default",
            onClick: handlePlaceOrder,
          },
        ]}
        showEditIcon={false}
        loading={loading}
      />

      {/* Order Details Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* Left Side - Status Tracker and Products Table - 70% */}
          <div className="w-full lg:w-[70%] space-y-3 sm:space-y-4 md:space-y-6">
            {/* Status Tracker */}
            {!loading && !error && orderDetails && (
              <OrderStatusTracker
                {...(orderId && { orderId })}
                {...(orderDetails.data?.createdDate && {
                  createdDate: orderDetails.data.createdDate,
                })}
                {...(orderDetails.data?.updatedBuyerStatus && {
                  currentStatus: orderDetails.data.updatedBuyerStatus,
                })}
              />
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
                onExport={handleExportProducts}
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
                    (orderDetails.data?.buyerReferenceNumber ||
                      orderDetails.data?.sellerReferenceNumber) as unknown as
                      | string
                      | undefined
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
            <div className="w-full lg:w-[30%]">
              <div className="[&_#CartPriceDetails_>_div_>_div_>_div:nth-child(3)]:hidden [&_#CartPriceDetails_>_div_>_div_>_div:nth-child(2)_h5]:!font-normal [&_#CartPriceDetails_>_div_>_div_>_div:nth-child(4)_h6]:!font-bold [&_#CartPriceDetails_>_div_>_div:first-child_svg]:!hidden">
                <CartPriceDetails
                  totalItems={
                    orderDetails.data?.orderDetails?.[0]?.dbProductDetails
                      ?.length || 0
                  }
                  totalLP={
                    Number(orderDetails.data?.orderDetails?.[0]?.subTotal) || 0
                  }
                  subtotal={
                    Number(orderDetails.data?.orderDetails?.[0]?.subTotal) || 0
                  }
                  taxableAmount={
                    Number(
                      orderDetails.data?.orderDetails?.[0]?.taxableAmount
                    ) || 0
                  }
                  tax={
                    Number(orderDetails.data?.orderDetails?.[0]?.overallTax) ||
                    0
                  }
                  total={
                    Number(orderDetails.data?.orderDetails?.[0]?.grandTotal) ||
                    0
                  }
                  currency={
                    (
                      orderDetails.data?.buyerCurrencySymbol as {
                        symbol?: string;
                      }
                    )?.symbol || "INR ₹"
                  }
                  igst={
                    Number(orderDetails.data?.orderDetails?.[0]?.overallTax) ||
                    0
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
