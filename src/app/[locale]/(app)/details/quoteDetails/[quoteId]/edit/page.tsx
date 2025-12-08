"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import {
  DetailsSkeleton,
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderTermsCard,
  SalesHeader,
  SPRForm,
} from "@/components/sales";
import CashDiscountCard from "@/components/sales/CashDiscountCard";
import type { ProductSearchResult } from "@/components/sales/ProductSearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuoteDetails } from "@/hooks/details/quotedetails/useQuoteDetails";
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";
import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";
import { useLatestOrderProducts } from "@/hooks/useLatestOrderProducts/useLatestOrderProducts";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useOrderCalculation } from "@/hooks/useOrderCalculation/useOrderCalculation";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useQuoteSubmission } from "@/hooks/useQuoteSubmission/useQuoteSubmission";
import { useLoading } from "@/hooks/useGlobalLoader";
import { usePageLoader } from "@/hooks/usePageLoader";

import { useTenantData } from "@/hooks/useTenantData";
import type { QuotationDetailsResponse } from "@/lib/api";
import {
  OrdersService,
  QuotationDetailsService,
  quoteSubmitDTO,
} from "@/lib/api";
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";
import {
  type SellerBranch,
  type Warehouse,
} from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";
import type { CartItem } from "@/types/calculation/cart";
import type {
  SelectedVersion,
  Version,
} from "@/types/details/orderdetails/version.types";
import { getStatusStyle } from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/General/general";
import { prepareQuoteSubmissionDTO } from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";
import { isEmpty } from "lodash";
import some from "lodash/some";
import { useSearchParams } from "next/navigation";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import getProductIds from "@/utils/getProductIds";

// Import types for proper typing
interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCodeId?: string;
  pincode?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  email?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  sellerCompanyName?: string;
  sellerBranchName?: string;
}

