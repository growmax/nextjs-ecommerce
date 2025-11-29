"use client";
import { Toaster } from "@/components/ui/sonner";
import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import { RequestEditDialog } from "@/components/dialogs/RequestEditDialog";
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import { ApplicationLayout, PageLayout } from "@/components/layout";
import {
  DetailsSkeleton,
  OrderContactDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useOrderDetails } from "@/hooks/details/orderdetails/useOrderDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";
import { useLoading } from "@/hooks/useGlobalLoader";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import { useTenantData } from "@/hooks/useTenantData";
import type { PaymentDueDataItem } from "@/lib/api";
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
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";
import {
  getLastDateToPay,
  getStatusStyle,
  getUserPreferences,
  isEditInProgress,
  isOrderCancelled,
} from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/General/general";
import { useQuery } from "@tanstack/react-query";
const OrderProductsTable = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderProductsTable),
  {
    ssr: false,
  }
);

const OrderPriceDetails = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderPriceDetails),
  {
    ssr: false,
  }
);

const OrderStatusTracker = dynamic(
  () => import("@/components/sales").then(mod => mod.OrderStatusTracker),
  {
    ssr: false,
  }
);

export default function OrderDetailsClient({ params }: OrderDetailsPageProps) {
  // Use the page loader hook to ensure navigation spinner is hidden immediately
  usePageLoader();

  const [orderId, setOrderId] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);
  const { push } = useNavigationWithLoader();
  const t = useTranslations("orders");
  const tDetails = useTranslations("details");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [requestEditDialogOpen, setRequestEditDialogOpen] = useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<SelectedVersion | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { showLoading, hideLoading } = useLoading();

  const preferences = getUserPreferences();
  const userId = user?.userId;
  const companyId = user?.companyId;
  const tenantCode = tenantData?.tenant?.tenantCode;

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
      setParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  // React Query hook for order details - runs when all params are ready
  const {
    data: orderDetails,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["orderDetails", orderId, userId, companyId, tenantCode],
    queryFn: async () => {
      if (!userId || !tenantCode || !companyId || !orderId) {
        throw new Error("Missing required parameters");
      }

      const response = await OrderDetailsService.fetchOrderDetails({
        userId,
        tenantId: tenantCode,
        companyId,
        orderId,
      });

      return response;
    },
    enabled:
      paramsLoaded && !!orderId && !!userId && !!tenantCode && !!companyId,
    initialData: initialOrderDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes - order details may change
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // React Query hook for payment history - runs in parallel with order details
  const { data: paymentHistory = [], refetch: refetchPaymentHistory } =
    useQuery({
      queryKey: ["paymentHistory", orderId],
      queryFn: async () => {
        if (!orderId) {
          return [];
        }

        try {
          const response =
            await PaymentService.fetchOverallPaymentsByOrder(orderId);
          return Array.isArray(response?.data) ? response.data : [];
        } catch {
          return [];
        }
      },
      enabled: paramsLoaded && !!orderId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    });

  // React Query hook for payment due - runs in parallel with order details
  const { data: paymentDueData = [], refetch: refetchPaymentDue } = useQuery({
    queryKey: ["paymentDue", orderId],
    queryFn: async () => {
      if (!orderId) {
        return [];
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
        return data;
      } catch {
        return [];
      }
    },
    enabled: paramsLoaded && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Handle order details errors
  useEffect(() => {
    if (orderError) {
      const errorMessage =
        orderError instanceof Error
          ? orderError.message
          : t("failedToFetchOrderDetails");
      toast.error(errorMessage);
    }
  }, [orderError, t]);

  const totalPaid = paymentHistory.reduce(
    (sum, item) => sum + (item.amountReceived || 0),
    0
  );

  const {
    versions: orderVersions,
    orderIdentifier,
    orderVersion,
  } = useOrderDetails({
    orderDetails: orderDetails ?? null,
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

  // Consolidated loading state - only show one loader at a time
  // We REMOVE the check for initial orderLoading. The initial load will be handled
  // by the Skeleton UI in the JSX. We ONLY show global spinner for background actions.
  useEffect(() => {
    if (versionLoading && triggerVersionCall) {
      showLoading("Loading version details...", "order-details-page");
    } else {
      // Ensure page-specific global loader is hidden
      hideLoading("order-details-page");
    }
  }, [versionLoading, triggerVersionCall, showLoading, hideLoading]);

  const processedVersionRef = useRef<string | null>(null);

  useEffect(() => {
    if (versionData && selectedVersion) {
      const versionKey = `${selectedVersion.versionNumber}-${selectedVersion.orderVersion}`;

      if (processedVersionRef.current === versionKey) {
        return;
      }

      processedVersionRef.current = versionKey;
      setTriggerVersionCall(false);

      if (!versionLoading) {
        const versionName =
          orderVersions.find(
            (v: Version) => v.versionNumber === selectedVersion.versionNumber
          )?.versionName ||
          `${tDetails("version")} ${selectedVersion.versionNumber}`;
        toast.success(t("loadedVersionDetails", { versionName }));
      }
    }
  }, [
    versionData,
    versionLoading,
    selectedVersion,
    orderVersions,
    t,
    tDetails,
  ]);

  const handleRefresh = async () => {
    if (!orderId || !user || !tenantData?.tenant) return;

    // Show loading progress bar (use same ID to prevent multiple loaders)
    showLoading("Refreshing order details...", "order-details-page");

    try {
      // Refetch all three queries in parallel using React Query
      await Promise.all([
        refetchOrder(),
        refetchPaymentHistory(),
        refetchPaymentDue(),
      ]);
    } finally {
      // Hide loading progress bar
      hideLoading("order-details-page");
    }
  };

  const handleClose = () => {
    push("/landing/orderslanding");
    push("/landing/orderslanding");
  };

  const handleEditQuote = () => {
    if (orderId) {
      push(`/details/orderDetails/${orderId}/edit`);
    }
    if (orderId) {
      push(`/details/orderDetails/${orderId}/edit`);
    }
  };

  const handleEditOrder = () => {
    // Navigate to edit page when edit icon is clicked - non-blocking
    if (orderId) {
      push(`/details/orderDetails/${orderId}/edit`);
    }
  };


  const handleSaveOrderName = async (newOrderName: string) => {
    if (!user || !orderDetails?.data?.orderDetails?.[0]?.orderIdentifier) {
      throw new Error("Missing required data for updating order name");
    }

    showLoading("Saving order name...", "order-details-page");
    try {
      await OrderNameService.updateOrderName({
        userId: user.userId,
        companyId: user.companyId,
        orderIdentifier: orderDetails.data.orderDetails[0].orderIdentifier,
        orderName: newOrderName,
      });

      // Invalidate and refetch order details to get updated data
      await refetchOrder();
    } catch (err) {
      throw err;
    } finally {
      hideLoading("order-details-page");
    }
  };

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
      detail?.pfRate ?? detailOrderTerms?.pfValue ?? primaryHeader?.pfRate ?? 0
    );

    return {
      isInter: resolvedIsInter,
      taxExemption: resolvedTaxExemption,
      insuranceCharges: Number.isFinite(resolvedInsurance)
        ? resolvedInsurance
        : 0,
      overallShipping: Number.isFinite(resolvedShipping) ? resolvedShipping : 0,
      pfRate: Number.isFinite(resolvedPfRate) ? resolvedPfRate : 0,
    };
  }, [displayOrderDetails, orderDetails?.data, user]);

  const { orderSettings } = useModuleSettings(user);

  const isSPRRequested = useMemo(() => {
    const products =
      displayOrderDetails?.orderDetails?.[0]?.dbProductDetails ||
      orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
      [];
    return products.some(
      (product: any) => product?.isSprRequested || product?.sprRequested
    );
  }, [displayOrderDetails, orderDetails]);

  const requestEditCheck = () => {
    const sellerStatus = (displayOrderDetails?.updatedSellerStatus ||
      orderDetails?.data?.updatedSellerStatus) as string | undefined;

    if (
      sellerStatus === "INVOICED" ||
      sellerStatus === "INVOICED PARTIALLY" ||
      sellerStatus === "SHIPPED" ||
      (sellerStatus === "ORDER BOOKED" &&
        orderSettings?.editOrder === "ORDER ACCEPTED")
    ) {
      toast.info(
        t("orderInvoiceBookedAlready", {
          type:
            orderSettings?.editOrder === "ORDER BOOKED"
              ? "invoice"
              : "booked or invoiced",
        }),
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
    } else if (status?.toUpperCase() === "REQUESTED EDIT") {
      toast.info(t("requestedForEditAlready"), {
        style: {
          backgroundColor: "#ABE7B2", // green-500
          color: "#ffffff", // white
          fontSize: "0.875rem", // text-sm
          padding: "0.5rem 0.75rem", // smaller padding
        },
        className: "text-sm px-3 py-2",
      });
    } else {
      if (isSPRRequested) {
        toast.info(t("editAccessNotPossibleSPR"), {
          style: {
            backgroundColor: "#22c55e", // green-500
            color: "#ffffff", // white
            fontSize: "0.875rem", // text-sm
            padding: "0.5rem 0.75rem", // smaller padding
          },
          className: "text-sm px-3 py-2",
        });
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
      toast.info(t("orderCancelledAlready"), {
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

    requestEditCheck();
  };

  const handleConfirmRequestEdit = async () => {
    if (!user || !orderId) {
      toast.error(t("missingRequiredInformation"));
      return;
    }

    showLoading("Submitting edit request...", "order-details-page");
    try {
      await RequestEditService.requestEdit({
        userId: user.userId,
        companyId: user.companyId,
        orderId,
        data: {}, // Empty data object as per API
      });

      toast.success(t("editRequestSubmitted"));
      await handleRefresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("failedToSubmitEditRequest");
      toast.error(errorMessage);
      throw error;
    } finally {
      hideLoading("order-details-page");
    }
  };

  const handleClone = () => {
    toast.info(t("cloneFunctionalityComingSoon"));
  };

  const handleDownloadPDF = () => {
    toast.info(t("downloadPDFFunctionalityComingSoon"));
  };

  const handleVersionSelect = (version: Version) => {
    setVersionsDialogOpen(false);

    if (version.versionNumber === 1) {
      if (orderDetails) {
        processedVersionRef.current = null;
        setSelectedVersion(null);
        setTriggerVersionCall(false);
        handleRefresh();
      }
      return;
    }

    processedVersionRef.current = null;
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

  const headerButtons = editInProgress
    ? [
        {
          label: t("editOrderButton"),
          variant: "outline" as const,
          onClick: handleEditQuote,
        },
      ]
    : [
        {
          label: t("requestEdit"),
          variant: "outline" as const,
          onClick: handleRequestEdit,
        },
      ];

  const lastDateToPay = getLastDateToPay(paymentDueData, preferences);

  return (
    <ApplicationLayout className="bg-background">
      {/* Sales Header */}
      <div className="flex-shrink-0">
        <SalesHeader
          title={orderName ? decodeUnicode(orderName) : t("orderDetails")}
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
              label: tDetails("clone"),
              onClick: handleClone,
            },
            {
              label: tDetails("downloadPDF"),
              onClick: handleDownloadPDF,
            },
          ]}
          buttons={headerButtons}
          showEditIcon={true}
          loading={orderLoading}
        />
      </div>

      {/* Order Details Content - Scrollable area */}
      <div className="flex-1 w-full">
        <PageLayout variant="content">
          {orderLoading ? (
            <DetailsSkeleton
              showStatusTracker={true}
              leftWidth="lg:w-[65%]"
              rightWidth="lg:w-[33%]"
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Left Side - Status Tracker and Products Table - 60% */}
              <div className="w-full lg:w-[65%] space-y-2 sm:space-y-3">
                {/* Cancellation Card */}
                {cancelled &&
                  cancelMsg &&
                  !orderLoading &&
                  (orderDetails || displayOrderDetails) && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
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
                            {t("reasonForCancellation")}
                          </div>
                          <div className="text-sm sm:text-base font-medium text-red-600">
                            {cancelMsg || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {/* Status Tracker - Reserve space to prevent layout shift */}
                {!orderLoading &&
                  !orderError &&
                  (orderDetails || displayOrderDetails) &&
                  !cancelled && (
                    <div className="mt-4">
                      <Suspense
                        fallback={
                          <div
                            className="h-48 w-full"
                            aria-label="Loading status tracker"
                          />
                        }
                      >
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
                            total:
                              displayOrderDetails.orderDetails[0].grandTotal,
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
                            orderDetails?.data?.buyerCurrencySymbol
                              ?.symbol) && {
                            currencySymbol:
                              displayOrderDetails?.buyerCurrencySymbol
                                ?.symbol ||
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
                {!orderLoading &&
                  !orderError &&
                  (orderDetails || displayOrderDetails) && (
                    <Suspense fallback={null}>
                      <OrderProductsTable
                        products={
                          displayOrderDetails?.orderDetails?.[0]
                            ?.dbProductDetails ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.dbProductDetails ||
                          []
                        }
                        {...((displayOrderDetails?.orderDetails?.[0]
                          ?.dbProductDetails?.length ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.dbProductDetails?.length) && {
                          totalCount:
                            displayOrderDetails?.orderDetails?.[0]
                              ?.dbProductDetails?.length ||
                            orderDetails?.data?.orderDetails?.[0]
                              ?.dbProductDetails?.length ||
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
                {!orderLoading &&
                  !orderError &&
                  (orderDetails || displayOrderDetails) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 details-card-gap details-section-margin">
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
                              ?.sellerBranchName) as unknown as
                            | string
                            | undefined
                        }
                        requiredDate={
                          (displayOrderDetails?.orderDetails?.[0]
                            ?.customerRequiredDate ||
                            displayOrderDetails?.orderDeliveryDate ||
                            orderDetails?.data?.orderDetails?.[0]
                              ?.customerRequiredDate ||
                            orderDetails?.data
                              ?.orderDeliveryDate) as unknown as
                            | string
                            | undefined
                        }
                        referenceNumber={
                          ((displayOrderDetails?.buyerReferenceNumber ||
                            orderDetails?.data
                              ?.buyerReferenceNumber) as string) || "-"
                        }
                      />

                      {/* Terms Card */}
                      <OrderTermsCard
                        orderTerms={
                          {
                            ...(displayOrderDetails?.orderDetails?.[0]
                              ?.orderTerms ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.orderTerms ||
                              {}),
                            additionalTerms: (displayOrderDetails
                              ?.orderDetails?.[0]?.additionalTerms ||
                              orderDetails?.data?.orderDetails?.[0]
                                ?.additionalTerms) as string | undefined,
                          } as OrderTerms
                        }
                      />
                    </div>
                  )}
              </div>

              {/* Right Side - Price Details - 40% */}
              {!orderLoading &&
                !orderError &&
                (orderDetails || displayOrderDetails) && (
                  <div className="w-full lg:w-[33%] mt-4">
                    <Suspense fallback={null}>
                      <OrderPriceDetails
                        products={
                          displayOrderDetails?.orderDetails?.[0]
                            ?.dbProductDetails ||
                          orderDetails?.data?.orderDetails?.[0]
                            ?.dbProductDetails ||
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
                        orderDetails?.data?.orderDetails?.[0]
                          ?.overallShipping !== undefined
                          ? {
                              overallShipping: pricingContext.overallShipping,
                            }
                          : {})}
                        {...(displayOrderDetails?.orderDetails?.[0]
                          ?.overallTax !== undefined ||
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
                        orderDetails?.data?.orderDetails?.[0]
                          ?.calculatedTotal !== undefined ||
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
                        {...(displayOrderDetails?.orderDetails?.[0]
                          ?.subTotal !== undefined ||
                        orderDetails?.data?.orderDetails?.[0]?.subTotal !==
                          undefined
                          ? {
                              subTotal: Number(
                                displayOrderDetails?.orderDetails?.[0]
                                  ?.subTotal ||
                                  orderDetails?.data?.orderDetails?.[0]
                                    ?.subTotal ||
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
          )}
        </PageLayout>
      </div>

      {/* Right Sidebar Icons - Positioned just below the SalesHeader component, flush to right edge */}
      <div className="fixed right-0 top-[127px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
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
        loading={orderLoading}
      />

      <RequestEditDialog
        open={requestEditDialogOpen}
        onOpenChange={setRequestEditDialogOpen}
        onConfirm={handleConfirmRequestEdit}
        loading={orderLoading}
      />

      {/* Versions Dialog */}
      <VersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        versions={orderVersions}
        orderId={orderId}
        loading={orderLoading || versionLoading}
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
    </ApplicationLayout>
  );
}
