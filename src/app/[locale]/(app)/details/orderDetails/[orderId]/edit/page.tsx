"use client";

import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  VersionsDialog,
  type Version,
} from "@/components/dialogs/VersionsDialog";
import { ApplicationLayout, PageLayout } from "@/components/layout";
import {
  DetailsSkeleton,
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
import { useOrderDetails } from "@/hooks/details/orderdetails/useOrderDetails";
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";
import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useFetchOrderDetails from "@/hooks/useFetchOrderDetails/useFetchOrderDetails";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";
import { useLatestOrderProducts } from "@/hooks/useLatestOrderProducts/useLatestOrderProducts";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useOrderCalculation } from "@/hooks/useOrderCalculation/useOrderCalculation";
import { usePageScroll } from "@/hooks/usePageScroll";
import { useTenantData } from "@/hooks/useTenantData";
import type { OrderDetailItem, OrderDetailsResponse } from "@/lib/api";
import { OrderVersionService } from "@/lib/api";
import {
  type SellerBranch,
  type Warehouse,
} from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";
import type { CartItem } from "@/types/calculation/cart";
import type { SelectedVersion } from "@/types/details/orderdetails/version.types";
import { orderPaymentDTO } from "@/utils/order/orderPaymentDTO/orderPaymentDTO";
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
  const { push } = useNavigationWithLoader();
  const t = useTranslations("orders");
  const tDetails = useTranslations("details");

  usePageScroll();

  const [orderId, setOrderId] = useState<string>("");

  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Use the hook to fetch order details (provides mutate function for refresh)
  const {
    fetchOrderResponse,
    fetchOrderError,
    fetchOrderResponseLoading,
    fetchOrderResponseMutate,
  } = useFetchOrderDetails(orderId);
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
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<SelectedVersion | null>(null);
  const [triggerVersionCall, setTriggerVersionCall] = useState(false);

  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { quoteSettings } = useModuleSettings(user);

  // Get latest payment terms with cash discount
  const { latestPaymentTerms } = useGetLatestPaymentTerms(true);

  // Use custom hook for order details logic
  const {
    versions: orderVersions,
    orderIdentifier,
    orderVersion,
  } = useOrderDetails({
    orderDetails,
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

  // Track processed versions to prevent duplicate processing
  const processedVersionRef = useRef<string | null>(null);

  // Update order details when version data is loaded
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

      // Update order details with version data
      if (versionData.data) {
        setOrderDetails({
          data: versionData.data,
        } as OrderDetailsResponse);

        // Show success toast only if data is freshly loaded (not from cache)
        if (!versionLoading) {
          const versionName =
            orderVersions.find(
              (v: Version) => v.versionNumber === selectedVersion.versionNumber
            )?.versionName ||
            `${tDetails("version")} ${selectedVersion.versionNumber}`;
          toast.success(t("loadedVersionDetails", { versionName }));
        }
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

  // Extract data for display - use version data if available, otherwise use order details
  const displayOrderDetails = useMemo(() => {
    if (versionData && selectedVersion && versionData.data) {
      return versionData.data;
    }
    return orderDetails?.data;
  }, [versionData, selectedVersion, orderDetails?.data]);

  // Extract products and currency info for latest data hook
  const orderDetailsData =
    displayOrderDetails?.orderDetails || orderDetails?.data?.orderDetails;
  const firstOrderDetail = orderDetailsData?.[0];

  // Derive pricing context (tax flags, charges) from order details
  const orderPricingContext = useMemo(() => {
    const detail = firstOrderDetail;
    const header = displayOrderDetails || orderDetails?.data;

    const resolvedIsInter =
      typeof detail?.isInter === "boolean"
        ? detail.isInter
        : typeof header?.isInter === "boolean"
          ? header.isInter
          : true;

    const resolvedTaxExemption =
      typeof detail?.taxExemption === "boolean"
        ? detail.taxExemption
        : typeof header?.taxExemption === "boolean"
          ? header.taxExemption
          : Boolean((user as { taxExemption?: boolean })?.taxExemption);

    const resolvedInsurance = Number(
      detail?.insuranceCharges ?? header?.insuranceCharges ?? 0
    );

    const resolvedShipping = Number(
      detail?.overallShipping ?? header?.overallShipping ?? 0
    );

    const detailOrderTerms = detail?.orderTerms as
      | Record<string, unknown>
      | undefined;
    const detailPfValue =
      detailOrderTerms && typeof detailOrderTerms["pfValue"] === "number"
        ? (detailOrderTerms["pfValue"] as number)
        : undefined;

    const resolvedPfRate = Number(
      detail?.pfRate ?? detailPfValue ?? header?.pfRate ?? 0
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
  }, [firstOrderDetail, displayOrderDetails, orderDetails?.data, user]);
  const products = useMemo(
    () => firstOrderDetail?.dbProductDetails || [],
    [firstOrderDetail?.dbProductDetails]
  );

  // Get the buyer company ID for volume discount check
  const buyerCompanyId = useMemo(() => {
    const companyId =
      firstOrderDetail?.buyerCompanyId ||
      orderDetails?.data?.orderDetails?.[0]?.buyerCompanyId ||
      user?.companyId;
    // Ensure companyId is a valid string or number, not an object
    if (companyId && typeof companyId === "object") {
      return undefined;
    }
    return companyId as string | number | undefined;
  }, [
    firstOrderDetail?.buyerCompanyId,
    orderDetails?.data?.orderDetails,
    user?.companyId,
  ]);

  // Check if volume discount is enabled for the company
  // Only check if all products have prices
  const allProductsHavePrices = useMemo(() => {
    if (!products || products.length === 0) return false;
    return !some(products, (product: Record<string, unknown>) => {
      const showPrice = product.showPrice;
      return showPrice === false || showPrice === undefined;
    });
  }, [products]);

  // Volume discount check (currently unused, but kept for future use)
  useCheckVolumeDiscountEnabled(
    buyerCompanyId,
    allProductsHavePrices && !loading && !!buyerCompanyId
  );

  const currency = useMemo(
    () =>
      displayOrderDetails?.buyerCurrencyId ||
      orderDetails?.data?.buyerCurrencyId,
    [displayOrderDetails?.buyerCurrencyId, orderDetails?.data?.buyerCurrencyId]
  );

  const sellerCurrency = useMemo(
    () =>
      displayOrderDetails?.sellerCurrencyId ||
      orderDetails?.data?.sellerCurrencyId,
    [
      displayOrderDetails?.sellerCurrencyId,
      orderDetails?.data?.sellerCurrencyId,
    ]
  );

  // Use hook to get latest product pricing, discounts, and tax data
  const { updatedProducts, isLoading: updatingProducts } =
    useLatestOrderProducts({
      products,
      currency,
      sellerCurrency,
      isInter: orderPricingContext.isInter,
      taxExemption: orderPricingContext.taxExemption,
      isCloneReOrder: false,
      isPlaceOrder: false,
      enabled: !loading && products.length > 0,
    });

  // Apply edited quantities to products and ensure CartItem format
  const productsWithEditedQuantities = useMemo(() => {
    // Ensure we have a valid array
    const baseProductsArray =
      updatedProducts.length > 0
        ? updatedProducts
        : orderDetails?.data?.orderDetails?.[0]?.dbProductDetails || [];

    // Ensure it's actually an array
    const baseProducts = Array.isArray(baseProductsArray)
      ? baseProductsArray
      : [];

    // Return empty array if no products
    if (baseProducts.length === 0) {
      return [];
    }

    return baseProducts.map((product: Record<string, unknown>) => {
      const productId =
        (product.productId as string | number) ||
        (product.brandProductId as string) ||
        (product.itemCode as string) ||
        (product.orderIdentifier as string) ||
        "";

      // Get current quantity or use edited quantity
      // Check for valid quantity values (> 0), prioritizing quantity -> unitQuantity -> askedQuantity
      let quantity = 1; // default
      if (typeof product.quantity === "number" && product.quantity > 0) {
        quantity = product.quantity;
      } else if (
        typeof product.unitQuantity === "number" &&
        product.unitQuantity > 0
      ) {
        quantity = product.unitQuantity;
      } else if (
        typeof product.askedQuantity === "number" &&
        product.askedQuantity > 0
      ) {
        quantity = product.askedQuantity;
      }

      // Only check editedQuantities if productId is a valid string/number
      // Check multiple possible productId formats
      const possibleIds = [
        productId,
        product.brandProductId as string,
        product.itemCode as string,
        product.orderIdentifier as string,
        product.productId as string | number,
      ].filter(Boolean);

      // Check if any of the possible IDs match editedQuantities
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

      // Ensure product has required CartItem fields
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
        // Ensure all required fields have defaults
        discount:
          (product.discount as number) ||
          (product.discountPercentage as number) ||
          0,
        discountPercentage:
          (product.discountPercentage as number) ||
          (product.discount as number) ||
          0,
        tax: ((product.tax as number) || 0) * quantity,
        totalTax: 0,
        interTaxBreakup: [],
        intraTaxBreakup: [],
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
  }, [updatedProducts, editedQuantities, orderDetails]);

  // Update cash discount terms when payment terms are fetched
  useEffect(() => {
    if (latestPaymentTerms && !cashDiscountTerms) {
      setCashDiscountTerms(latestPaymentTerms);
    }
  }, [latestPaymentTerms, cashDiscountTerms]);

  // Track cash discount applied state from order details
  useEffect(() => {
    if (orderDetails?.data?.orderDetails?.[0]) {
      const orderDetail = orderDetails.data.orderDetails[0];
      const isApplied = Boolean(orderDetail.cashdiscount);
      setCashDiscountApplied(isApplied);

      // Store previous payment terms if cash discount is not applied
      if (!isApplied && orderDetail.orderTerms) {
        setPrevPaymentTerms(orderDetail.orderTerms);
      }
    }
  }, [orderDetails]);

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
    setProducts: nextProducts => {
      setProductsWithCashDiscount(nextProducts);
      // Update order details with new products
      setOrderDetails(prev => {
        if (!prev || !prev.data?.orderDetails) return prev;
        // Convert CartItem[] to DbProductDetail[] format
        const dbProductDetails = nextProducts.map(product => {
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
            orderDetails: prev.data.orderDetails.map((order, idx) => {
              if (idx === 0) {
                const updatedOrder = {
                  ...order,
                  dbProductDetails:
                    dbProductDetails as unknown as typeof order.dbProductDetails,
                  cashdiscount: true,
                  cashdiscountValue: nextProducts[0]?.cashdiscountValue ?? 0,
                };
                return updatedOrder as OrderDetailItem;
              }
              return order;
            }),
          },
        };
      });
      setCashDiscountApplied(true);
    },
    isOrder: true,
  });

  // Wrapper for remove handler
  const handleRemoveCashDiscount = useCallback(
    (prevTerms?: OrderTerms | Record<string, unknown>) => {
      handleRemoveCD(prevTerms);
      setCashDiscountApplied(false);
      // Restore previous payment terms
      if (prevTerms) {
        setOrderDetails(prev => {
          if (!prev || !prev.data?.orderDetails) return prev;
          return {
            ...prev,
            data: {
              ...prev.data,
              orderDetails: prev.data.orderDetails.map((order, idx) =>
                idx === 0
                  ? {
                      ...order,
                      cashdiscount: false,
                      cashdiscountValue: 0,
                      orderTerms:
                        prevTerms as unknown as typeof order.orderTerms,
                    }
                  : order
              ),
            },
          };
        });
      }
    },
    [handleRemoveCD]
  );

  // Calculate order using the calculation hook
  // Only calculate if we have products
  const calculationInputProducts = useMemo(() => {
    if (productsWithCashDiscount.length > 0) {
      return productsWithCashDiscount as CartItem[];
    }
    if (productsWithEditedQuantities.length > 0) {
      return productsWithEditedQuantities as CartItem[];
    }
    if (updatedProducts.length > 0) {
      return updatedProducts as CartItem[];
    }
    return (orderDetails?.data?.orderDetails?.[0]?.dbProductDetails ||
      []) as CartItem[];
  }, [
    productsWithCashDiscount,
    productsWithEditedQuantities,
    updatedProducts,
    orderDetails?.data?.orderDetails,
  ]);

  const { calculatedData } = useOrderCalculation({
    products: calculationInputProducts,
    isInter: orderPricingContext.isInter,
    taxExemption: orderPricingContext.taxExemption,
    insuranceCharges: orderPricingContext.insuranceCharges,
    shippingCharges: orderPricingContext.overallShipping,
    pfRate: orderPricingContext.pfRate,
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

  // Log calculated data when it changes
  useEffect(() => {
    // calculatedData updated - debug logging removed
  }, [calculatedData]);

  const effectiveProducts = useMemo(() => {
    if (calculatedData?.products && calculatedData.products.length > 0) {
      return calculatedData.products as CartItem[];
    }
    return calculationInputProducts;
  }, [calculatedData?.products, calculationInputProducts]);

  // Track previous updatedProducts to prevent infinite loops
  const prevUpdatedProductsRef = useRef<unknown[]>([]);

  // Update order details when products are updated (only if products actually changed)
  useEffect(() => {
    if (
      updatedProducts &&
      Array.isArray(updatedProducts) &&
      updatedProducts.length > 0 &&
      !updatingProducts &&
      orderDetails
    ) {
      // Guard: only update if products actually changed
      const prevProducts = prevUpdatedProductsRef.current;
      const currentProducts = updatedProducts;

      // Check if products changed by comparing lengths and IDs
      const hasChanged =
        prevProducts.length !== currentProducts.length ||
        prevProducts.some(
          (prev, idx) =>
            (prev as Record<string, unknown>)?.productId !==
            (currentProducts[idx] as Record<string, unknown>)?.productId
        );

      if (hasChanged) {
        prevUpdatedProductsRef.current = currentProducts;
        setOrderDetails(prev => {
          if (!prev || !prev.data?.orderDetails) return prev;
          const currentProductsArray =
            prev.data.orderDetails[0]?.dbProductDetails || [];

          // Double-check: only update if products are actually different
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

          return {
            ...prev,
            data: {
              ...prev.data,
              orderDetails: prev.data.orderDetails.map((order, idx) =>
                idx === 0
                  ? {
                      ...order,
                      dbProductDetails: updatedProducts,
                    }
                  : order
              ),
            },
          };
        });
      }
    }
  }, [updatedProducts, updatingProducts, orderDetails]);

  // Load params asynchronously
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
    };
    loadParams();
  }, [params]);

  // Use the hook's response to set orderDetails state
  useEffect(() => {
    if (fetchOrderResponse) {
      // Set orderDetails from hook response
      setOrderDetails({
        data: fetchOrderResponse,
      } as OrderDetailsResponse);

      // Initialize editable fields with current values
      const currentRequiredDate =
        fetchOrderResponse?.orderDetails?.[0]?.customerRequiredDate ||
        fetchOrderResponse?.orderDeliveryDate ||
        "";
      const currentReferenceNumber =
        fetchOrderResponse?.orderDetails?.[0]?.buyerReferenceNumber || "";

      setEditedRequiredDate(currentRequiredDate as string);
      setEditedReferenceNumber(currentReferenceNumber as string);
    }
  }, [fetchOrderResponse]);

  // Update loading state from hook
  useEffect(() => {
    setLoading(fetchOrderResponseLoading);
  }, [fetchOrderResponseLoading]);

  // Update error state from hook
  useEffect(() => {
    if (fetchOrderError) {
      const errorMessage =
        fetchOrderError instanceof Error
          ? fetchOrderError.message
          : t("failedToFetchOrderDetails");
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [fetchOrderError, t]);

  // Handler functions
  const handleRefresh = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      // Use the hook's mutate function to refresh data
      await fetchOrderResponseMutate();
      toast.success(t("orderDetailsRefreshed"));
    } catch {
      toast.error(t("failedToRefreshOrderDetails"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    push(`/details/orderDetails/${orderId}`);
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

  // Handle adding a product to the order
  const handleProductAdd = (product: ProductSearchResult) => {
    if (!orderDetails || !orderDetails.data?.orderDetails?.[0]) {
      toast.error(t("orderDetailsNotLoaded"));
      return;
    }

    try {
      // Create a new product detail from the search result
      const newProduct = {
        productId: product.productId,
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
          (orderDetails.data.orderDetails[0].dbProductDetails?.length || 0) + 1,
      };

      // Update order details with the new product
      setOrderDetails(prev => {
        if (!prev || !prev.data?.orderDetails) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            orderDetails: prev.data.orderDetails.map((order, idx) =>
              idx === 0
                ? {
                    ...order,
                    dbProductDetails: [
                      ...(order.dbProductDetails || []),
                      newProduct,
                    ],
                  }
                : order
            ),
          },
        };
      });

      toast.success(t("productAddedSuccessfully"));
    } catch {
      toast.error(t("failedToAddProductToOrder"));
    }
  };

  /**
   * Handle Place Order Flow:
   * 1. User clicks "PLACE ORDER" button - opens confirmation dialog
   */
  const handlePlaceOrder = () => {
    if (!orderDetails?.data?.orderDetails?.[0] || !user) {
      toast.error("Order details or user information is missing");
      return;
    }
    setConfirmDialogOpen(true);
  };

  /**
   * Confirm Place Order Flow:
   * 1. User clicks "YES" in confirmation dialog
   * 2. Prepare order data using orderPaymentDTO utility
   * 3. Call OrderVersionService to create new version (calls external API)
   * 4. Refresh order details using hook's mutate function
   * 5. Show success message
   * 6. Navigate back to order details page
   */
  const confirmPlaceOrder = async () => {
    if (!orderDetails?.data?.orderDetails?.[0] || !user) {
      toast.error("Order details or user information is missing");
      return;
    }

    setConfirmDialogOpen(false);
    setSaving(true);
    try {
      const firstOrderDetail = orderDetails.data.orderDetails[0];

      // Step 2: Prepare order data using orderPaymentDTO utility
      // Gets current order details, previous version (if exists), calculates totals, formats products
      // Use edited values if available, otherwise use original values
      const orderBody = orderPaymentDTO({
        values: {
          dbProductDetails: effectiveProducts as CartItem[],
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
          buyerCurrencyId: orderDetails.data.buyerCurrencyId as {
            id: number;
          },
          // Use edited addresses if available, otherwise pass original
          ...(firstOrderDetail.registerAddressDetails &&
          typeof firstOrderDetail.registerAddressDetails === "object" &&
          firstOrderDetail.registerAddressDetails !== null
            ? {
                registerAddressDetails: {
                  ...(firstOrderDetail.registerAddressDetails as Record<
                    string,
                    unknown
                  >),
                  addressLine: String(
                    (
                      firstOrderDetail.registerAddressDetails as Record<
                        string,
                        unknown
                      >
                    ).addressLine || ""
                  ),
                } as unknown as Parameters<
                  typeof orderPaymentDTO
                >[0]["values"]["registerAddressDetails"],
              }
            : {}),
          ...(editedBillingAddress
            ? {
                billingAddressDetails: {
                  ...editedBillingAddress,
                  addressLine: editedBillingAddress.addressLine || "",
                } as unknown as Parameters<
                  typeof orderPaymentDTO
                >[0]["values"]["billingAddressDetails"],
              }
            : firstOrderDetail.billingAddressDetails &&
                typeof firstOrderDetail.billingAddressDetails === "object" &&
                firstOrderDetail.billingAddressDetails !== null
              ? {
                  billingAddressDetails: {
                    ...(firstOrderDetail.billingAddressDetails as Record<
                      string,
                      unknown
                    >),
                    addressLine: String(
                      (
                        firstOrderDetail.billingAddressDetails as Record<
                          string,
                          unknown
                        >
                      ).addressLine || ""
                    ),
                  } as unknown as Parameters<
                    typeof orderPaymentDTO
                  >[0]["values"]["billingAddressDetails"],
                }
              : {}),
          ...(editedShippingAddress
            ? {
                shippingAddressDetails: {
                  ...editedShippingAddress,
                  addressLine: editedShippingAddress.addressLine || "",
                } as unknown as Parameters<
                  typeof orderPaymentDTO
                >[0]["values"]["shippingAddressDetails"],
              }
            : firstOrderDetail.shippingAddressDetails &&
                typeof firstOrderDetail.shippingAddressDetails === "object" &&
                firstOrderDetail.shippingAddressDetails !== null
              ? {
                  shippingAddressDetails: {
                    ...(firstOrderDetail.shippingAddressDetails as Record<
                      string,
                      unknown
                    >),
                    addressLine: String(
                      (
                        firstOrderDetail.shippingAddressDetails as Record<
                          string,
                          unknown
                        >
                      ).addressLine || ""
                    ),
                  } as unknown as Parameters<
                    typeof orderPaymentDTO
                  >[0]["values"]["shippingAddressDetails"],
                }
              : {}),
          ...(firstOrderDetail.sellerAddressDetail &&
          typeof firstOrderDetail.sellerAddressDetail === "object" &&
          firstOrderDetail.sellerAddressDetail !== null
            ? {
                sellerAddressDetail: {
                  ...(firstOrderDetail.sellerAddressDetail as Record<
                    string,
                    unknown
                  >),
                  addressLine: String(
                    (
                      firstOrderDetail.sellerAddressDetail as Record<
                        string,
                        unknown
                      >
                    ).addressLine || ""
                  ),
                } as unknown as Parameters<
                  typeof orderPaymentDTO
                >[0]["values"]["sellerAddressDetail"],
              }
            : {}),
          // Use edited values if available
          buyerBranchId: firstOrderDetail.buyerBranchId as number,
          buyerBranchName: firstOrderDetail.buyerBranchName as string,
          buyerCompanyId: firstOrderDetail.buyerCompanyId as number,
          buyerCompanyName: firstOrderDetail.buyerCompanyName as string,
          sellerBranchId: firstOrderDetail.sellerBranchId as number,
          sellerBranchName: firstOrderDetail.sellerBranchName as string,
          sellerCompanyId: firstOrderDetail.sellerCompanyId as number,
          sellerCompanyName: firstOrderDetail.sellerCompanyName as string,
          customerRequiredDate:
            editedRequiredDate ||
            (firstOrderDetail.customerRequiredDate as string),
          branchBusinessUnit: firstOrderDetail.branchBusinessUnit as {
            id: number;
          },
          orderTerms: firstOrderDetail.orderTerms as {
            pfPercentage?: number;
            pfValue?: number;
          },
          pfRate: firstOrderDetail.pfRate as number,
          isInter: firstOrderDetail.isInter as boolean,
        } as Parameters<typeof orderPaymentDTO>[0]["values"],
        overviewValues: {
          buyerReferenceNumber:
            editedReferenceNumber ||
            (firstOrderDetail.buyerReferenceNumber as string),
          comment: "",
          uploadedDocumentDetails:
            firstOrderDetail.uploadedDocumentDetails as unknown[],
          orderUsers: firstOrderDetail.orderUsers as Array<{
            id?: number;
            userId?: number;
          }>,
          orderDivisionId: firstOrderDetail.orderDivisionId as
            | { id: number }
            | number,
          orderType: firstOrderDetail.orderType as { id: number },
          tagsList: firstOrderDetail.tagsList as Array<{ id: number }>,
        },
        previousVersionDetails: {
          overallTax: firstOrderDetail.overallTax as number,
          subTotal: firstOrderDetail.subTotal as number,
          overallShipping: firstOrderDetail.overallShipping as number,
          totalPfValue: firstOrderDetail.totalPfValue as number,
        },
        initialValues: {
          orderDetails: [firstOrderDetail],
        },
        displayName: user.displayName || "",
        companyName:
          firstOrderDetail.buyerCompanyName ||
          firstOrderDetail.sellerCompanyName ||
          "",
        totalPaid: (firstOrderDetail.totalPaid as number) || 0,
        isReorder: false,
      });

      // Step 3: Call the service to create new order version
      // Service calls external API: orders/createNewVersion?orderIdentifier=${orderId}&userId=${userId}&companyId=${companyId}
      await OrderVersionService.createNewVersion({
        orderIdentifier: orderId,
        userId: user.userId,
        companyId: user.companyId,
        versionData: orderBody,
      });

      // Step 4: Refresh order details using the hook's mutate function
      await fetchOrderResponseMutate();

      // Step 5: Show success message
      toast.success(t("newVersionCreatedSuccessfully"));

      // Step 6: Navigate back to order details page
      push(`/details/orderDetails/${orderId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("failedToPlaceOrder")
      );
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

  // Handle version selection
  const handleVersionSelect = (version: Version) => {
    // Close dialog immediately
    setVersionsDialogOpen(false);

    // If version 1 is selected, reset to original order details
    if (version.versionNumber === 1) {
      // Reset to original order details
      if (orderDetails) {
        // Reset processed version ref
        processedVersionRef.current = null;
        // Re-fetch original order details
        setSelectedVersion(null);
        setTriggerVersionCall(false);
        fetchOrderResponseMutate();
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

  // Extract data for header
  const orderName =
    displayOrderDetails?.orderDetails?.[0]?.orderName ||
    orderDetails?.data?.orderDetails?.[0]?.orderName;
  const status =
    displayOrderDetails?.updatedBuyerStatus ||
    orderDetails?.data?.updatedBuyerStatus;

  return (
    <ApplicationLayout>
      {/* Sales Header - Fixed at top */}
      <div className="flex-shrink-0 sticky top-0 z-50 bg-gray-50">
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
          showRefresh={true}
          onClose={handleCancel}
          menuOptions={[]}
          buttons={[
            {
              label: t("placeOrder"),
              variant: "default",
              onClick: handlePlaceOrder,
              disabled: saving,
            },
          ]}
          showEditIcon={false}
          loading={loading}
        />
      </div>

      {/* Order Details Content - Scrollable area */}
      <div className="flex-1 w-full">
        <PageLayout variant="content">
          {loading ? (
            <DetailsSkeleton
              showStatusTracker={false}
              leftWidth="lg:w-[70%]"
              rightWidth="lg:w-[30%]"
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Left Side - Products Table and Contact/Terms Cards - 70% */}
              <div className="w-full lg:w-[70%] space-y-2 sm:space-y-3 mt-[80px]">
                {/* Products Table */}
                {!loading && !error && orderDetails && (
                  <OrderProductsTable
                    products={
                      effectiveProducts.length > 0
                        ? effectiveProducts
                        : updatedProducts.length > 0
                          ? updatedProducts
                          : orderDetails.data?.orderDetails?.[0]
                              ?.dbProductDetails || []
                    }
                    {...(orderDetails.data?.orderDetails?.[0]?.dbProductDetails
                      ?.length && {
                      totalCount:
                        orderDetails.data.orderDetails[0].dbProductDetails
                          .length,
                    })}
                    isEditable={true}
                    onQuantityChange={handleQuantityChange}
                    editedQuantities={editedQuantities}
                    onProductAdd={handleProductAdd}
                    elasticIndex={elasticIndex}
                  />
                )}

                {/* Contact Details and Terms Cards - Side by Side */}
                {!loading && !error && orderDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
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
                        {
                          ...(orderDetails.data?.orderDetails?.[0]
                            ?.orderTerms || {}),
                          additionalTerms: orderDetails.data?.orderDetails?.[0]
                            ?.additionalTerms as string | undefined,
                        } as OrderTerms
                      }
                    />
                  </div>
                )}
              </div>

              {/* Right Side - Price Details - 30% */}
              {!loading && !error && orderDetails && (
                <div className="w-full lg:w-[30%] mt-[80px] space-y-3">
                  <OrderPriceDetails
                    products={effectiveProducts}
                    isInter={orderPricingContext.isInter}
                    taxExemption={orderPricingContext.taxExemption}
                    precision={2}
                    Settings={{
                      roundingAdjustment:
                        quoteSettings?.roundingAdjustment || false,
                    }}
                    currency={
                      (
                        orderDetails.data?.buyerCurrencySymbol as {
                          symbol?: string;
                        }
                      )?.symbol || "INR ₹"
                    }
                    // Use calculated values when available, fallback to API values
                    overallShipping={
                      calculatedData?.cartValue?.totalShipping !== undefined
                        ? calculatedData.cartValue.totalShipping
                        : Number(
                            orderDetails.data?.orderDetails?.[0]
                              ?.overallShipping
                          ) || 0
                    }
                    overallTax={
                      calculatedData?.cartValue?.totalTax !== undefined
                        ? calculatedData.cartValue.totalTax
                        : Number(
                            orderDetails.data?.orderDetails?.[0]?.overallTax
                          ) || 0
                    }
                    insuranceCharges={orderPricingContext.insuranceCharges}
                    {...(calculatedData?.cartValue?.calculatedTotal !==
                      undefined &&
                    calculatedData?.cartValue?.calculatedTotal !== null &&
                    calculatedData?.cartValue?.totalValue !== undefined &&
                    calculatedData?.cartValue?.totalValue !== null &&
                    calculatedData?.cartValue?.taxableAmount !== undefined &&
                    calculatedData?.cartValue?.taxableAmount !== null
                      ? {
                          calculatedTotal:
                            calculatedData.cartValue.calculatedTotal,
                          subTotal: calculatedData.cartValue.totalValue,
                          taxableAmount: calculatedData.cartValue.taxableAmount,
                        }
                      : {})}
                  />

                  {/* Cash Discount Card */}
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
                      // Update payment terms if available
                      if (islatestTermAvailable && paymentTerms) {
                        setOrderDetails(prev => {
                          if (!prev || !prev.data?.orderDetails) return prev;
                          return {
                            ...prev,
                            data: {
                              ...prev.data,
                              orderDetails: prev.data.orderDetails.map(
                                (order, idx) =>
                                  idx === 0
                                    ? {
                                        ...order,
                                        orderTerms: {
                                          ...(order.orderTerms &&
                                          typeof order.orderTerms === "object"
                                            ? order.orderTerms
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
                                      }
                                    : order
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
                      calculatedData?.cartValue?.cashDiscountValue ||
                      orderDetails?.data?.orderDetails?.[0]
                        ?.cashdiscountValue ||
                      cashDiscountTerms?.cashdiscountValue ||
                      (orderDetails?.data?.orderDetails?.[0]?.orderTerms &&
                      typeof orderDetails.data.orderDetails[0].orderTerms ===
                        "object" &&
                      "cashdiscountValue" in
                        orderDetails.data.orderDetails[0].orderTerms
                        ? (
                            orderDetails.data.orderDetails[0].orderTerms as {
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
                    isOrder={true}
                    isQuoteToOrder={false}
                    cashdiscount={cashDiscountApplied}
                  />
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

      {/* Versions Dialog */}
      <VersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        versions={orderVersions}
        orderId={orderId}
        loading={loading}
        currentVersionNumber={selectedVersion?.versionNumber || 1}
        onVersionSelect={handleVersionSelect}
      />

      {/* Place Order Confirmation Dialog */}
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
              {t("placeOrderDialogTitle")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t("placeOrderDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={saving}
            >
              {tDetails("cancel")}
            </Button>
            <Button
              variant="default"
              onClick={confirmPlaceOrder}
              disabled={saving}
            >
              {tDetails("yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ApplicationLayout>
  );
}
