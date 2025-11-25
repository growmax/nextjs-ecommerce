"use client";

import { Toaster } from "@/components/ui/sonner";
import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  CustomerInfoCard,
  DetailsSkeleton,
  OrderContactDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components";
import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import { ApplicationLayout, PageLayout } from "@/components/layout";
import { useQuoteDetails } from "@/hooks/details/quotedetails/useQuoteDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch/useRoutePrefetch";
import { useTenantData } from "@/hooks/useTenantData/useTenantData";
import type { QuotationDetailsResponse } from "@/lib/api";
import { QuotationDetailsService } from "@/lib/api";
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";
import { getStatusStyle } from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/General/general";

// Dynamic imports for heavy components
// No loading prop to avoid double loaders - main DetailsSkeleton handles all loading states
const OrderProductsTable = dynamic(
  () => import("@/components").then(mod => mod.OrderProductsTable),
  {
    ssr: false,
  }
);

const OrderPriceDetails = dynamic(
  () => import("@/components").then(mod => mod.OrderPriceDetails),
  {
    ssr: false,
  }
);

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
  const { prefetch, prefetchAndNavigate } = useRoutePrefetch();

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

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      // Wait for params, user and tenant data to be available
      if (
        !paramsLoaded ||
        !quoteIdentifier ||
        !userId ||
        !tenantCode ||
        !companyId
      ) {
        return;
      }

      const fetchKey = [quoteIdentifier, userId, companyId, tenantCode].join(
        "|"
      );

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

        setQuoteDetails(response);
        lastFetchKeyRef.current = fetchKey;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("failedToFetchQuoteDetails");
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [paramsLoaded, quoteIdentifier, userId, companyId, tenantCode, t]);

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
  useEffect(() => {
    if (quoteIdentifier && quoteDetails && !loading) {
      prefetch(`/details/quoteDetails/${quoteIdentifier}/edit`);
    }
  }, [quoteIdentifier, quoteDetails, loading, prefetch]);

  useEffect(() => {
    prefetch("/landing/orderslanding");
    prefetch("/landing/quoteslanding");
    prefetch("/settings/profile");
    prefetch("/settings/company");
  }, [prefetch]);

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
      prefetchAndNavigate(`/details/quoteDetails/${quoteIdentifier}/edit`);
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
    prefetchAndNavigate("/landing/quoteslanding");
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
      prefetchAndNavigate(
        `/details/quoteDetails/${quoteIdentifier}/edit?placeOrder=true`
      );
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
      onMouseEnter: () =>
        prefetch(`/details/quoteDetails/${quoteIdentifier}/edit`),
    },
    {
      label: t("placeOrderButton"),
      variant: "default" as const,
      onClick: handleConvertToOrder,
    },
  ];

  return (
    <ApplicationLayout>
      {/* Sales Header - Fixed at top */}
      <div className="flex-shrink-0 sticky top-0 z-50 bg-gray-50">
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
      </div>

      {/* Quote Details Content - Scrollable area */}
      <div className="flex-1 w-full">
        <PageLayout variant="content">
          {loading ? (
            <DetailsSkeleton
              showStatusTracker={false}
              leftWidth="lg:w-[60%]"
              rightWidth="lg:w-[40%]"
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Left Side - Products Table, Contact & Terms - 65% */}
              <div className="w-full lg:w-[65%] space-y-2 sm:space-y-3 mt-[80px]">
                {/* Products Table */}
                {!loading && !error && quoteDetails && (
                  <Suspense fallback={null}>
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
                  </Suspense>
                )}

                {/* Contact Details and Terms Cards - Side by Side */}
                {!loading && !error && quoteDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">
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

                {/* Error State */}
                {error && !loading && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      {tDetails("retry")}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side - Price Details - 40% */}
              {!loading && !error && quoteDetails && (
                <div className="w-full lg:w-[40%] space-y-2 sm:space-y-3 mt-[80px]">
                  <Suspense fallback={null}>
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
                              (t: Record<string, unknown>) =>
                                t.taxName === "IGST"
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
                      taxableAmount={Number(
                        quoteDetailData?.taxableAmount || 0
                      )}
                    />
                  </Suspense>

                  {/* Customer Information Card */}
                  <div className="mt-4">
                    <Suspense fallback={null}>
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
                    </Suspense>
                  </div>
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

      {/* Edit Quote Name Dialog */}
      <EditOrderNameDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentOrderName={quoteName || ""}
        onSave={handleSaveQuoteName}
        loading={loading}
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
    </ApplicationLayout>
  );
}
