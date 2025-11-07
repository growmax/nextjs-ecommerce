"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderTermsCard,
  SalesHeader,
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
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers";
import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms";
import { useLatestOrderProducts } from "@/hooks/useLatestOrderProducts";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useOrderCalculation } from "@/hooks/useOrderCalculation";
import { useTenantData } from "@/hooks/useTenantData";
import type { QuotationDetailsResponse } from "@/lib/api";
import { QuotationDetailsService, QuotationVersionService } from "@/lib/api";
import {
  type SellerBranch,
  type Warehouse,
} from "@/lib/api/services/SellerWarehouseService";
import type { CartItem } from "@/types/calculation/cart";
import { getStatusStyle } from "@/utils/details/orderdetails";
import { decodeUnicode } from "@/utils/general";
import { quotationPaymentDTO } from "@/utils/quote/quotationPaymentDTO";
import { isEmpty } from "lodash";
import some from "lodash/some";

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
  const router = useRouter();
  const locale = useLocale();

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
  const [cashDiscountTerms, setCashDiscountTerms] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [prevPaymentTerms, setPrevPaymentTerms] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { quoteSettings } = useModuleSettings(user);

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
  }, [paramsLoaded, quoteIdentifier, user?.userId, user?.companyId]);

  // Extract products and currency info for latest data hook
  const quoteDetailsData = quoteDetails?.data?.quotationDetails;
  const firstQuoteDetail = quoteDetailsData?.[0];
  const products = useMemo(
    () => firstQuoteDetail?.dbProductDetails || [],
    [firstQuoteDetail?.dbProductDetails]
  );

  // Get the buyer company ID for volume discount check
  const buyerCompanyId = useMemo(() => {
    const companyId =
      firstQuoteDetail?.buyerCompanyId ||
      quoteDetails?.data?.quotationDetails?.[0]?.buyerCompanyId ||
      user?.companyId;
    if (companyId && typeof companyId === "object") {
      return undefined;
    }
    return companyId as string | number | undefined;
  }, [
    firstQuoteDetail?.buyerCompanyId,
    quoteDetails?.data?.quotationDetails,
    user?.companyId,
  ]);

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
    () => quoteDetails?.data?.buyerCurrencyId,
    [quoteDetails?.data?.buyerCurrencyId]
  );

  const sellerCurrency = useMemo(
    () => quoteDetails?.data?.curencySymbol,
    [quoteDetails?.data?.curencySymbol]
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
        (product.quantity as number) ||
        (product.unitQuantity as number) ||
        (product.askedQuantity as number) ||
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
  useEffect(() => {
    setProductsWithCashDiscount(productsWithEditedQuantities);
  }, [productsWithEditedQuantities]);

  // Cash discount handlers
  const { handleCDApply, handleRemoveCD } = useCashDiscountHandlers({
    products: productsWithCashDiscount,
    setProducts: updatedProducts => {
      setProductsWithCashDiscount(updatedProducts);
      setQuoteDetails(prev => {
        if (!prev || !prev.data?.quotationDetails) return prev;
        const dbProductDetails = updatedProducts.map(product => {
          const dbProduct: Record<string, unknown> = { ...product };
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
                return {
                  ...quote,
                  dbProductDetails:
                    dbProductDetails as unknown as typeof quote.dbProductDetails,
                  cashdiscount: true,
                } as typeof quote;
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
          : [],
    isInter: true,
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
            return prev;
          }

          return {
            ...prev,
            data: {
              ...prev.data,
              quotationDetails: prev.data.quotationDetails.map((quote, idx) =>
                idx === 0
                  ? {
                      ...quote,
                      dbProductDetails: updatedProducts,
                    }
                  : quote
              ),
            },
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedProducts, updatingProducts]);

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
      toast.success("Quote details refreshed successfully");
    } catch (error) {
      console.error("Error refreshing quote details:", error);
      toast.error("Failed to refresh quote details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/details/quoteDetails/${quoteIdentifier}`);
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
      toast.error("Quote details not loaded");
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

      toast.success(
        `${product.brandProductId || product.productName || "Product"} added to quote`
      );
    } catch {
      toast.error("Failed to add product to quote");
    }
  };

  const handleSaveQuote = () => {
    if (!quoteDetails?.data?.quotationDetails?.[0] || !user) {
      toast.error("Quote details or user information is missing");
      return;
    }
    setConfirmDialogOpen(true);
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

      const quoteBody = quotationPaymentDTO({
        values: {
          dbProductDetails: updatedProducts as CartItem[],
          removedDbProductDetails: [],
          VDapplied: calculatedData?.metadata.hasVolumeDiscount || false,
          ...(calculatedData?.breakup
            ? {
                VDDetails: {
                  ...(calculatedData.breakup.subTotal !== undefined && {
                    subTotal: calculatedData.breakup.subTotal,
                  }),
                  ...(calculatedData.breakup.subTotalVolume !== undefined && {
                    subTotalVolume: calculatedData.breakup.subTotalVolume,
                  }),
                  ...(calculatedData.breakup.overallTax !== undefined && {
                    overallTax: calculatedData.breakup.overallTax,
                  }),
                  ...(calculatedData.breakup.taxableAmount !== undefined && {
                    taxableAmount: calculatedData.breakup.taxableAmount,
                  }),
                  ...(calculatedData.breakup.calculatedTotal !== undefined && {
                    calculatedTotal: calculatedData.breakup.calculatedTotal,
                  }),
                  ...(calculatedData.breakup.roundingAdjustment !==
                    undefined && {
                    roundingAdjustment:
                      calculatedData.breakup.roundingAdjustment,
                  }),
                  ...(calculatedData.breakup.grandTotal !== undefined && {
                    grandTotal: calculatedData.breakup.grandTotal,
                  }),
                },
              }
            : {}),
          cartValue: calculatedData?.cartValue,
          buyerCurrencyId: quoteDetails.data.buyerCurrencyId as {
            id: number;
          },
          ...(firstQuoteDetail.registerAddressDetails &&
          typeof firstQuoteDetail.registerAddressDetails === "object" &&
          firstQuoteDetail.registerAddressDetails !== null
            ? {
                registerAddressDetails: {
                  ...(firstQuoteDetail.registerAddressDetails as Record<
                    string,
                    unknown
                  >),
                  addressLine: String(
                    (
                      firstQuoteDetail.registerAddressDetails as Record<
                        string,
                        unknown
                      >
                    ).addressLine || ""
                  ),
                } as unknown as Parameters<
                  typeof quotationPaymentDTO
                >[0]["values"]["registerAddressDetails"],
              }
            : {}),
          ...(editedBillingAddress
            ? {
                billingAddressDetails: {
                  ...editedBillingAddress,
                  addressLine: editedBillingAddress.addressLine || "",
                } as unknown as Parameters<
                  typeof quotationPaymentDTO
                >[0]["values"]["billingAddressDetails"],
              }
            : firstQuoteDetail.billingAddressDetails &&
                typeof firstQuoteDetail.billingAddressDetails === "object" &&
                firstQuoteDetail.billingAddressDetails !== null
              ? {
                  billingAddressDetails: {
                    ...(firstQuoteDetail.billingAddressDetails as Record<
                      string,
                      unknown
                    >),
                    addressLine: String(
                      (
                        firstQuoteDetail.billingAddressDetails as Record<
                          string,
                          unknown
                        >
                      ).addressLine || ""
                    ),
                  } as unknown as Parameters<
                    typeof quotationPaymentDTO
                  >[0]["values"]["billingAddressDetails"],
                }
              : {}),
          ...(editedShippingAddress
            ? {
                shippingAddressDetails: {
                  ...editedShippingAddress,
                  addressLine: editedShippingAddress.addressLine || "",
                } as unknown as Parameters<
                  typeof quotationPaymentDTO
                >[0]["values"]["shippingAddressDetails"],
              }
            : firstQuoteDetail.shippingAddressDetails &&
                typeof firstQuoteDetail.shippingAddressDetails === "object" &&
                firstQuoteDetail.shippingAddressDetails !== null
              ? {
                  shippingAddressDetails: {
                    ...(firstQuoteDetail.shippingAddressDetails as Record<
                      string,
                      unknown
                    >),
                    addressLine: String(
                      (
                        firstQuoteDetail.shippingAddressDetails as Record<
                          string,
                          unknown
                        >
                      ).addressLine || ""
                    ),
                  } as unknown as Parameters<
                    typeof quotationPaymentDTO
                  >[0]["values"]["shippingAddressDetails"],
                }
              : {}),
          ...(firstQuoteDetail.sellerAddressDetail &&
          typeof firstQuoteDetail.sellerAddressDetail === "object" &&
          firstQuoteDetail.sellerAddressDetail !== null
            ? {
                sellerAddressDetail: {
                  ...(firstQuoteDetail.sellerAddressDetail as Record<
                    string,
                    unknown
                  >),
                  addressLine: String(
                    (
                      firstQuoteDetail.sellerAddressDetail as Record<
                        string,
                        unknown
                      >
                    ).addressLine || ""
                  ),
                } as unknown as Parameters<
                  typeof quotationPaymentDTO
                >[0]["values"]["sellerAddressDetail"],
              }
            : {}),
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
          quoteTerms: firstQuoteDetail.quoteTerms as {
            pfPercentage?: number;
            pfValue?: number;
          },
          pfRate: firstQuoteDetail.pfRate as number,
          isInter: firstQuoteDetail.isInter as boolean,
        } as Parameters<typeof quotationPaymentDTO>[0]["values"],
        overviewValues: {
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
          quoteDivisionId: firstQuoteDetail.quoteDivisionId as
            | { id: number }
            | number,
          quoteType: firstQuoteDetail.quoteType as { id: number },
          tagsList: firstQuoteDetail.tagsList as Array<{ id: number }>,
        },
        previousVersionDetails: {
          overallTax: firstQuoteDetail.overallTax as number,
          subTotal: firstQuoteDetail.subTotal as number,
          overallShipping: firstQuoteDetail.overallShipping as number,
          totalPfValue: firstQuoteDetail.totalPfValue as number,
        },
        initialValues: {
          quotationDetails: [firstQuoteDetail],
        },
        displayName: user.displayName || "",
        companyName:
          firstQuoteDetail.buyerCompanyName ||
          firstQuoteDetail.sellerCompanyName ||
          "",
      });

      await QuotationVersionService.createNewVersion({
        quotationIdentifier: quoteIdentifier,
        userId: user.userId,
        companyId: user.companyId,
        versionData: quoteBody,
      });

      toast.success("New version created successfully");
      router.push(`/${locale}/details/quoteDetails/${quoteIdentifier}`);
    } catch (error) {
      console.error("Error saving quote:", error);
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
  const quoteName =
    quoteDetails?.data?.quotationDetails?.[0]?.quoteName ||
    quoteDetails?.data?.quoteName;
  const status = quoteDetails?.data?.updatedBuyerStatus;

  return (
    <div className="min-h-screen bg-gray-50">
      <SalesHeader
        title={quoteName ? decodeUnicode(quoteName) : "Edit Quote"}
        identifier={quoteIdentifier || "..."}
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
            label: "SAVE QUOTE",
            variant: "default",
            onClick: handleSaveQuote,
            disabled: saving,
          },
        ]}
        showEditIcon={false}
        loading={loading}
      />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative pt-28">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
          <div className="w-full lg:w-[70%] space-y-3 sm:space-y-4 md:space-y-6 mt-14">
            {!loading && !error && quoteDetails && (
              <OrderProductsTable
                products={
                  updatedProducts.length > 0
                    ? updatedProducts
                    : quoteDetails.data?.quotationDetails?.[0]
                        ?.dbProductDetails || []
                }
                {...(quoteDetails.data?.quotationDetails?.[0]?.dbProductDetails
                  ?.length && {
                  totalCount:
                    quoteDetails.data.quotationDetails[0].dbProductDetails
                      .length,
                })}
                isEditable={true}
                onQuantityChange={handleQuantityChange}
                editedQuantities={editedQuantities}
                onProductAdd={handleProductAdd}
                elasticIndex={elasticIndex}
                useAskedQuantity={true}
                hideInvoicedQty={true}
              />
            )}

            {!loading && !error && quoteDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                    (
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
                    }
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
                  productIds={
                    (quoteDetails.data?.quotationDetails?.[0]?.dbProductDetails
                      ?.map(p => p.productId)
                      .filter((id): id is string => typeof id === "string") ||
                      []) as unknown as number[]
                  }
                  sellerCompanyId={
                    quoteDetails.data?.quotationDetails?.[0]
                      ?.sellerCompanyId as number
                  }
                />

                <OrderTermsCard
                  orderTerms={
                    quoteDetails.data?.quotationDetails?.[0]
                      ?.quoteTerms as unknown as QuoteTerms
                  }
                />
              </div>
            )}
          </div>

          {!loading && !error && quoteDetails && (
            <div className="w-full lg:w-[30%] mt-[52px] space-y-3">
              <OrderPriceDetails
                products={
                  calculatedData?.products && calculatedData.products.length > 0
                    ? (calculatedData.products as unknown as Array<
                        Record<string, unknown>
                      >)
                    : productsWithCashDiscount.length > 0
                      ? productsWithCashDiscount
                      : productsWithEditedQuantities.length > 0
                        ? productsWithEditedQuantities
                        : updatedProducts.length > 0
                          ? updatedProducts
                          : products
                }
                isInter={(() => {
                  // Determine if inter-state based on product taxes (IGST = inter-state, SGST/CGST = intra-state)
                  const productList =
                    calculatedData?.products &&
                    calculatedData.products.length > 0
                      ? calculatedData.products
                      : productsWithCashDiscount.length > 0
                        ? productsWithCashDiscount
                        : productsWithEditedQuantities.length > 0
                          ? productsWithEditedQuantities
                          : updatedProducts.length > 0
                            ? updatedProducts
                            : products;

                  if (productList.length > 0 && productList[0]) {
                    const firstProduct = productList[0] as Record<
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
                  Number(firstQuoteDetail?.insuranceCharges) || 0
                }
                precision={2}
                Settings={{
                  roundingAdjustment:
                    firstQuoteDetail?.roundingAdjustmentEnabled || false,
                }}
                isSeller={(user as { isSeller?: boolean })?.isSeller || false}
                taxExemption={
                  (user as { taxExemption?: boolean })?.taxExemption || false
                }
                currency={
                  (
                    quoteDetails.data?.buyerCurrencySymbol as {
                      symbol?: string;
                    }
                  )?.symbol || "INR ₹"
                }
                overallShipping={
                  calculatedData?.cartValue?.totalShipping !== undefined
                    ? calculatedData.cartValue.totalShipping
                    : Number(firstQuoteDetail?.overallShipping || 0)
                }
                overallTax={
                  calculatedData?.cartValue?.totalTax !== undefined
                    ? calculatedData.cartValue.totalTax
                    : Number(firstQuoteDetail?.overallTax || 0)
                }
                calculatedTotal={
                  calculatedData?.cartValue?.grandTotal !== undefined
                    ? calculatedData.cartValue.grandTotal
                    : Number(
                        firstQuoteDetail?.calculatedTotal ||
                          firstQuoteDetail?.grandTotal ||
                          0
                      )
                }
                subTotal={
                  calculatedData?.cartValue?.totalValue !== undefined
                    ? calculatedData.cartValue.totalValue
                    : Number(firstQuoteDetail?.subTotal || 0)
                }
                taxableAmount={
                  calculatedData?.cartValue?.taxableAmount !== undefined
                    ? calculatedData.cartValue.taxableAmount
                    : Number(firstQuoteDetail?.taxableAmount || 0)
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
                      if (!prev || !prev.data?.quotationDetails) return prev;
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
                                      cashdiscount: paymentTerms.cashdiscount,
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
                  typeof quoteDetails.data.quotationDetails[0].quoteTerms ===
                    "object" &&
                  "cashdiscountValue" in
                    quoteDetails.data.quotationDetails[0].quoteTerms
                    ? (
                        quoteDetails.data.quotationDetails[0].quoteTerms as {
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
            </div>
          )}
        </div>
      </div>

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
              Save Quote
            </DialogTitle>
            <DialogDescription className="pt-2">
              Note: New version will be created for this quotation
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={saving}
            >
              CANCEL
            </Button>
            <Button
              variant="default"
              onClick={confirmSaveQuote}
              disabled={saving}
            >
              YES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
