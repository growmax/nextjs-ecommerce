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
import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import {
  CustomerInfoCard,
  OrderContactDetails,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import { useQuoteDetails } from "@/hooks/details/quotedetails/useQuoteDetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useTenantData } from "@/hooks/useTenantData";
import type { QuotationDetailsResponse } from "@/lib/api";
import { QuotationDetailsService } from "@/lib/api";
import QuotationNameService from "@/lib/api/services/QuotationNameService";
import type { ProductCsvRow } from "@/lib/export-csv";
import { exportProductsToCsv } from "@/lib/export-csv";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";
import { getStatusStyle } from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/general";

// Dynamic imports for heavy components
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

interface QuoteDetailsClientProps {
  params: Promise<{ quoteId: string }>;
}

export default function QuoteDetailsClient({
  params,
}: QuoteDetailsClientProps) {
  const router = useRouter();
  const locale = useLocale();

  const [quoteIdentifier, setQuoteIdentifier] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

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

  // Prevent duplicate fetches for the same identifiers
  const lastFetchKeyRef = useRef<string | null>(null);

  // Track processed versions to prevent duplicate processing
  const processedVersionRef = useRef<string | null>(null);

  // Derive only primitive dependencies
  const userId = user?.userId;
  const companyId = user?.companyId;
  const tenantCode = tenantData?.tenant?.tenantCode;

  // Load params asynchronously
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      // Extract quote identifier from the dynamic segment
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

      // Build a stable key from primitives only
      const fetchKey = [quoteIdentifier, userId, companyId, tenantCode].join(
        "|"
      );

      // Skip if we've already fetched for this exact key
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
          err instanceof Error
            ? err.message
            : "Failed to fetch quotation details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [paramsLoaded, quoteIdentifier, userId, companyId, tenantCode]);

  // Use custom hook for quote details logic
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

  // Update quote details when version data is loaded
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
          quoteVersions.find(
            (v: Version) => v.versionNumber === selectedVersion.versionNumber
          )?.versionName || `Version ${selectedVersion.versionNumber}`;
        toast.success(`Loaded ${versionName} details`);
      }
    }
  }, [versionData, versionLoading, selectedVersion, quoteVersions]);

  // Extract data for header - use version data if available, otherwise use quote details
  const displayQuoteDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return quoteDetails?.data;
  }, [versionData, selectedVersion, quoteDetails?.data]);

  // Extract data for header - quoteName is inside quotationDetails[0]
  const quoteName =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (displayQuoteDetails?.quotationDetails as any)?.[0]?.quoteName ||
    quoteDetails?.data?.quotationDetails?.[0]?.quoteName ||
    quoteDetails?.data?.quoteName ||
    "";
  const status =
    displayQuoteDetails?.updatedBuyerStatus ||
    quoteDetails?.data?.updatedBuyerStatus;

  // Get the actual quotationIdentifier from API response or fall back to URL param
  const displayQuoteId =
    displayQuoteDetails?.quotationIdentifier ||
    quoteDetails?.data?.quotationIdentifier ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (displayQuoteDetails?.quotationDetails as any)?.[0]?.quotationIdentifier ||
    quoteDetails?.data?.quotationDetails?.[0]?.quotationIdentifier ||
    quoteIdentifier ||
    "...";

  // Get module settings
  const { quoteSettings: _quoteSettings } = useModuleSettings(user);

  // Handler functions
  const handleEditQuote = () => {
    // Get current status and other relevant data
    const updatedBuyerStatus =
      displayQuoteDetails?.updatedBuyerStatus ||
      quoteDetails?.data?.updatedBuyerStatus;
    const reorder = displayQuoteDetails?.reorder || quoteDetails?.data?.reorder;
    const validityTill = (displayQuoteDetails?.validityTill ||
      quoteDetails?.data?.validityTill) as string | undefined;

    // Check if cancelled
    if (updatedBuyerStatus === "CANCELLED") {
      toast.info("Quote was cancelled already", {
        position: "bottom-left",
      });
      return;
    }

    // Check if allowed status (can edit)
    if (
      updatedBuyerStatus === "QUOTE RECEIVED" ||
      updatedBuyerStatus === "OPEN"
    ) {
      // Navigate to edit page
      router.push(`/${locale}/details/quoteDetails/${quoteIdentifier}/edit`);
      return;
    }

    // Check reorder validity
    if (reorder && validityTill) {
      const validityDate = new Date(validityTill);
      const endOfValidityDay = new Date(validityDate);
      endOfValidityDay.setHours(23, 59, 59, 999);

      if (new Date() > endOfValidityDay) {
        toast.info("Contract validity expired", {
          position: "bottom-left",
        });
        return;
      }
    }

    // Check if order placed
    if (updatedBuyerStatus === "ORDER PLACED") {
      toast.info("Quote was converted to order already", {
        position: "bottom-left",
      });
      return;
    }

    // Default message for other statuses
    toast.info("Quote owner is working on this quote", {
      position: "bottom-left",
    });
  };

  const handleEditQuoteName = () => {
    setEditDialogOpen(true);
  };

  const handleSaveQuoteName = async (newQuoteName: string) => {
    if (!user || !displayQuoteId) {
      throw new Error("Missing required data for updating quote name");
    }

    try {
      // Call the API to update the quote name
      await QuotationNameService.updateQuotationName({
        userId: user.userId,
        companyId: user.companyId,
        quotationIdentifier: displayQuoteId,
        quotationName: newQuoteName,
      });

      // Update the local state to reflect the change
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
    } catch (error) {
      throw error; // Re-throw to let the dialog handle the error
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
      toast.success("Quote details refreshed successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh quote details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push(`/${locale}/landing/quoteslanding`);
  };

  const handleClone = () => {
    toast.info("Clone functionality will be implemented soon");
  };

  const handleDownloadPDF = () => {
    toast.info("PDF download functionality will be implemented soon");
  };

  const handleConvertToOrder = () => {
    toast.info("Convert to order functionality will be implemented soon");
  };

  // Handle version selection
  const handleVersionSelect = (version: Version) => {
    // Close dialog immediately
    setVersionsDialogOpen(false);

    // If version 1 is selected, reset to original quote details
    if (version.versionNumber === 1) {
      // Reset to original quote details
      if (quoteDetails) {
        // Reset processed version ref
        processedVersionRef.current = null;
        // Re-fetch original quote details
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

  // Extract products for display
  const products = useMemo(() => {
    const rawProducts =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (displayQuoteDetails?.quotationDetails as any)?.[0]?.dbProductDetails ||
      quoteDetails?.data?.quotationDetails?.[0]?.dbProductDetails ||
      [];
    // Transform to match ProductItem interface while preserving all fields including productTaxes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawProducts.map((product: any) => {
      // Prioritize askedQuantity for quantity display
      const quantity =
        product.askedQuantity || product.quantity || product.unitQuantity || 0;

      const transformed: Record<string, unknown> = {
        ...product,
        itemNo:
          typeof product.itemNo === "string"
            ? parseInt(product.itemNo, 10)
            : (product.itemNo as number),
        // Set all quantity fields to use askedQuantity as the source
        quantity,
        unitQuantity: quantity,
      };

      // Preserve productTaxes if it exists
      if (product.productTaxes) {
        transformed.productTaxes = product.productTaxes;
      }

      return transformed;
    });
  }, [displayQuoteDetails?.quotationDetails, quoteDetails?.data]);

  // Extract quote details from the nested structure
  const quoteDetailData =
    (
      displayQuoteDetails?.quotationDetails as Array<Record<string, unknown>>
    )?.[0] || quoteDetails?.data?.quotationDetails?.[0];
  const buyerCurrencySymbol =
    displayQuoteDetails?.buyerCurrencySymbol ||
    quoteDetails?.data?.buyerCurrencySymbol;

  // Header buttons - Using primary color for main actions
  const headerButtons = [
    {
      label: "EDIT QUOTE",
      variant: "outline" as const,
      onClick: handleEditQuote,
    },
    {
      label: "PLACE ORDER",
      variant: "default" as const,
      onClick: handleConvertToOrder,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sales Header */}
      <SalesHeader
        title={quoteName ? decodeUnicode(quoteName) : "Quote Details"}
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

      {/* Quote Details Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative pt-28">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* Left Side - Products Table, Contact & Terms - 65% */}
          <div className="w-full lg:w-[65%] space-y-3 sm:space-y-4 md:space-y-6">
            {/* Products Table */}
            {!loading && !error && quoteDetails && (
              <div className="mt-17">
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
              </div>
            )}

            {/* Contact Details and Terms Cards - Side by Side */}
            {!loading && !error && quoteDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                    (quoteDetailData?.sellerBranchName as string) || undefined
                  }
                  requiredDate={
                    (quoteDetailData?.customerRequiredDate ||
                      quoteDetails?.data?.validityTill) as string | undefined
                  }
                  referenceNumber={
                    (quoteDetails?.data?.buyerReferenceNumber as string) || "-"
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

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
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
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Price Details - 40% */}
          {!loading && !error && quoteDetails && (
            <div className="w-full lg:w-[40%] mt-17 lg:mr-6 space-y-3 sm:space-y-4 md:space-y-6">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
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
                  isSeller={(user as { isSeller?: boolean })?.isSeller || false}
                  taxExemption={
                    (user as { taxExemption?: boolean })?.taxExemption || false
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
              </Suspense>

              {/* Customer Information Card */}
              <div className="mt-4">
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
                        quoteDetails?.data?.purchaseOrder) as boolean) || false
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

          {/* Loading State for Right Side */}
          {loading && (
            <div className="w-full lg:w-[40%] mt-17 lg:mr-6 space-y-3 sm:space-y-4 md:space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
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
    </div>
  );
}
