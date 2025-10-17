use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SalesHeader from "@/components/custom/sales-header";
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
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_match, grp) =>
      String.fromCharCode(parseInt(grp, 16))
    );
  } catch {
    return str;
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClose = () => {
    router.push(`/${locale}/landing/orderslanding`);
  };

  const handleViewInvoice = () => {
    toast.info("View invoice functionality coming soon");
  };

  const handleDownload = () => {
    toast.info("Download functionality coming soon");
  };

  const handleMenuClick = () => {
    toast.info("Menu options coming soon");
  };

  const orderName = orderDetails?.data?.orderDetails?.[0]?.orderName;
  const status = orderDetails?.data?.updatedBuyerStatus;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sales Header */}
      <SalesHeader
        title={
          loading
            ? "Loading..."
            : orderName
              ? decodeUnicode(orderName)
              : "Order Details"
        }
        identifier={orderId}
        status={
          status
            ? {
                label: status,
                className: getStatusStyle(status),
              }
            : undefined
        }
        onRefresh={handleRefresh}
        onClose={handleClose}
        onMenuClick={handleMenuClick}
        buttons={[
          {
            label: "VIEW INVOICE",
            variant: "outline",
            onClick: handleViewInvoice,
          },
          {
            label: "DOWNLOAD",
            variant: "default",
            onClick: handleDownload,
          },
        ]}
        showEditIcon={false}
      />

      {/* Order Details Content */}
      <div className="container mx-auto p-4 space-y-6">
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : orderDetails ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Order Name:{" "}
                {orderDetails.data?.orderDetails?.[0]?.orderName
                  ? decodeUnicode(orderDetails.data.orderDetails[0].orderName)
                  : "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Order ID:{" "}
                {orderDetails.data?.orderDetails?.[0]?.orderIdentifier ||
                  orderDetails.data?.orderIdentifier ||
                  orderId}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
