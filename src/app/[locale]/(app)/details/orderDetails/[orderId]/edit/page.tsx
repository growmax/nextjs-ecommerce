"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import type { OrderDetailsResponse } from "@/lib/api";
import { OrderDetailsService } from "@/lib/api";
import {
  type SellerBranch,
  type Warehouse,
} from "@/lib/api/services/SellerWarehouseService";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";

// Import types for proper typing
interface AddressDetails {
  addressLine?: string | undefined;
  branchName?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  pinCodeId?: string | undefined;
  pincode?: string | undefined;
  gst?: string | undefined;
  district?: string | undefined;
  locality?: string | undefined;
  mobileNo?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  billToCode?: string | undefined;
  shipToCode?: string | undefined;
  soldToCode?: string | undefined;
  sellerCompanyName?: string | undefined;
  sellerBranchName?: string | undefined;
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

interface EditOrderPageProps {
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

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const router = useRouter();
  const locale = useLocale();

  const [orderId, setOrderId] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<
    Record<string, number>
  >({});
  const [editedRequiredDate, setEditedRequiredDate] = useState<string>("");
  const [editedReferenceNumber, setEditedReferenceNumber] =
    useState<string>("");
  const [editedBillingAddress, setEditedBillingAddress] = useState<
    AddressDetails | undefined
  >(undefined);
  const [editedShippingAddress, setEditedShippingAddress] = useState<
    AddressDetails | undefined
  >(undefined);
  const [editedSellerBranch, setEditedSellerBranch] =
    useState<SellerBranch | null>(null);
  const [editedWarehouse, setEditedWarehouse] = useState<Warehouse | null>(
    null
  );

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

        // Initialize editable fields with current values
        const currentRequiredDate =
          response.data?.orderDetails?.[0]?.customerRequiredDate ||
          response.data?.orderDeliveryDate ||
          "";
        const currentReferenceNumber =
          response.data?.buyerReferenceNumber || "";

        setEditedRequiredDate(currentRequiredDate as string);
        setEditedReferenceNumber(currentReferenceNumber as string);
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

  const handleCancel = () => {
    router.push(`/${locale}/details/orderDetails/${orderId}`);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setEditedQuantities(prev => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleRequiredDateChange = (date: string) => {
    setEditedRequiredDate(date);
  };

  const handleReferenceNumberChange = (refNumber: string) => {
    setEditedReferenceNumber(refNumber);
  };

  const handleBillingAddressChange = (address: AddressDetails) => {
    setEditedBillingAddress(address);
  };

  const handleShippingAddressChange = (address: AddressDetails) => {
    setEditedShippingAddress(address);
  };

  const handleSellerBranchChange = (sellerBranch: SellerBranch | null) => {
    setEditedSellerBranch(sellerBranch);
  };

  const handleWarehouseChange = (warehouse: Warehouse | null) => {
    setEditedWarehouse(warehouse);
  };

  const handlePlaceOrder = async () => {
    setSaving(true);
    try {
      // TODO: Implement actual place order API call
      // For now, just show success message
      toast.success("Order placed successfully");
      router.push(`/${locale}/details/orderDetails/${orderId}`);
    } catch (_error) {
      toast.error("Failed to place order");
    } finally {
      setSaving(false);
    }
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
        title={orderName ? decodeUnicode(orderName) : "Edit Order"}
        identifier={orderId || "..."}
        {...(status && {
          status: {
            label: status,
            className: getStatusStyle(status),
          },
        })}
        onRefresh={handleRefresh}
        onClose={handleCancel}
        menuOptions={[]}
        buttons={[
          {
            label: "PLACE ORDER",
            variant: "default",
            onClick: handlePlaceOrder,
            disabled: saving,
          },
        ]}
        showEditIcon={false}
        loading={loading}
      />

      {/* Order Details Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative pt-28">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* Left Side - Products Table and Contact/Terms Cards - 70% */}
          <div className="w-full lg:w-[70%] space-y-3 sm:space-y-4 md:space-y-6 mt-14">
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
                isEditable={true}
                onQuantityChange={handleQuantityChange}
                editedQuantities={editedQuantities}
              />
            )}

            {/* Contact Details and Terms Cards - Side by Side */}
            {!loading && !error && orderDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Contact Details Card */}
                <OrderContactDetails
                  billingAddress={
                    editedBillingAddress ||
                    (orderDetails.data?.orderDetails?.[0]
                      ?.billingAddressDetails as unknown as AddressDetails)
                  }
                  shippingAddress={
                    editedShippingAddress ||
                    (orderDetails.data?.orderDetails?.[0]
                      ?.shippingAddressDetails as unknown as AddressDetails)
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
                    editedWarehouse?.name ||
                    (((
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
                      )?.orderWareHouseName) as string | undefined)
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
                    editedSellerBranch?.name ||
                    (orderDetails.data?.orderDetails?.[0]
                      ?.sellerBranchName as unknown as string | undefined)
                  }
                  requiredDate={editedRequiredDate}
                  referenceNumber={editedReferenceNumber}
                  isEditable={true}
                  onRequiredDateChange={handleRequiredDateChange}
                  onReferenceNumberChange={handleReferenceNumberChange}
                  onBillingAddressChange={handleBillingAddressChange}
                  onShippingAddressChange={handleShippingAddressChange}
                  onSellerBranchChange={handleSellerBranchChange}
                  onWarehouseChange={handleWarehouseChange}
                  userId={user?.userId?.toString()}
                  buyerBranchId={
                    orderDetails.data?.orderDetails?.[0]
                      ?.buyerBranchId as number
                  }
                  buyerCompanyId={user?.companyId}
                  productIds={
                    orderDetails.data?.orderDetails?.[0]?.dbProductDetails?.map(
                      p => p.productId
                    ) as number[]
                  }
                  sellerCompanyId={
                    orderDetails.data?.orderDetails?.[0]
                      ?.sellerCompanyId as number
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
            <div className="w-full lg:w-[30%] mt-[52px]">
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
    </div>
  );
}