interface QuoteTerms {
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

interface EditQuotePageProps {
  params: Promise<{
    quoteId: string;
    locale: string;
  }>;
}

export default function EditQuotePage({ params }: EditQuotePageProps) {
  usePageScroll();
  const t = useTranslations("quotes");
  const tDetails = useTranslations("details");
  const tEcommerce = useTranslations("ecommerce");
  const { showLoading, hideLoading } = useLoading();

  // Hide navigation loader when page mounts
  usePageLoader();

  const searchParams = useSearchParams();
  const isPlaceOrderMode = searchParams.get("placeOrder") === "true";
  const { push } = useNavigationWithLoader();

  const [quoteIdentifier, setQuoteIdentifier] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const [quoteDetails, setQuoteDetails] =
    useState<QuotationDetailsResponse | null>(null);
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
  const [cashDiscountApplied, setCashDiscountApplied] = useState(false);
  const [cashDiscountTerms, setCashDiscountTerms] = useState<any>(null);
  const [prevPaymentTerms, setPrevPaymentTerms] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVersion, _setSelectedVersion] =
    useState<SelectedVersion | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);

  // SPR Form states
  const [sprCustomerName, setSprCustomerName] = useState<string>("");
  const [sprProjectName, setSprProjectName] = useState<string>("");
  const [sprCompetitors, setSprCompetitors] = useState<string[]>([]);
  const [sprPriceJustification, setSprPriceJustification] =
    useState<string>("");

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { quoteSettings } = useModuleSettings(user);
  const { submitQuote, isSubmitting } = useQuoteSubmission();

  // Get latest payment terms with cash discount
  const { latestPaymentTerms } = useGetLatestPaymentTerms(true);

  // Load params asynchronously
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      const identifier = resolvedParams.quoteId || "";
      setQuoteIdentifier(identifier);
      setParamsLoaded(true);
    };
    loadParams();
  }, [params]);

  // Fetch quote details
  useEffect(() => {
    const fetchQuoteDetails = async () => {
      if (
        !paramsLoaded ||
        !quoteIdentifier ||
        !user?.userId ||
        !user?.companyId
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await QuotationDetailsService.fetchQuotationDetails({
          userId: user.userId,
          companyId: user.companyId,
          quotationIdentifier: quoteIdentifier,
        });

        setQuoteDetails(response);

        // Initialize editable fields
        const currentRequiredDate =
          response?.data?.quotationDetails?.[0]?.customerRequiredDate || "";
        const currentReferenceNumber =
          response?.data?.quotationDetails?.[0]?.buyerReferenceNumber || "";

        setEditedRequiredDate(currentRequiredDate as string);
        setEditedReferenceNumber(currentReferenceNumber as string);

        // Initialize SPR form fields from sprDetails if available
        const sprDetails = response?.data?.quotationDetails?.[0]?.sprDetails;
        if (sprDetails && typeof sprDetails === "object") {
          setSprCustomerName((sprDetails as any).companyName || "");
          setSprProjectName((sprDetails as any).projectName || "");
          setSprCompetitors((sprDetails as any).competitorNames || []);
          setSprPriceJustification(
            (sprDetails as any).priceJustification || ""
          );
        }
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
  }, [
    paramsLoaded,
    quoteIdentifier,
    user?.userId,
    user?.companyId,
    showLoading,
    hideLoading,
  ]);

  // Sync loading state with global loader
  useEffect(() => {
    if (loading) {
      showLoading("Loading quote details...", "quote-details-edit");
    } else {
      hideLoading("quote-details-edit");
    }
  }, [loading, showLoading, hideLoading]);

  // Cleanup: Hide global loader on unmount
  useEffect(() => {
    return () => {
      hideLoading("quote-details-edit");
    };
  }, [hideLoading]);

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

  // Track processed versions to prevent duplicate processing
  const processedVersionRef = useRef<string | null>(null);

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

      // Update quote details with version data
      if (versionData.data) {
        setQuoteDetails({
          data: versionData.data,
        } as unknown as QuotationDetailsResponse);

        // Show success toast only if data is freshly loaded (not from cache)
        if (!versionLoading) {
          const versionName =
            quoteVersions.find(
              (v: Version) => v.versionNumber === selectedVersion.versionNumber
            )?.versionName ||
            `${tDetails("version")} ${selectedVersion.versionNumber}`;
          toast.success(t("loadedQuoteVersionDetails", { versionName }));
        }
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

  // Extract data for display - use version data if available, otherwise use quote details
  const displayQuoteDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return quoteDetails?.data;
  }, [versionData, selectedVersion, quoteDetails?.data]);

  // Extract products and currency info for latest data hook
  const quoteDetailsData =
    (displayQuoteDetails?.quotationDetails as
      | Array<Record<string, unknown>>
      | undefined) ||
    (quoteDetails?.data?.quotationDetails as
      | Array<Record<string, unknown>>
      | undefined);
  const firstQuoteDetail = Array.isArray(quoteDetailsData)
    ? (quoteDetailsData[0] as Record<string, unknown> | undefined)
    : undefined;
  const products = useMemo(
    () =>
      (firstQuoteDetail?.dbProductDetails as Array<unknown> | undefined) || [],
    [firstQuoteDetail]
  );

  // Get the buyer company ID for volume discount check
  const buyerCompanyId = useMemo(() => {
    const companyId =
      (firstQuoteDetail?.buyerCompanyId as string | number | undefined) ||
      (
        quoteDetails?.data?.quotationDetails?.[0] as
          | { buyerCompanyId?: string | number }
          | undefined
      )?.buyerCompanyId ||
      user?.companyId;
    if (companyId && typeof companyId === "object") {
      return undefined;
    }
    return companyId as string | number | undefined;
  }, [firstQuoteDetail, quoteDetails?.data?.quotationDetails, user?.companyId]);

  // Check if volume discount is enabled for the company
  const allProductsHavePrices = useMemo(() => {
    if (!products || products.length === 0) return false;
    return !some(products, (product: Record<string, unknown>) => {
      const showPrice = product.showPrice;
      return showPrice === false || showPrice === undefined;
    });
  }, [products]);

  useCheckVolumeDiscountEnabled(
    buyerCompanyId,
    allProductsHavePrices && !loading && !!buyerCompanyId
  );

  const currency = useMemo(
    () =>
      displayQuoteDetails?.buyerCurrencyId ||
      quoteDetails?.data?.buyerCurrencyId,
    [displayQuoteDetails?.buyerCurrencyId, quoteDetails?.data?.buyerCurrencyId]
  );

  const sellerCurrency = useMemo(
    () =>
      displayQuoteDetails?.curencySymbol || quoteDetails?.data?.curencySymbol,
    [displayQuoteDetails?.curencySymbol, quoteDetails?.data?.curencySymbol]
  );

  // Use hook to get latest product pricing, discounts, and tax data
  const { updatedProducts, isLoading: updatingProducts } =
    useLatestOrderProducts({
      products,
      currency,
      sellerCurrency,
      isInter: true,
      taxExemption: false,
      isCloneReOrder: false,
      isPlaceOrder: false,
      enabled: !loading && products.length > 0,
    });

  // Apply edited quantities to products
  const productsWithEditedQuantities = useMemo(() => {
    const baseProductsArray =
      updatedProducts.length > 0
        ? updatedProducts
        : quoteDetails?.data?.quotationDetails?.[0]?.dbProductDetails || [];

    const baseProducts = Array.isArray(baseProductsArray)
      ? baseProductsArray
      : [];

    if (baseProducts.length === 0) {
      return [];
    }

    return baseProducts.map((product: Record<string, unknown>) => {
      const productId =
        (product.productId as string | number) ||
        (product.brandProductId as string) ||
        (product.itemCode as string) ||
        (product.quotationIdentifier as string) ||
        "";

      let quantity =
        (product.askedQuantity as number) ||
        (product.quantity as number) ||
        (product.unitQuantity as number) ||
        1;

      const possibleIds = [
        productId,
        product.brandProductId as string,
        product.itemCode as string,
        product.quotationIdentifier as string,
        product.productId as string | number,
      ].filter(Boolean);

      for (const id of possibleIds) {
        if (id && editedQuantities[id] !== undefined) {
          quantity = editedQuantities[id];
          break;
        }
      }

      const unitPrice =
        (product.unitPrice as number) || (product.unitListPrice as number) || 0;
      const unitListPrice =
        (product.unitListPrice as number) ||
        (product.unitLP as number) ||
        unitPrice;

      const finalProductId =
        (product.productId as string | number) ||
        productId ||
        `product-${Math.random()}`;

      return {
        ...product,
        productId: finalProductId,
        quantity,
        unitQuantity: quantity,
        askedQuantity: quantity,
        unitPrice,
        unitListPrice,
        totalPrice: unitPrice * quantity,
        discount:
          (product.discount as number) ||
          (product.discountPercentage as number) ||
          0,
        discountPercentage:
          (product.discountPercentage as number) ||
          (product.discount as number) ||
          0,
        tax: (product.tax as number) || 0,
        totalTax: (product.totalTax as number) || 0,
        shippingCharges: (product.shippingCharges as number) || 0,
        cashdiscountValue:
          (product.cashdiscountValue as number) ||
          (product.cashDiscountValue as number) ||
          0,
        showPrice:
          typeof product.showPrice === "boolean"
            ? product.showPrice
            : product.showPrice !== undefined
              ? true
              : true,
        priceNotAvailable:
          typeof product.priceNotAvailable === "boolean"
            ? product.priceNotAvailable
            : false,
      } as CartItem;
    });
  }, [updatedProducts, editedQuantities, quoteDetails]);

  // Update cash discount terms when payment terms are fetched
  useEffect(() => {
    if (latestPaymentTerms && !cashDiscountTerms) {
      setCashDiscountTerms(latestPaymentTerms);
    }
  }, [latestPaymentTerms, cashDiscountTerms]);

  // Track cash discount applied state from quote details
  useEffect(() => {
    if (quoteDetails?.data?.quotationDetails?.[0]) {
      const quoteDetail = quoteDetails.data.quotationDetails[0];
      const isApplied = Boolean(quoteDetail.cashdiscount);
      setCashDiscountApplied(isApplied);

      if (!isApplied && quoteDetail.quoteTerms) {
        setPrevPaymentTerms(quoteDetail.quoteTerms);
      }
    }
  }, [quoteDetails]);

  // Create products with cash discount state for handlers
  const [productsWithCashDiscount, setProductsWithCashDiscount] = useState<
    CartItem[]
  >([]);

  // Update products with cash discount when products change
  // Only update if cash discount is not applied, otherwise preserve cash discount values
  const productsWithCashDiscountRef = useRef<CartItem[]>([]);
  useEffect(() => {
    productsWithCashDiscountRef.current = productsWithCashDiscount;
  }, [productsWithCashDiscount]);

  useEffect(() => {
    if (!cashDiscountApplied) {
      // If cash discount is not applied, sync normally
      setProductsWithCashDiscount(productsWithEditedQuantities);
    } else {
      // If cash discount is applied, merge cash discount values into updated products
      const currentProductsWithCD = productsWithCashDiscountRef.current;
      const quoteDetail = quoteDetails?.data?.quotationDetails?.[0];
      const cashDiscountValue = (quoteDetail?.cashdiscountValue as number) || 0;

      const mergedProducts = productsWithEditedQuantities.map(
        (product: any) => {
          // Find matching product in current productsWithCashDiscount to preserve cash discount
          const existingProduct = currentProductsWithCD.find(
            (cdProduct: any) =>
              cdProduct.productId === product.productId ||
              cdProduct.brandProductId === product.brandProductId ||
              cdProduct.itemCode === product.itemCode
          );

          if (existingProduct && existingProduct.cashdiscountValue) {
            return {
              ...product,
              cashdiscountValue: existingProduct.cashdiscountValue,
              originalUnitPrice:
                existingProduct.originalUnitPrice || product.originalUnitPrice,
            };
          }

          // If no existing product found but cash discount is applied, apply it
          if (cashDiscountValue > 0) {
            return {
              ...product,
              cashdiscountValue: cashDiscountValue,
              originalUnitPrice: product.originalUnitPrice || product.unitPrice,
            };
          }

          return product;
        }
      );

      setProductsWithCashDiscount(mergedProducts);
    }
  }, [productsWithEditedQuantities, cashDiscountApplied, quoteDetails]);

  // Cash discount handlers
  const { handleCDApply, handleRemoveCD } = useCashDiscountHandlers({
    products: productsWithCashDiscount,
    setProducts: updatedProducts => {
      setProductsWithCashDiscount(updatedProducts);
      // Update quote details with new products
      setQuoteDetails(prev => {
        if (!prev || !prev.data?.quotationDetails) return prev;
        // Convert CartItem[] to DbProductDetail[] format
        const dbProductDetails = updatedProducts.map(product => {
          const dbProduct: Record<string, unknown> = { ...product };
          // Ensure itemNo is a number if it exists
          if (dbProduct.itemNo !== undefined && dbProduct.itemNo !== null) {
            dbProduct.itemNo =
              typeof dbProduct.itemNo === "string"
                ? parseInt(dbProduct.itemNo, 10) || dbProduct.itemNo
                : dbProduct.itemNo;
          }
          return dbProduct;
        });
        return {
          ...prev,
          data: {
            ...prev.data,
            quotationDetails: prev.data.quotationDetails.map((quote, idx) => {
              if (idx === 0) {
                const updatedQuote = {
                  ...quote,
                  dbProductDetails:
                    dbProductDetails as unknown as typeof quote.dbProductDetails,
                  cashdiscount: true,
                  cashdiscountValue: updatedProducts[0]?.cashdiscountValue ?? 0,
                };
                return updatedQuote as typeof quote;
              }
              return quote;
            }),
          },
        };
      });
      setCashDiscountApplied(true);
    },
    isOrder: false,
  });

  // Wrapper for remove handler
  const handleRemoveCashDiscount = useCallback(
    (prevTerms?: QuoteTerms | Record<string, unknown>) => {
      handleRemoveCD(prevTerms);
      setCashDiscountApplied(false);
      // Restore previous payment terms
      if (prevTerms) {
        setQuoteDetails(prev => {
          if (!prev || !prev.data?.quotationDetails) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
                idx === 0
                  ? ({
                      ...quote,
                      cashdiscount: false,
                      cashdiscountValue: 0,
                      quoteTerms:
                        prevTerms as unknown as typeof quote.quoteTerms,
                    } as typeof quote)
                  : quote
              ),
            },
          };
        });
      }
    },
    [handleRemoveCD]
  );

  // Calculate quote using the calculation hook
  const { calculatedData } = useOrderCalculation({
    products:
      productsWithCashDiscount.length > 0
        ? productsWithCashDiscount
        : productsWithEditedQuantities.length > 0
          ? (productsWithEditedQuantities as CartItem[])
          : (updatedProducts as CartItem[]) || [],
    isInter: (() => {
      // Determine if inter-state based on product taxes (IGST = inter-state, SGST/CGST = intra-state)
      const products =
        productsWithCashDiscount.length > 0
          ? productsWithCashDiscount
          : productsWithEditedQuantities;
      const firstProduct = products[0];
      if (
        firstProduct &&
        firstProduct.productTaxes &&
        Array.isArray(firstProduct.productTaxes)
      ) {
        const hasIGST = firstProduct.productTaxes.some(
          (t: Record<string, unknown>) => t.taxName === "IGST"
        );
        return hasIGST;
      }
      return true; // default to inter-state
    })(),
    taxExemption: false,
    precision: 2,
    settings: {
      roundingAdjustment: quoteSettings?.roundingAdjustment || false,
      itemWiseShippingTax: false,
    },
    options: {
      applyVolumeDiscount: true,
      applyCashDiscount: true,
      applyBasicDiscount: true,
      checkMOQ: true,
      applyRounding: true,
    },
  });

  const effectiveProducts = useMemo(() => {
    if (calculatedData?.products && calculatedData.products.length > 0) {
      return calculatedData.products as CartItem[];
    }
    if (productsWithCashDiscount.length > 0) {
      return productsWithCashDiscount as CartItem[];
    }
    if (productsWithEditedQuantities.length > 0) {
      return productsWithEditedQuantities as CartItem[];
    }
    return (updatedProducts as CartItem[]) || [];
  }, [
    calculatedData?.products,
    productsWithCashDiscount,
    productsWithEditedQuantities,
    updatedProducts,
  ]);

  // Track previous updatedProducts to prevent infinite loops
  const prevUpdatedProductsRef = useRef<unknown[]>([]);

  // Update quote details when products are updated
  useEffect(() => {
    if (
      updatedProducts &&
      Array.isArray(updatedProducts) &&
      updatedProducts.length > 0 &&
      !updatingProducts &&
      quoteDetails
    ) {
      const prevProducts = prevUpdatedProductsRef.current;
      const currentProducts = updatedProducts;

      const hasChanged =
        prevProducts.length !== currentProducts.length ||
        prevProducts.some(
          (prev, idx) =>
            (prev as Record<string, unknown>)?.productId !==
            (currentProducts[idx] as Record<string, unknown>)?.productId
        );

      if (hasChanged) {
        prevUpdatedProductsRef.current = currentProducts;
        setQuoteDetails(prev => {
          if (!prev || !prev.data?.quotationDetails) return prev;
          const currentProductsArray =
            prev.data.quotationDetails[0]?.dbProductDetails || [];

          if (
            currentProductsArray.length === updatedProducts.length &&
            currentProductsArray.every(
              (item, idx) =>
                (item as Record<string, unknown>)?.productId ===
                (updatedProducts[idx] as Record<string, unknown>)?.productId
            )
          ) {
            return prev; // No change, return previous state
          }

          // Preserve cash discount state if it was applied
          const currentQuote = prev.data.quotationDetails[0];
          const isCashDiscountApplied = Boolean(
            currentQuote?.cashdiscount || cashDiscountApplied
          );
          const cashDiscountValue =
            ((currentQuote?.cashdiscountValue as number) ||
              (productsWithCashDiscount[0]?.cashdiscountValue as number) ||
              0) as number;

          // Merge cash discount values from productsWithCashDiscount if cash discount is applied
          let mergedProducts = updatedProducts;
          if (isCashDiscountApplied && productsWithCashDiscount.length > 0) {
            mergedProducts = updatedProducts.map((updatedProduct: any) => {
              // Find matching product in productsWithCashDiscount
              const cashDiscountProduct = productsWithCashDiscount.find(
                (cdProduct: any) =>
                  cdProduct.productId === updatedProduct.productId ||
                  cdProduct.brandProductId === updatedProduct.brandProductId ||
                  cdProduct.itemCode === updatedProduct.itemCode
              );

              if (cashDiscountProduct) {
                return {
                  ...updatedProduct,
                  cashdiscountValue:
                    cashDiscountProduct.cashdiscountValue || cashDiscountValue,
                  originalUnitPrice:
                    cashDiscountProduct.originalUnitPrice ||
                    updatedProduct.originalUnitPrice,
                };
              }

              // If no match found, still apply cash discount value if it exists
              return {
                ...updatedProduct,
                cashdiscountValue:
                  cashDiscountValue > 0
                    ? cashDiscountValue
                    : updatedProduct.cashdiscountValue || 0,
              };
            });
          }

          return {
            ...prev,
            data: {
              ...prev.data,
              quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
                idx === 0
                  ? {
                      ...quote,
                      dbProductDetails: mergedProducts,
                      // Preserve cash discount state
                      ...(isCashDiscountApplied && {
                        cashdiscount: true,
                        cashdiscountValue: cashDiscountValue,
                      }),
                    }
                  : quote
              ),
            },
          };
        });
      }
    }
  }, [
    updatedProducts,
    updatingProducts,
    quoteDetails,
    cashDiscountApplied,
    productsWithCashDiscount,
  ]);

  // Handler functions
  const handleRefresh = async () => {
    if (!user || !quoteIdentifier) return;

    try {
      setLoading(true);
      const response = await QuotationDetailsService.fetchQuotationDetails({
        userId: user.userId,
        companyId: user.companyId,
        quotationIdentifier: quoteIdentifier,
      });
      setQuoteDetails(response);
      toast.success(t("quoteDetailsRefreshed"));
    } catch {
      toast.error(t("failedToRefreshQuoteDetails"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    push(`/details/quoteDetails/${quoteIdentifier}`);
  };

  const handleEditQuoteName = () => {
    setEditDialogOpen(true);
  };

  const handleSaveQuoteName = async (newQuoteName: string) => {
    if (!user || !quoteIdentifier) {
      throw new Error(
        t("missingRequiredDataForUpdatingQuoteName") ||
          "Missing required data for updating quote name"
      );
    }

    try {
      await QuotationNameService.updateQuotationName({
        userId: user.userId,
        companyId: user.companyId,
        quotationIdentifier: quoteIdentifier,
        quotationName: newQuoteName,
      });

      // Update local state if quoteDetails exists
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
      } else if (quoteDetails?.data) {
        // Handle case where quoteName is at the root level
        const updatedQuoteDetails = {
          ...quoteDetails,
          data: {
            ...quoteDetails.data,
            quoteName: newQuoteName,
          },
        };
        setQuoteDetails(updatedQuoteDetails);
      }
    } catch (err) {
      throw err;
    }
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
    // Update quote details state immediately
    setQuoteDetails(prev => {
      if (!prev || !prev.data?.quotationDetails) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
            idx === 0
              ? {
                  ...quote,
                  billingAddressDetails: address
                    ? (address as unknown as NonNullable<
                        typeof quote.billingAddressDetails
                      >)
                    : undefined,
                }
              : quote
          ),
        },
      } as QuotationDetailsResponse;
    });
  };

  const handleShippingAddressChange = (address: AddressDetails) => {
    setEditedShippingAddress(address);
    // Update quote details state immediately
    setQuoteDetails(prev => {
      if (!prev || !prev.data?.quotationDetails) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
            idx === 0
              ? {
                  ...quote,
                  shippingAddressDetails: address
                    ? (address as unknown as NonNullable<
                        typeof quote.shippingAddressDetails
                      >)
                    : undefined,
                }
              : quote
          ),
        },
      } as QuotationDetailsResponse;
    });
  };

  const handleSellerBranchChange = (sellerBranch: SellerBranch | null) => {
    setEditedSellerBranch(sellerBranch);
    // Update quote details state immediately
    if (sellerBranch) {
      setQuoteDetails(prev => {
        if (!prev || !prev.data?.quotationDetails) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
              idx === 0
                ? {
                    ...quote,
                    sellerBranchId: sellerBranch.id,
                    sellerBranchName: sellerBranch.name,
                    sellerCompanyId: sellerBranch.companyId,
                  }
                : quote
            ),
          },
        };
      });
    }
  };

  const handleWarehouseChange = (warehouse: Warehouse | null) => {
    setEditedWarehouse(warehouse);
    // Update quote details state immediately - update warehouse in all products
    if (warehouse) {
      setQuoteDetails(prev => {
        if (!prev || !prev.data?.quotationDetails) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            quotationDetails: prev.data.quotationDetails.map((quote, idx) => {
              if (idx === 0 && quote.dbProductDetails) {
                // Update warehouse in all product details
                const updatedProducts = quote.dbProductDetails.map(product => ({
                  ...product,
                  wareHouse: {
                    id: warehouse.id,
                    wareHouseName: warehouse.name,
                    wareHousecode: warehouse.wareHousecode,
                  } as unknown as typeof product.wareHouse,
                  orderWareHouseName: warehouse.name,
                }));
                return {
                  ...quote,
                  dbProductDetails: updatedProducts,
                };
              }
              return quote;
            }),
          },
        };
      });
    }
  };

  // Get elastic index from tenant data
  const elasticIndex = useMemo(() => {
    if (tenantData?.tenant?.elasticCode) {
      return `${tenantData.tenant.elasticCode}pgandproducts`;
    }
    return undefined;
  }, [tenantData?.tenant?.elasticCode]);

  // Handle adding a product to the quote
  const handleProductAdd = (product: ProductSearchResult) => {
    if (!quoteDetails || !quoteDetails.data?.quotationDetails?.[0]) {
      toast.error(t("quoteDetailsNotLoaded"));
      return;
    }

    try {
      const newProduct = {
        productId: product.productId?.toString(),
        brandProductId: product.brandProductId || product.id,
        productShortDescription:
          product.productShortDescription ||
          product.productName ||
          product.brandProductId ||
          "Unknown Product",
        itemName:
          product.productShortDescription ||
          product.productName ||
          product.brandProductId ||
          "Unknown Product",
        itemCode: product.brandProductId || product.id,
        unitQuantity: 1,
        quantity: 1,
        unitPrice: 0,
        unitListPrice: 0,
        discount: 0,
        discountPercentage: 0,
        itemTaxableAmount: 0,
        totalPrice: 0,
        tax: 0,
        itemNo:
          (quoteDetails.data.quotationDetails[0].dbProductDetails?.length ||
            0) + 1,
      };

      setQuoteDetails(prev => {
        if (!prev || !prev.data?.quotationDetails) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
              idx === 0
                ? ({
                    ...quote,
                    dbProductDetails: [
                      ...(quote.dbProductDetails || []),
                      newProduct,
                    ],
                  } as typeof quote)
                : quote
            ),
          },
        };
      });

      toast.success(t("productAddedSuccessfullyToQuote"));
    } catch {
      toast.error(t("failedToAddProductToQuote"));
    }
  };

  const handleSaveQuote = () => {
    if (!quoteDetails?.data?.quotationDetails?.[0] || !user) {
      toast.error("Quote details or user information is missing");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handlePlaceOrder = () => {
    if (!quoteDetails?.data?.quotationDetails?.[0] || !user) {
      toast.error("Quote details or user information is missing");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmPlaceOrder = async () => {
    if (!quoteDetails?.data?.quotationDetails?.[0] || !user) {
      toast.error("Quote details or user information is missing");
      return;
    }

    setConfirmDialogOpen(false);
    setSaving(true);

    try {
      const firstQuoteDetail = quoteDetails.data.quotationDetails[0];

      // Prepare the order data using the quoteSubmitDTO utility
      const orderPayload = quoteSubmitDTO(
        {
          dbProductDetails: effectiveProducts as CartItem[],
          removedDbProductDetails: [],
          VDapplied: calculatedData?.metadata.hasVolumeDiscount || false,
          VDDetails: calculatedData?.breakup || {},
          cartValue: calculatedData?.cartValue || firstQuoteDetail.cartValue,
          buyerCurrencyId: quoteDetails.data.buyerCurrencyId as { id: number },
          registerAddressDetails: firstQuoteDetail.registerAddressDetails,
          billingAddressDetails:
            editedBillingAddress || firstQuoteDetail.billingAddressDetails,
          shippingAddressDetails:
            editedShippingAddress || firstQuoteDetail.shippingAddressDetails,
          sellerAddressDetail: firstQuoteDetail.sellerAddressDetail,
          buyerBranchId: firstQuoteDetail.buyerBranchId as number,
          buyerBranchName: firstQuoteDetail.buyerBranchName as string,
          buyerCompanyId: firstQuoteDetail.buyerCompanyId as number,
          buyerCompanyName: firstQuoteDetail.buyerCompanyName as string,
          sellerBranchId: firstQuoteDetail.sellerBranchId as number,
          sellerBranchName: firstQuoteDetail.sellerBranchName as string,
          sellerCompanyId: firstQuoteDetail.sellerCompanyId as number,
          sellerCompanyName: firstQuoteDetail.sellerCompanyName as string,
          customerRequiredDate:
            editedRequiredDate ||
            (firstQuoteDetail.customerRequiredDate as string),
          branchBusinessUnit: firstQuoteDetail.branchBusinessUnit as {
            id: number;
          },
          quoteTerms: firstQuoteDetail.quoteTerms,
          pfRate: firstQuoteDetail.pfRate as number,
          isInter: firstQuoteDetail.isInter as boolean,
          quoteName: firstQuoteDetail.quoteName as string,
          approvalGroupId: firstQuoteDetail.approvalGroupId,
        },
        {
          buyerReferenceNumber:
            editedReferenceNumber ||
            (firstQuoteDetail.buyerReferenceNumber as string),
          comment: "",
          uploadedDocumentDetails:
            firstQuoteDetail.uploadedDocumentDetails as unknown[],
          quoteUsers: firstQuoteDetail.quoteUsers as Array<{
            id?: number;
            userId?: number;
          }>,
          quoteDivisionId: firstQuoteDetail.quoteDivisionId,
          orderType: firstQuoteDetail.orderType,
          tagsList: firstQuoteDetail.tagsList as Array<{ id: number }>,
          approvalInitiated: firstQuoteDetail.approvalInitiated,
          validityFrom: quoteDetails.data.validityFrom,
          validityTill: quoteDetails.data.validityTill,
          quotationDetails: [firstQuoteDetail],
        },
        user.displayName || "",
        firstQuoteDetail.buyerCompanyName ||
          firstQuoteDetail.sellerCompanyName ||
          "",
        true // isPlaceOrder flag
      );

      // Place the order using the OrdersService
      const response = await OrdersService.placeOrderFromQuote(
        {
          userId: user.userId,
          companyId: user.companyId,
        },
        orderPayload
      );

      if (response?.orderIdentifier) {
        toast.success(t("orderPlacedSuccessfullyFromQuote"));
        // Navigate to the order details page
        push(`/details/orderDetails/${response.orderIdentifier}`);
      } else {
        toast.error(t("failedToPlaceOrderFromQuote"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmSaveQuote = async () => {
    if (!quoteDetails?.data?.quotationDetails?.[0] || !user) {
      toast.error("Quote details or user information is missing");
      return;
    }

    setConfirmDialogOpen(false);
    setSaving(true);

    try {
      const firstQuoteDetail = quoteDetails.data.quotationDetails[0];

      // Prepare the quote submission payload using the utility function
      const submissionPayload = prepareQuoteSubmissionDTO(
        {
          dbProductDetails: effectiveProducts as CartItem[],
          removedDbProductDetails: [],
          VDapplied: calculatedData?.metadata.hasVolumeDiscount || false,
          VDDetails: calculatedData?.breakup || {},
          cartValue: calculatedData?.cartValue || firstQuoteDetail.cartValue,
          buyerCurrencyId: quoteDetails.data.buyerCurrencyId as { id: number },
          registerAddressDetails: firstQuoteDetail.registerAddressDetails,
          billingAddressDetails:
            editedBillingAddress || firstQuoteDetail.billingAddressDetails,
          shippingAddressDetails:
            editedShippingAddress || firstQuoteDetail.shippingAddressDetails,
          sellerAddressDetail: firstQuoteDetail.sellerAddressDetail,
          buyerBranchId: firstQuoteDetail.buyerBranchId as number,
          buyerBranchName: firstQuoteDetail.buyerBranchName as string,
          buyerCompanyId: firstQuoteDetail.buyerCompanyId as number,
          buyerCompanyName: firstQuoteDetail.buyerCompanyName as string,
          sellerBranchId: firstQuoteDetail.sellerBranchId as number,
          sellerBranchName: firstQuoteDetail.sellerBranchName as string,
          sellerCompanyId: firstQuoteDetail.sellerCompanyId as number,
          sellerCompanyName: firstQuoteDetail.sellerCompanyName as string,
          customerRequiredDate:
            editedRequiredDate ||
            (firstQuoteDetail.customerRequiredDate as string),
          branchBusinessUnit: firstQuoteDetail.branchBusinessUnit as {
            id: number;
          },
          quoteTerms: firstQuoteDetail.quoteTerms,
          pfRate: firstQuoteDetail.pfRate as number,
          isInter: firstQuoteDetail.isInter as boolean,
          quoteName: firstQuoteDetail.quoteName as string,
        },
        {
          buyerReferenceNumber:
            editedReferenceNumber ||
            (firstQuoteDetail.buyerReferenceNumber as string),
          comment: "",
          uploadedDocumentDetails:
            firstQuoteDetail.uploadedDocumentDetails as unknown[],
          quoteUsers: firstQuoteDetail.quoteUsers as Array<{
            id?: number;
            userId?: number;
          }>,
          quoteDivisionId: firstQuoteDetail.quoteDivisionId,
          orderType: firstQuoteDetail.orderType,
          tagsList: firstQuoteDetail.tagsList as Array<{ id: number }>,
        },
        user.displayName || "",
        firstQuoteDetail.buyerCompanyName ||
          firstQuoteDetail.sellerCompanyName ||
          ""
      );

      // Submit using the new service
      const success = await submitQuote({
        body: submissionPayload,
        quoteId: quoteIdentifier,
        userId: user.userId,
        companyId: user.companyId,
      });

      if (success) {
        // Navigate to quote details page after successful submission
        push(`/details/quoteDetails/${quoteIdentifier}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save quote. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Extract data for header
  const quoteDetailsArray = Array.isArray(displayQuoteDetails?.quotationDetails)
    ? displayQuoteDetails.quotationDetails
    : Array.isArray(quoteDetails?.data?.quotationDetails)
      ? quoteDetails.data.quotationDetails
      : [];
  const quoteName =
    (quoteDetailsArray[0] as { quoteName?: string } | undefined)?.quoteName ||
    (quoteDetails?.data as { quoteName?: string } | undefined)?.quoteName;
  const status =
    displayQuoteDetails?.updatedBuyerStatus ||
    quoteDetails?.data?.updatedBuyerStatus;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Sales Header - Fixed at top */}
      <SalesHeader
        title={quoteName ? decodeUnicode(quoteName) : "Edit Quote"}
        identifier={quoteIdentifier || "..."}
        {...(status && {
          status: {
            label: status,
            className: getStatusStyle(status),
          },
        })}
        onEdit={handleEditQuoteName}
        onRefresh={handleRefresh}
        onClose={handleCancel}
        menuOptions={[]}
        buttons={[
          {
            label: isPlaceOrderMode
              ? tEcommerce("placeOrder")
              : t("submitButton"),
            variant: "default",
            onClick: isPlaceOrderMode ? handlePlaceOrder : handleSaveQuote,
            disabled: saving || isSubmitting,
          },
        ]}
        showEditIcon={true}
        showIdentifier={false}
        showStatus={false}
        showRefresh={false}
        loading={loading}
      />

      {/* Quote Details Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-0">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          {loading ? (
            <DetailsSkeleton
              showStatusTracker={false}
              leftWidth="lg:w-[70%]"
              rightWidth="lg:w-[30%]"
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
              {/* Left Side - Products Table and Contact/Terms Cards - 70% */}
              <div className="w-full lg:w-[70%] space-y-2 sm:space-y-3 mt-[60px]">
                {!loading && !error && quoteDetails && (
                  <OrderProductsTable
                    products={effectiveProducts as any}
                    {...(quoteDetails.data?.quotationDetails?.[0]
                      ?.dbProductDetails?.length && {
                      totalCount:
                        quoteDetails.data.quotationDetails[0].dbProductDetails
                          .length,
                    })}
                    isEditable={true}
                    showInvoicedQty={false}
                    onQuantityChange={handleQuantityChange}
                    editedQuantities={editedQuantities}
                    onProductAdd={handleProductAdd}
                    elasticIndex={elasticIndex}
                  />
                )}

                {!loading && !error && quoteDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">
                    <OrderContactDetails
                      billingAddress={
                        editedBillingAddress ||
                        (quoteDetails.data?.quotationDetails?.[0]
                          ?.billingAddressDetails as unknown as AddressDetails)
                      }
                      shippingAddress={
                        editedShippingAddress ||
                        (quoteDetails.data?.quotationDetails?.[0]
                          ?.shippingAddressDetails as unknown as AddressDetails)
                      }
                      registerAddress={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.registerAddressDetails as unknown as AddressDetails
                      }
                      sellerAddress={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.sellerAddressDetail as unknown as AddressDetails
                      }
                      buyerCompanyName={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.buyerCompanyName as unknown as string
                      }
                      buyerBranchName={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.buyerBranchName as unknown as string
                      }
                      warehouseName={
                        editedWarehouse?.name ||
                        (((
                          quoteDetails.data?.quotationDetails?.[0]
                            ?.dbProductDetails?.[0] as unknown as Record<
                            string,
                            Record<string, string>
                          >
                        )?.wareHouse?.wareHouseName ||
                          (
                            quoteDetails.data?.quotationDetails?.[0]
                              ?.dbProductDetails?.[0] as unknown as Record<
                              string,
                              string
                            >
                          )?.orderWareHouseName) as string | undefined)
                      }
                      warehouseAddress={
                        editedWarehouse?.addressId ||
                        ((
                          quoteDetails.data?.quotationDetails?.[0]
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
                        })
                      }
                      salesBranch={
                        editedSellerBranch?.name ||
                        (quoteDetails.data?.quotationDetails?.[0]
                          ?.sellerBranchName as unknown as string | undefined)
                      }
                      requiredDate={editedRequiredDate}
                      referenceNumber={editedReferenceNumber}
                      isEditable={true}
                      onRequiredDateChange={handleRequiredDateChange}
                      onReferenceNumberChange={handleReferenceNumberChange}
                      onBillingAddressChange={
                        handleBillingAddressChange as unknown as (
                          address: Parameters<
                            typeof OrderContactDetails
                          >[0]["billingAddress"]
                        ) => void
                      }
                      onShippingAddressChange={
                        handleShippingAddressChange as unknown as (
                          address: Parameters<
                            typeof OrderContactDetails
                          >[0]["shippingAddress"]
                        ) => void
                      }
                      onSellerBranchChange={handleSellerBranchChange}
                      onWarehouseChange={handleWarehouseChange}
                      userId={user?.userId?.toString()}
                      buyerBranchId={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.buyerBranchId as number
                      }
                      buyerCompanyId={user?.companyId}
                      productIds={getProductIds(
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.dbProductDetails as
                          | Array<Record<string, unknown>>
                          | undefined
                      )}
                      sellerCompanyId={
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.sellerCompanyId as number
                      }
                    />

                    <OrderTermsCard
                      orderTerms={
                        {
                          ...(quoteDetails.data?.quotationDetails?.[0]
                            ?.quoteTerms || {}),
                          additionalTerms: quoteDetails.data
                            ?.quotationDetails?.[0]?.additionalTerms as
                            | string
                            | undefined,
                        } as QuoteTerms
                      }
                    />
                  </div>
                )}
              </div>

              {/* Right Side - Price Details - 30% */}
              {!loading && !error && quoteDetails && (
                <div className="w-full lg:w-[30%] mt-[60px] space-y-3">
                  <OrderPriceDetails
                    products={effectiveProducts}
                    isInter={(() => {
                      // Determine if inter-state based on product taxes (IGST = inter-state, SGST/CGST = intra-state)
                      const firstProduct =
                        productsWithEditedQuantities[0] ||
                        quoteDetails.data?.quotationDetails?.[0]
                          ?.dbProductDetails?.[0];
                      if (
                        firstProduct &&
                        firstProduct.productTaxes &&
                        Array.isArray(firstProduct.productTaxes)
                      ) {
                        const hasIGST = firstProduct.productTaxes.some(
                          (t: Record<string, unknown>) => t.taxName === "IGST"
                        );
                        return hasIGST;
                      }
                      return true; // default to inter-state
                    })()}
                    taxExemption={false}
                    precision={2}
                    Settings={{
                      roundingAdjustment:
                        quoteSettings?.roundingAdjustment || false,
                    }}
                    currency={
                      (
                        quoteDetails.data?.buyerCurrencySymbol as {
                          symbol?: string;
                        }
                      )?.symbol || "INR ₹"
                    }
                    overallShipping={
                      // Use calculated value if quantities edited or cash discount applied, otherwise use API value
                      Object.keys(editedQuantities).length > 0 ||
                      cashDiscountApplied
                        ? (calculatedData?.cartValue?.totalShipping ??
                          (Number(
                            quoteDetails.data?.quotationDetails?.[0]
                              ?.overallShipping
                          ) ||
                            0))
                        : Number(
                            quoteDetails.data?.quotationDetails?.[0]
                              ?.overallShipping
                          ) || 0
                    }
                    overallTax={
                      // Use calculated tax if quantities edited or cash discount applied, otherwise use API value
                      Object.keys(editedQuantities).length > 0 ||
                      cashDiscountApplied
                        ? (() => {
                            // If calculatedData has totalTax and it's > 0, use it
                            if (
                              calculatedData?.cartValue?.totalTax &&
                              calculatedData.cartValue.totalTax > 0
                            ) {
                              return calculatedData.cartValue.totalTax;
                            }
                            // Otherwise, calculate from products' productTaxes (like IGST does)
                            const products =
                              productsWithCashDiscount.length > 0
                                ? productsWithCashDiscount
                                : productsWithEditedQuantities;

                            let totalTax = 0;
                            products.forEach((product: CartItem) => {
                              if (
                                product.productTaxes &&
                                Array.isArray(product.productTaxes)
                              ) {
                                product.productTaxes.forEach(
                                  (tax: {
                                    taxPercentage?: number;
                                    taxName?: string;
                                  }) => {
                                    const taxPercentage =
                                      tax.taxPercentage || 0;
                                    if (taxPercentage > 0) {
                                      const quantity =
                                        product.quantity ||
                                        product.askedQuantity ||
                                        1;
                                      const unitPrice =
                                        product.unitPrice ||
                                        product.discountedPrice ||
                                        0;
                                      const productTotal =
                                        product.totalPrice ||
                                        quantity * unitPrice;
                                      const taxAmount =
                                        (productTotal * taxPercentage) / 100;
                                      totalTax += taxAmount;
                                    }
                                  }
                                );
                              }
                            });

                            return (
                              totalTax ||
                              (calculatedData?.cartValue?.totalTax ??
                                (Number(
                                  quoteDetails.data?.quotationDetails?.[0]
                                    ?.overallTax
                                ) ||
                                  0))
                            );
                          })()
                        : Number(
                            quoteDetails.data?.quotationDetails?.[0]?.overallTax
                          ) || 0
                    }
                    calculatedTotal={
                      // Use calculated total if quantities edited or cash discount applied, otherwise use API value
                      Object.keys(editedQuantities).length > 0 ||
                      cashDiscountApplied
                        ? (() => {
                            // If calculatedData has calculatedTotal (exact value before rounding), use it
                            if (
                              calculatedData?.cartValue?.calculatedTotal !==
                              undefined
                            ) {
                              return calculatedData.cartValue.calculatedTotal;
                            }
                            // Otherwise, calculate manually: subtotal + tax
                            const products =
                              productsWithCashDiscount.length > 0
                                ? productsWithCashDiscount
                                : productsWithEditedQuantities;

                            // Calculate subtotal
                            let subtotal = 0;
                            products.forEach((product: CartItem) => {
                              const quantity =
                                product.quantity || product.askedQuantity || 1;
                              const unitPrice =
                                product.unitPrice ||
                                product.discountedPrice ||
                                0;
                              const productTotal =
                                product.totalPrice || quantity * unitPrice;
                              subtotal += productTotal;
                            });

                            // Calculate tax
                            let totalTax = 0;
                            products.forEach((product: CartItem) => {
                              if (
                                product.productTaxes &&
                                Array.isArray(product.productTaxes)
                              ) {
                                product.productTaxes.forEach(
                                  (tax: {
                                    taxPercentage?: number;
                                    taxName?: string;
                                  }) => {
                                    const taxPercentage =
                                      tax.taxPercentage || 0;
                                    if (taxPercentage > 0) {
                                      const quantity =
                                        product.quantity ||
                                        product.askedQuantity ||
                                        1;
                                      const unitPrice =
                                        product.unitPrice ||
                                        product.discountedPrice ||
                                        0;
                                      const productTotal =
                                        product.totalPrice ||
                                        quantity * unitPrice;
                                      const taxAmount =
                                        (productTotal * taxPercentage) / 100;
                                      totalTax += taxAmount;
                                    }
                                  }
                                );
                              }
                            });

                            const calculatedTotal = subtotal + totalTax;
                            return (
                              calculatedTotal ||
                              Number(
                                quoteDetails.data?.quotationDetails?.[0]
                                  ?.calculatedTotal ||
                                  quoteDetails.data?.quotationDetails?.[0]
                                    ?.grandTotal
                              ) ||
                              0
                            );
                          })()
                        : Number(
                            quoteDetails.data?.quotationDetails?.[0]
                              ?.calculatedTotal ||
                              quoteDetails.data?.quotationDetails?.[0]
                                ?.grandTotal
                          ) || 0
                    }
                    subTotal={
                      // Use calculated subtotal if quantities edited or cash discount applied, otherwise use API value
                      Object.keys(editedQuantities).length > 0 ||
                      cashDiscountApplied
                        ? (() => {
                            // If calculatedData has totalValue, use it
                            if (calculatedData?.cartValue?.totalValue) {
                              return calculatedData.cartValue.totalValue;
                            }
                            // Otherwise, calculate manually from products
                            const products =
                              productsWithCashDiscount.length > 0
                                ? productsWithCashDiscount
                                : productsWithEditedQuantities;

                            let subtotal = 0;
                            products.forEach((product: CartItem) => {
                              const quantity =
                                product.quantity || product.askedQuantity || 1;
                              const unitPrice =
                                product.unitPrice ||
                                product.discountedPrice ||
                                0;
                              const productTotal =
                                product.totalPrice || quantity * unitPrice;
                              subtotal += productTotal;
                            });

                            return (
                              subtotal ||
                              Number(
                                quoteDetails.data?.quotationDetails?.[0]
                                  ?.subTotal
                              ) ||
                              0
                            );
                          })()
                        : Number(
                            quoteDetails.data?.quotationDetails?.[0]?.subTotal
                          ) || 0
                    }
                    taxableAmount={
                      // Use calculated taxable amount if quantities edited or cash discount applied, otherwise use API value
                      Object.keys(editedQuantities).length > 0 ||
                      cashDiscountApplied
                        ? (() => {
                            // If calculatedData has taxableAmount, use it
                            if (calculatedData?.cartValue?.taxableAmount) {
                              return calculatedData.cartValue.taxableAmount;
                            }
                            // Otherwise, use subtotal as taxable amount
                            const products =
                              productsWithCashDiscount.length > 0
                                ? productsWithCashDiscount
                                : productsWithEditedQuantities;

                            let subtotal = 0;
                            products.forEach((product: CartItem) => {
                              const quantity =
                                product.quantity || product.askedQuantity || 1;
                              const unitPrice =
                                product.unitPrice ||
                                product.discountedPrice ||
                                0;
                              const productTotal =
                                product.totalPrice || quantity * unitPrice;
                              subtotal += productTotal;
                            });

                            return (
                              subtotal ||
                              Number(
                                quoteDetails.data?.quotationDetails?.[0]
                                  ?.taxableAmount
                              ) ||
                              0
                            );
                          })()
                        : Number(
                            quoteDetails.data?.quotationDetails?.[0]
                              ?.taxableAmount
                          ) || 0
                    }
                  />

                  <CashDiscountCard
                    handleCDApply={(
                      cashDiscountValue,
                      islatestTermAvailable,
                      paymentTerms
                    ) => {
                      handleCDApply(
                        cashDiscountValue,
                        islatestTermAvailable,
                        paymentTerms
                      );
                      if (islatestTermAvailable && paymentTerms) {
                        setQuoteDetails(prev => {
                          if (!prev || !prev.data?.quotationDetails)
                            return prev;
                          return {
                            ...prev,
                            data: {
                              ...prev.data,
                              quotationDetails: prev.data.quotationDetails.map(
                                (quote, idx) =>
                                  idx === 0
                                    ? ({
                                        ...quote,
                                        quoteTerms: {
                                          ...(quote.quoteTerms &&
                                          typeof quote.quoteTerms === "object"
                                            ? quote.quoteTerms
                                            : {}),
                                          paymentTermsId:
                                            paymentTerms.paymentTermsId ||
                                            paymentTerms.id,
                                          paymentTerms:
                                            paymentTerms.paymentTerms ||
                                            paymentTerms.description,
                                          paymentTermsCode:
                                            paymentTerms.paymentTermsCode,
                                          cashdiscount:
                                            paymentTerms.cashdiscount,
                                          cashdiscountValue:
                                            paymentTerms.cashdiscountValue,
                                        },
                                      } as typeof quote)
                                    : quote
                              ),
                            },
                          };
                        });
                      }
                    }}
                    handleRemoveCD={handleRemoveCashDiscount}
                    latestpaymentTerms={cashDiscountTerms}
                    isCashDiscountApplied={cashDiscountApplied}
                    isSummaryPage={false}
                    isEdit={true}
                    cashDiscountValue={
                      quoteDetails?.data?.quotationDetails?.[0]
                        ?.cashdiscountValue ||
                      cashDiscountTerms?.cashdiscountValue ||
                      (quoteDetails?.data?.quotationDetails?.[0]?.quoteTerms &&
                      typeof quoteDetails.data.quotationDetails[0]
                        .quoteTerms === "object" &&
                      "cashdiscountValue" in
                        quoteDetails.data.quotationDetails[0].quoteTerms
                        ? (
                            quoteDetails.data.quotationDetails[0]
                              .quoteTerms as {
                              cashdiscountValue?: number;
                            }
                          ).cashdiscountValue
                        : undefined) ||
                      0
                    }
                    islatestTermAvailable={
                      !isEmpty(cashDiscountTerms) && !cashDiscountApplied
                    }
                    prevPaymentTerms={prevPaymentTerms}
                    isOrder={false}
                    isQuoteToOrder={false}
                    cashdiscount={cashDiscountApplied}
                  />

                  <SPRForm
                    sellerCompanyId={
                      quoteDetails.data?.quotationDetails?.[0]
                        ?.sellerCompanyId as number
                    }
                    customerName={sprCustomerName}
                    projectName={sprProjectName}
                    competitors={sprCompetitors}
                    priceJustification={sprPriceJustification}
                    onCustomerNameChange={setSprCustomerName}
                    onProjectNameChange={setSprProjectName}
                    onCompetitorsChange={setSprCompetitors}
                    onPriceJustificationChange={setSprPriceJustification}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Quote Name Dialog */}
      <EditOrderNameDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentOrderName={quoteName || ""}
        onSave={handleSaveQuoteName}
        loading={loading}
        title="Edit Quote Name"
        label={t("quoteName") || "Quote Name"}
        placeholder={t("enterQuoteName") || "Enter quote name"}
        successMessage="Quote name updated successfully"
        errorMessage={
          t("failedToUpdateQuoteName") || "Failed to update quote name"
        }
        nameType="Quote"
      />

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {isPlaceOrderMode ? tEcommerce("placeOrder") : t("submitButton")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {isPlaceOrderMode
                ? t("placeOrderConfirmationDescription")
                : t("newVersionCreatedNote")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={saving || isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="default"
              onClick={isPlaceOrderMode ? confirmPlaceOrder : confirmSaveQuote}
              disabled={saving || isSubmitting}
            >
              {saving || isSubmitting
                ? isPlaceOrderMode
                  ? t("placingOrder")
                  : t("submitting")
                : t("yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
