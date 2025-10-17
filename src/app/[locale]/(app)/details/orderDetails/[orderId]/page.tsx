"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SalesHeader } from "@/components/sales";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import type { OrderDetailsResponse } from "@/lib/api";
import { OrderDetailsService } from "@/lib/api";

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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6">
        <div className="min-h-[70vh] md:min-h-[80vh]">
          {loading ? (
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <Skeleton className="h-6 sm:h-7 md:h-8 w-48 sm:w-56 md:w-64" />
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-2">
                <Skeleton className="h-5 sm:h-6 w-full" />
                <Skeleton className="h-5 sm:h-6 w-3/4" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="shadow-sm border-destructive/50">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-destructive text-lg sm:text-xl md:text-2xl">
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  {error}
                </p>
              </CardContent>
            </Card>
          ) : orderDetails ? (
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                  <span className="block sm:inline">Order Name:</span>{" "}
                  <span className="block sm:inline text-gray-700">
                    {orderDetails.data?.orderDetails?.[0]?.orderName
                      ? decodeUnicode(
                          orderDetails.data.orderDetails[0].orderName
                        )
                      : "N/A"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <p className="text-sm sm:text-base text-muted-foreground break-all">
                  <span className="font-medium">Order ID:</span>{" "}
                  {orderDetails.data?.orderDetails?.[0]?.orderIdentifier ||
                    orderDetails.data?.orderIdentifier ||
                    orderId}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
