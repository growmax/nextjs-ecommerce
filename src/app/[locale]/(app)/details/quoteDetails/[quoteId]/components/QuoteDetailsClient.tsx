"use client";

import { FileText, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import PricingFormat from "@/components/PricingFormat";
import {
  CustomerInfoCard,
  DetailsSkeleton,
  OrderContactDetails,
  OrderProductsTable,
  OrderPriceDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { Label } from "@/components/ui/label";
import { useQuoteDetails } from "@/hooks/details/quotedetails/useQuoteDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { usePageLoader } from "@/hooks/usePageLoader";
import { usePostNavigationFetch } from "@/hooks/usePostNavigationFetch";
import { useTenantData } from "@/hooks/useTenantData";
import type { QuotationDetailsResponse } from "@/lib/api";
import { QuotationDetailsService } from "@/lib/api";
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";
import { getStatusStyle } from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/General/general";

interface QuoteDetailsClientProps {
  params: Promise<{ quoteId: string }>;
}

export default function QuoteDetailsClient({
  params,
}: QuoteDetailsClientProps) {
  const [quoteIdentifier, setQuoteIdentifier] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);
  const t = useTranslations("quotes");
  const tDetails = useTranslations("details");

  const [quoteDetails, setQuoteDetails] =
    useState<QuotationDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<SelectedVersion | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { push } = useNavigationWithLoader();

  // Hide navigation loader to show page skeleton instead
  usePageLoader();

  const lastFetchKeyRef = useRef<string | null>(null);
  const processedVersionRef = useRef<string | null>(null);
  const userId = user?.userId;
  const companyId = user?.companyId;
  const tenantCode = tenantData?.tenant?.tenantCode;

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      const identifier = resolvedParams.quoteId || "";
      setQuoteIdentifier(identifier);
      setParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  // Fetch function - shared between usePostNavigationFetch and useEffect fallback
  const fetchQuoteDetails = useCallback(async () => {
    // Wait for params and user data to be available
    // Note: tenantCode is optional and only used for deduplication, not required for API call
    if (!paramsLoaded || !quoteIdentifier || !userId || !companyId) {
      return;
    }

    const fetchKey = [
      quoteIdentifier,
      userId,
      companyId,
      tenantCode || "",
    ].join("|");

    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await QuotationDetailsService.fetchQuotationDetails({
        userId,
        companyId,
        quotationIdentifier: quoteIdentifier,
      });

      // Validate response structure
      if (response && response.data) {
        setQuoteDetails(response);
        lastFetchKeyRef.current = fetchKey;
      } else {
        throw new Error("Invalid response structure from API");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("failedToFetchQuoteDetails");
      setError(errorMessage);
      toast.error(errorMessage);
      // Ensure loading is set to false even on error
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [paramsLoaded, quoteIdentifier, userId, companyId, tenantCode, t]);

  // Fetch quote details after navigation completes - ensures instant navigation
  usePostNavigationFetch(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]);

  // Fallback useEffect to ensure fetch happens when dependencies are ready
  // This ensures the API is called even if usePostNavigationFetch doesn't trigger
  useEffect(() => {
    // Only fetch if all dependencies are ready
    // The fetchQuoteDetails function handles deduplication internally
    if (paramsLoaded && quoteIdentifier && userId && companyId) {
      // Small delay to let usePostNavigationFetch try first, then fallback
      const timer = setTimeout(() => {
        fetchQuoteDetails();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [paramsLoaded, quoteIdentifier, userId, companyId, fetchQuoteDetails]);

  const {
    versions: quoteVersions,
    quotationIdentifier,
    quotationVersion,
  } = useQuoteDetails({
    quoteDetails,
    quoteIdentifier,
    selectedVersion,
  });

  const { data: versionData, isLoading: versionLoading } = useGetVersionDetails(
    {
      orderIdentifier: quotationIdentifier,
      orderVersion: quotationVersion,
      triggerVersionCall,
    }
  );

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
          quoteVersions.find(
            (v: Version) => v.versionNumber === selectedVersion.versionNumber
          )?.versionName ||
          `${tDetails("version")} ${selectedVersion.versionNumber}`;
        toast.success(t("loadedQuoteVersionDetails", { versionName }));
      }
    }
  }, [
    versionData,
    versionLoading,
    selectedVersion,
    quoteVersions,
    t,
    tDetails,
  ]);

  const displayQuoteDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return quoteDetails?.data;
  }, [versionData, selectedVersion, quoteDetails?.data]);

  const quoteName =
    (displayQuoteDetails?.quotationDetails as any)?.[0]?.quoteName ||
    quoteDetails?.data?.quotationDetails?.[0]?.quoteName ||
    quoteDetails?.data?.quoteName ||
    "";
  const status =
    displayQuoteDetails?.updatedBuyerStatus ||
    quoteDetails?.data?.updatedBuyerStatus;

  const displayQuoteId =
    displayQuoteDetails?.quotationIdentifier ||
    quoteDetails?.data?.quotationIdentifier ||
    (displayQuoteDetails?.quotationDetails as any)?.[0]?.quotationIdentifier ||
    quoteDetails?.data?.quotationDetails?.[0]?.quotationIdentifier ||
    quoteIdentifier ||
    "...";

  const handleEditQuote = () => {
    const updatedBuyerStatus =
      displayQuoteDetails?.updatedBuyerStatus ||
      quoteDetails?.data?.updatedBuyerStatus;
    const reorder = displayQuoteDetails?.reorder || quoteDetails?.data?.reorder;
    const validityTill = (displayQuoteDetails?.validityTill ||
      quoteDetails?.data?.validityTill) as string | undefined;

    if (updatedBuyerStatus === "CANCELLED") {
      toast.info(t("quoteCancelledAlready"), {
        position: "bottom-left",
      });
      return;
    }

    if (
      updatedBuyerStatus === "QUOTE RECEIVED" ||
      updatedBuyerStatus === "OPEN"
    ) {
      // Non-blocking navigation
      if (quoteIdentifier) {
        push(`/details/quoteDetails/${quoteIdentifier}/edit`);
      }
      // Non-blocking navigation
      if (quoteIdentifier) {
        push(`/details/quoteDetails/${quoteIdentifier}/edit`);
      }
      return;
    }

    if (reorder && validityTill) {
      const validityDate = new Date(validityTill);
      const endOfValidityDay = new Date(validityDate);
      endOfValidityDay.setHours(23, 59, 59, 999);

      if (new Date() > endOfValidityDay) {
        toast.info(t("contractValidityExpired"), {
          position: "bottom-left",
        });
        return;
      }
    }

    // Check if order placed
    if (updatedBuyerStatus === "ORDER PLACED") {
      toast.info(t("quoteConvertedToOrderAlready"), {
        position: "bottom-left",
      });
      return;
    }

    // Default message for other statuses
    toast.info(t("quoteOwnerWorkingOnQuote"), {
      position: "bottom-left",
    });
  };

  const handleEditQuoteName = () => {
    setEditDialogOpen(true);
  };

  const handleSaveQuoteName = async (newQuoteName: string) => {
    if (!user || !displayQuoteId) {
      throw new Error(t("missingRequiredDataForUpdatingQuoteName"));
    }

    try {
      await QuotationNameService.updateQuotationName({
        userId: user.userId,
        companyId: user.companyId,
        quotationIdentifier: displayQuoteId,
        quotationName: newQuoteName,
      });

      if (quoteDetails && quoteDetails.data?.quotationDetails) {
        const updatedQuoteDetails = {
          ...quoteDetails,
          data: {
            ...quoteDetails.data,
            quotationDetails: quoteDetails.data.quotationDetails.map(
              (quote, index) =>
                index === 0 ? { ...quote, quoteName: newQuoteName } : quote
            ),
          },
        };
        setQuoteDetails(updatedQuoteDetails);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    if (!userId || !companyId || !quoteIdentifier) {
      return;
    }

    try {
      setLoading(true);
      const response = await QuotationDetailsService.fetchQuotationDetails({
        userId,
        companyId,
        quotationIdentifier: quoteIdentifier,
      });
      setQuoteDetails(response);
      toast.success(t("quoteDetailsRefreshed"));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("failedToRefreshQuoteDetails");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    push("/landing/quoteslanding");
    push("/landing/quoteslanding");
  };

  const handleClone = () => {
    toast.info(t("cloneFunctionalityWillBeImplementedSoon"));
  };

  const handleDownloadPDF = () => {
    toast.info(t("pdfDownloadFunctionalityWillBeImplementedSoon"));
  };

  const handleConvertToOrder = () => {
    const updatedBuyerStatus =
      displayQuoteDetails?.updatedBuyerStatus ||
      quoteDetails?.data?.updatedBuyerStatus;
    const reorder = displayQuoteDetails?.reorder || quoteDetails?.data?.reorder;
    const validityTill = (displayQuoteDetails?.validityTill ||
      quoteDetails?.data?.validityTill) as string | undefined;

    if (updatedBuyerStatus === "CANCELLED") {
      toast.info(t("quoteCancelledAlready"), {
        position: "bottom-left",
      });
      return;
    }

    if (validityTill) {
      const validityDate = new Date(validityTill);
      const endOfValidityDay = new Date(validityDate);
      endOfValidityDay.setHours(23, 59, 59, 999);

      if (new Date() > endOfValidityDay) {
        toast.info(t("contractValidityExpired"), {
          position: "bottom-left",
        });
        return;
      }
    }

    // Check if quote is in OPEN status
    if (updatedBuyerStatus === "OPEN") {
      toast.info(t("quoteOwnerWorkingWaitForResponse"), {
        position: "bottom-left",
      });
      return;
    }

    if (updatedBuyerStatus === "ORDER PLACED") {
      toast.info(t("quoteConvertedToOrderAlready"), {
        position: "bottom-left",
      });
      return;
    }

    if (
      (reorder && validityTill && new Date() < new Date(validityTill)) ||
      updatedBuyerStatus === "QUOTE RECEIVED"
    ) {
      // Non-blocking navigation
      if (quoteIdentifier) {
        push(`/details/quoteDetails/${quoteIdentifier}/edit?placeOrder=true`);
      }
      // Non-blocking navigation
      if (quoteIdentifier) {
        push(`/details/quoteDetails/${quoteIdentifier}/edit?placeOrder=true`);
      }
      return;
    }

    // Default message for other statuses
    toast.info(t("quoteOwnerWorkingOnQuote"), {
      position: "bottom-left",
    });
  };

  const handleVersionSelect = (version: Version) => {
    setVersionsDialogOpen(false);

    if (version.versionNumber === 1) {
      if (quoteDetails) {
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

  const products = useMemo(() => {
    const rawProducts =
      (displayQuoteDetails?.quotationDetails as any)?.[0]?.dbProductDetails ||
      quoteDetails?.data?.quotationDetails?.[0]?.dbProductDetails ||
      [];

    return rawProducts.map((product: any) => {
      const quantity =
        product.askedQuantity || product.quantity || product.unitQuantity || 0;

      const transformed: Record<string, unknown> = {
        ...product,
        itemNo:
          typeof product.itemNo === "string"
            ? parseInt(product.itemNo, 10)
            : (product.itemNo as number),
        quantity,
        unitQuantity: quantity,
      };

      if (product.productTaxes) {
        transformed.productTaxes = product.productTaxes;
      }

      return transformed;
    });
  }, [displayQuoteDetails?.quotationDetails, quoteDetails?.data]);

  const quoteDetailData =
    (
      displayQuoteDetails?.quotationDetails as Array<Record<string, unknown>>
    )?.[0] || quoteDetails?.data?.quotationDetails?.[0];
  const buyerCurrencySymbol =
    displayQuoteDetails?.buyerCurrencySymbol ||
    quoteDetails?.data?.buyerCurrencySymbol;

  const headerButtons = [
    {
      label: t("editQuoteButton"),
      variant: "outline" as const,
      onClick: handleEditQuote,
    },
    {
      label: t("placeOrderButton"),
      variant: "default" as const,
      onClick: handleConvertToOrder,
    },
  ];

  const sprDetails = (quoteDetailData?.sprDetails as any) || null;
  const showTargetDiscount =
    sprDetails &&
    (sprDetails?.targetPrice > 0 || sprDetails?.sprRequestedDiscount > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Sales Header - Fixed at top */}
      <SalesHeader
        title={quoteName ? decodeUnicode(quoteName) : t("quoteDetails")}
        identifier={displayQuoteId}
        {...(status && {
          status: {
            label: status,
            className: getStatusStyle(status),
          },
        })}
        onEdit={handleEditQuoteName}
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
        loading={loading}
      />

      {/* Quote Details Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-0">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          {loading ? (
            <DetailsSkeleton
              showStatusTracker={false}
              leftWidth="lg:w-[65%]"
              rightWidth="lg:w-[33%]"
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
              {/* Left Side - Products Table, Contact & Terms - 65% */}
              <div className="w-full lg:w-[65%] space-y-2 sm:space-y-3">
                {/* Products Table */}
                {!loading && !error && quoteDetails && (
                  <div className="mt-[55px]">
                    <OrderProductsTable
                      products={products}
                      {...(products.length && {
                        totalCount: products.length,
                      })}
                      showInvoicedQty={false}
                      onExport={() => {
                        const filename = `Quote_${quoteIdentifier}_Products.csv`;
                        exportProductsToCsv(
                          products as ProductCsvRow[],
                          filename
                        );
                      }}
                    />
                  </div>
                )}

                {/* Contact Details and Terms Cards - Side by Side */}
                {!loading && !error && quoteDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {/* Contact Details Card */}
                    <OrderContactDetails
                      billingAddress={
                        quoteDetailData?.billingAddressDetails as unknown as Record<
                          string,
                          unknown
                        >
                      }
                      shippingAddress={
                        quoteDetailData?.shippingAddressDetails as unknown as Record<
                          string,
                          unknown
                        >
                      }
                      registerAddress={
                        quoteDetailData?.registerAddressDetails as unknown as Record<
                          string,
                          unknown
                        >
                      }
                      sellerAddress={
                        quoteDetailData?.sellerAddressDetail as unknown as Record<
                          string,
                          unknown
                        >
                      }
                      buyerCompanyName={
                        (quoteDetailData?.buyerCompanyName as string) || ""
                      }
                      buyerBranchName={
                        (quoteDetailData?.buyerBranchName as string) || ""
                      }
                      warehouseName={
                        (
                          (
                            quoteDetailData?.dbProductDetails as Array<
                              Record<string, unknown>
                            >
                          )?.[0] as Record<string, Record<string, string>>
                        )?.wareHouse?.wareHouseName ||
                        (
                          (
                            quoteDetailData?.dbProductDetails as Array<
                              Record<string, unknown>
                            >
                          )?.[0] as Record<string, string>
                        )?.orderWareHouseName
                      }
                      warehouseAddress={
                        (
                          (
                            quoteDetailData?.dbProductDetails as Array<
                              Record<string, unknown>
                            >
                          )?.[0] as Record<
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
                        (quoteDetailData?.sellerBranchName as string) ||
                        undefined
                      }
                      requiredDate={
                        (quoteDetailData?.customerRequiredDate ||
                          quoteDetails?.data?.validityTill) as
                          | string
                          | undefined
                      }
                      referenceNumber={
                        (quoteDetails?.data?.buyerReferenceNumber as string) ||
                        "-"
                      }
                    />

                    {/* Terms Card */}
                    <OrderTermsCard
                      orderTerms={
                        {
                          ...(quoteDetailData?.quoteTerms as unknown as Record<
                            string,
                            unknown
                          >),
                          // Add additionalTerms from quotationDetails level
                          additionalTerms:
                            quoteDetailData?.additionalTerms as string,
                        } as unknown as Record<string, unknown>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Right Side - Price Details - 33% */}
              {!loading && !error && quoteDetails && (
                <div className="w-full lg:w-[33%] mt-[55px]">
                  <OrderPriceDetails
                    products={products}
                    isInter={(() => {
                      // Determine if inter-state based on product taxes (IGST = inter-state, SGST/CGST = intra-state)
                      if (products.length > 0 && products[0]) {
                        const firstProduct = products[0] as Record<
                          string,
                          unknown
                        >;
                        if (
                          firstProduct.productTaxes &&
                          Array.isArray(firstProduct.productTaxes)
                        ) {
                          const hasIGST = firstProduct.productTaxes.some(
                            (t: Record<string, unknown>) => t.taxName === "IGST"
                          );
                          return hasIGST;
                        }
                      }
                      return false;
                    })()}
                    insuranceCharges={
                      Number(quoteDetailData?.insuranceCharges) || 0
                    }
                    precision={2}
                    Settings={{
                      roundingAdjustment:
                        quoteDetailData?.roundingAdjustmentEnabled || false,
                    }}
                    isSeller={
                      (user as { isSeller?: boolean })?.isSeller || false
                    }
                    taxExemption={
                      (user as { taxExemption?: boolean })?.taxExemption ||
                      false
                    }
                    currency={buyerCurrencySymbol?.symbol || "INR ₹"}
                    overallShipping={Number(
                      quoteDetailData?.overallShipping || 0
                    )}
                    overallTax={Number(quoteDetailData?.overallTax || 0)}
                    calculatedTotal={Number(
                      quoteDetailData?.calculatedTotal ||
                        quoteDetailData?.grandTotal ||
                        0
                    )}
                    subTotal={Number(quoteDetailData?.subTotal || 0)}
                    taxableAmount={Number(quoteDetailData?.taxableAmount || 0)}
                  />

                  {/* Target Discount Card - Display only on detail page */}
                  {showTargetDiscount && (
                    <div className="mt-4">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 bg-gray-50 rounded-t-lg border-b">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Target Discount
                          </h3>
                        </div>
                        <div className="px-6 py-4">
                          <div className="space-y-4">
                            {/* Target Discount Display */}
                            <div className="flex justify-between items-center py-2">
                              <Label className="text-sm font-normal text-gray-900 w-1/2">
                                Total Discount
                              </Label>
                              <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
                                {(
                                  sprDetails?.sprRequestedDiscount || 0
                                ).toFixed(2)}
                                %
                              </div>
                            </div>
                            {/* Target Price Display */}
                            <div className="flex justify-between items-center py-2">
                              <Label className="text-sm font-normal text-gray-900 w-1/2">
                                Target Price (Excl. taxes)
                              </Label>
                              <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
                                <PricingFormat
                                  value={sprDetails?.targetPrice || 0}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Information Card */}
                  <div className="mt-4">
                    <CustomerInfoCard
                      quoteValidity={{
                        from:
                          ((displayQuoteDetails?.validityFrom ||
                            quoteDetails?.data?.validityFrom) as string) ||
                          undefined,
                        till:
                          ((displayQuoteDetails?.validityTill ||
                            quoteDetails?.data?.validityTill) as string) ||
                          undefined,
                      }}
                      contractEnabled={
                        ((displayQuoteDetails?.purchaseOrder ||
                          quoteDetails?.data?.purchaseOrder) as boolean) ||
                        false
                      }
                      endCustomerName={
                        (
                          quoteDetailData?.sprDetails as
                            | { companyName?: string }
                            | undefined
                        )?.companyName || undefined
                      }
                      projectName={
                        (
                          quoteDetailData?.sprDetails as
                            | { projectName?: string }
                            | undefined
                        )?.projectName || undefined
                      }
                      competitorNames={
                        (
                          quoteDetailData?.sprDetails as
                            | { competitorNames?: string[] }
                            | undefined
                        )?.competitorNames || []
                      }
                      priceJustification={
                        (
                          quoteDetailData?.sprDetails as
                            | { priceJustification?: string }
                            | undefined
                        )?.priceJustification || undefined
                      }
                    />
                  </div>

                  {/* Attachments Card */}
                  {(() => {
                    const attachments =
                      (displayQuoteDetails?.uploadedDocumentDetails ||
                        quoteDetails?.data?.uploadedDocumentDetails) as
                        | any[]
                        | undefined;
                    return (
                      attachments &&
                      Array.isArray(attachments) &&
                      attachments.length > 0
                    );
                  })() && (
                    <div className="mt-4">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 bg-gray-50 rounded-t-lg border-b">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Attachments
                          </h3>
                        </div>
                        <div className="px-6 py-4">
                          <div className="space-y-2">
                            {(
                              (displayQuoteDetails?.uploadedDocumentDetails ||
                                quoteDetails?.data?.uploadedDocumentDetails ||
                                []) as any[]
                            ).map((attachment: any, index: number) => {
                              const fileUrl =
                                attachment.source ||
                                attachment.filePath ||
                                attachment.attachment;
                              const fileName =
                                attachment.name || `File ${index + 1}`;
                              const attachedBy =
                                attachment.width?.split(",")[0] || "Unknown";
                              const attachedDate = attachment.width?.split(
                                ","
                              )[1]
                                ? new Date(
                                    attachment.width.split(",")[1]
                                  ).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : null;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                  onClick={() => {
                                    if (fileUrl) {
                                      window.open(fileUrl, "_blank");
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {fileName}
                                      </p>
                                      {attachedBy && attachedDate && (
                                        <p className="text-xs text-muted-foreground">
                                          Attached By {attachedBy}{" "}
                                          {attachedDate}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Icons - Positioned just below the SalesHeader component, flush to right edge */}
      <div className="fixed right-0 top-[118px] z-50 bg-white border-l border-t border-b border-gray-200 shadow-lg rounded-l-lg p-1">
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

      {/* Edit Quote Name Dialog */}
      <EditOrderNameDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentOrderName={quoteName || ""}
        onSave={handleSaveQuoteName}
        loading={loading}
        title={t("editQuoteName") || "Edit Quote Name"}
        label={t("quoteName") || "Quote Name"}
        placeholder={t("enterQuoteName") || "Enter quote name"}
        successMessage="Quote name updated successfully"
        errorMessage={
          t("failedToUpdateQuoteName") || "Failed to update quote name"
        }
      />

      {/* Versions Dialog */}
      <VersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        versions={quoteVersions}
        orderId={quoteIdentifier}
        loading={loading}
        currentVersionNumber={selectedVersion?.versionNumber || 1}
        onVersionSelect={handleVersionSelect}
      />
    </div>
  );
}
