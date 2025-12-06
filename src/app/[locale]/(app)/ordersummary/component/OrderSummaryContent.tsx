"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { forEach, isEmpty, some, words } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

// Hooks
import useCurrencyFactor from "@/hooks/summary/useCurrencyFactor";
import useSummaryDefault from "@/hooks/summary/useSummaryDefault";
import useSummarySubmission from "@/hooks/summary/useSummarySubmission";
import { useCart } from "@/hooks/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import useModuleSettings from "@/hooks/useModuleSettings";
import useUser from "@/hooks/useUser";

// Components
import { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
import { ApplicationLayout, PageLayout } from "@/components/layout";
import {
  OrderContactDetails,
  OrderPriceDetails,
  OrderProductsTable,
  OrderTermsCard,
  SalesHeader,
} from "@/components/sales";
import CashDiscountCard from "@/components/sales/CashDiscountCard";
import ApplyVolumeDiscountBtn from "@/components/summary/ApplyVolumeDiscountBtn";
import Attachments from "@/components/summary/Attachments";

// Utils
import { useCalculation } from "@/hooks/useCalculation/useCalculation";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { BuyerOrderSummaryValidations } from "@/utils/summary/validation";

// Constants
const NEGATIVE_VALUE_MSG = "Some products have negative prices";

/**
 * Scroll to error field helper
 */
export const scrollToErrorField = (path: string) => {
  const element = document.getElementById(path);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

/**
 * Order Summary Page Component
 * Re-implemented based on QuoteSummaryContent.tsx
 * Adapted for order placement functionality
 */
export default function OrderSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams?.get("sellerId");
  const { user } = useCurrentUser();
  const { companydata } = useUser();
  const { emptyCart, emptyCartBySeller } = useCart();
  const { quoteSettings } = useModuleSettings(user);
  const { hideLoading } = useGlobalLoader();

  const isSummary = true;
  const isOrder = true; // This is an order summary page
  const { initialValues, isLoading } = useSummaryDefault(isOrder, isSummary);

  // Form management - use useForm directly (not useSummaryForm wrapper)
  const methods = useForm({
    defaultValues: { ...initialValues, loading: true },
    resolver: yupResolver(BuyerOrderSummaryValidations) as any,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    watch,
    getValues,
    reset,
    setValue,
    handleSubmit,
    formState,
    trigger,
  } = methods;

  // Watch specific fields that need to trigger re-renders
  const watchedProducts = watch("products");
  const products = useMemo(
    () => (watchedProducts as any[]) || [],
    [watchedProducts]
  );
  const uploading = (watch("uploading" as any) as boolean) || false;

  // Check if critical data is loaded - show UI even if some non-critical loading states are pending
  const hasCriticalData = useMemo(() => {
    return products && products.length > 0 && initialValues?.cartValue;
  }, [products, initialValues?.cartValue]);

  // Use more lenient loading check - only show loader if critical data is not available

  // Hide global navigation loader when critical data is available
  useEffect(() => {
    if (hasCriticalData) {
      // Hide navigation loader if it's still showing
      hideLoading("navigation");
      hideLoading("navigation-manual");
    }
  }, [hasCriticalData, hideLoading]);

  // Get calculation hook for recalculating cart values when products change
  const { globalCalc } = useCalculation();

  // Refs to prevent infinite loops during recalculation and form reset
  const isRecalculatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousInitialValuesRef = useRef<string>("");

  const userId = (companydata as any)?.userId;
  const companyId = (companydata as any)?.companyId;
  const companyName = (companydata as any)?.companyName;

  const [orderName, setOrderName] = useState(
    companyName ? words(companyName)[0] + "'s Order" : "Order"
  );

  // State for edit name dialog
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);

  const { CurrencyFactor } = useCurrencyFactor(user?.companyId);

  // Get currency factor value
  let currencyFactorValue: number = 1;
  if (CurrencyFactor !== undefined && CurrencyFactor !== null) {
    if (typeof CurrencyFactor === "number") {
      currencyFactorValue = CurrencyFactor;
    } else if (
      typeof CurrencyFactor === "object" &&
      "currencyFactor" in CurrencyFactor
    ) {
      currencyFactorValue =
        typeof (CurrencyFactor as any).currencyFactor === "number"
          ? (CurrencyFactor as any).currencyFactor
          : 1;
    }
  }

  // Use summary submission hook for order placement
  const { submitOrder, isSubmitting } = useSummarySubmission(
    true, // isOrder
    getValues,
    trigger,
    userId,
    companyId,
    currencyFactorValue
  );

  // Reset form when initial values are loaded (only once when loading completes or critical data is available)
  useEffect(() => {
    if ((!isLoading || hasCriticalData) && !hasInitializedRef.current) {
      // Create a stable key from initialValues to detect actual changes
      const initialValuesKey = JSON.stringify({
        productsCount: initialValues?.products?.length || 0,
        cartValueTotal: initialValues?.cartValue?.grandTotal || 0,
      });

      // Only reset if initialValues actually changed or this is the first load
      if (
        initialValuesKey !== previousInitialValuesRef.current ||
        !hasInitializedRef.current
      ) {
        reset({
          ...initialValues,
          loading: false,
        });
        setOrderName(
          companyName ? words(companyName)[0] + "'s Order" : "Order"
        );
        previousInitialValuesRef.current = initialValuesKey;
        hasInitializedRef.current = true;
      }
    }
  }, [isLoading, hasCriticalData, initialValues, reset, companyName]);

  // Update isInter based on billing and warehouse address states
  // Reference: buyer-fe useTaxBreakup.js line 40 - setBillingAddress?.state !== warehouse?.addressId?.state
  useEffect(() => {
    const billingAddress = (watch("setBillingAddress" as any) as any) || null;
    const warehouseAddress =
      (watch("setWarehouseAddress" as any) as any) || null;

    if (billingAddress && warehouseAddress) {
      // Check both possible structures: billingAddress.state or billingAddress.addressId?.state
      const billingState =
        billingAddress?.state || (billingAddress as any)?.addressId?.state;
      // Check both possible structures: warehouseAddress.addressId?.state or warehouseAddress.state
      const warehouseState =
        warehouseAddress?.addressId?.state || (warehouseAddress as any)?.state;

      if (billingState && warehouseState) {
        const newIsInter = billingState !== warehouseState;
        const currentIsInter = getValues("isInter") as boolean;

        // Only update if the value has changed to avoid unnecessary recalculations
        if (currentIsInter !== newIsInter) {
          setValue("isInter", newIsInter, { shouldDirty: false });

          // Recalculate cart when isInter changes to ensure correct tax calculation
          // This ensures tax is calculated with the correct isInter value (IGST vs SGST/CGST)
          if (
            globalCalc &&
            !isRecalculatingRef.current &&
            products.length > 0
          ) {
            isRecalculatingRef.current = true;
            try {
              const preferences =
                (getValues("preferences" as any) as any) || {};
              const taxExempted =
                (getValues("taxExempted") as boolean) || false;
              const insuranceCharges = Number(
                preferences?.insuranceId?.insuranceValue || 0
              );
              const isBeforeTax = preferences?.freightId?.beforeTax || false;

              const calculationResult = globalCalc({
                products,
                isInter: newIsInter, // Use the new isInter value
                taxExemption: taxExempted,
                insuranceCharges,
                precision: 2,
                Settings: {
                  roundingAdjustment:
                    quoteSettings?.roundingAdjustment || false,
                  itemWiseShippingTax: false,
                },
                isSeller: false,
                overallShipping:
                  (getValues("overallShipping" as any) as number) || 0,
                isBeforeTax,
              });

              if (calculationResult?.cartValue) {
                setValue("cartValue" as any, calculationResult.cartValue, {
                  shouldDirty: false,
                });
              }
              if (
                calculationResult?.products &&
                calculationResult.products.length > 0
              ) {
                setValue("products", calculationResult.products, {
                  shouldDirty: false,
                });
              }
              if (calculationResult?.breakup) {
                setValue("getBreakup" as any, calculationResult.breakup, {
                  shouldDirty: false,
                });
              }
            } catch (error) {
              console.error(
                "Error recalculating cart after isInter change:",
                error
              );
            } finally {
              isRecalculatingRef.current = false;
            }
          }
        }
      }
    }
  }, [watch, setValue, getValues, globalCalc, products, quoteSettings]);

  // Handle form validation errors
  useEffect(() => {
    if (!isEmpty(formState.errors)) {
      if (formState.errors.customerRequiredDate) {
        scrollToErrorField("endCustomerInfo");
        toast.error("Provide Required Delivery Date");
        return;
      }
      if (formState.errors.buyerReferenceNumber) {
        scrollToErrorField("endCustomerInfo");
        toast.error(
          (formState.errors.buyerReferenceNumber?.message as string) ||
            "Invalid reference number"
        );
        return;
      }
      if (formState.errors.products) {
        forEach(formState.errors.products, (item, i) => {
          if (item) {
            Object.values(item).forEach((value, index) => {
              if (index === 0) {
                const products = (getValues("products") as any[]) || [];
                const productIndex =
                  typeof i === "number" ? i : parseInt(String(i), 10);
                toast.error(
                  `${(value as any)?.message} for ${
                    products[productIndex]?.brandProductId || "product"
                  }`
                );
              }
            });
          }
        });
        return;
      }
      if (formState.errors) {
        toast.error("Provide Required Fields");
        return;
      }
    }
  }, [formState.errors, getValues]);

  /**
   * Check for errors before submission
   */
  function checkError() {
    let isError = false;
    if (uploading) {
      toast.error("Document upload is in progress, please wait");
      isError = true;
    }
    if (some(getValues("products"), (item: any) => item.totalPrice < 0)) {
      toast.info(NEGATIVE_VALUE_MSG);
      isError = true;
    }
    if (getValues("products") && getValues("products").length === 0) {
      toast.info("Add line items to place order");
      isError = true;
    }
    if (
      isEmpty(getValues("setShippingAddress")) ||
      isEmpty(getValues("setBillingAddress"))
    ) {
      toast.error("address is not available");
      isError = true;
    }

    return isError;
  }

  /**
   * Handle order placement
   */
  const handlePlaceOrder = async () => {
    // Set order name in form
    setValue("orderName" as any, orderName);

    // Trigger validation on all form fields
    const isValid = await trigger();

    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return;
    }

    // Final XSS safety check
    const comment = (getValues("comment") as string | null) || "";
    const buyerRef = (getValues("buyerReferenceNumber") as string | null) || "";

    if (comment && containsXSS(comment)) {
      toast.error("Invalid content detected in comments");
      return;
    }

    if (buyerRef && containsXSS(buyerRef)) {
      toast.error("Invalid content detected in reference number");
      return;
    }

    if (checkError()) {
      return;
    }

    try {
      // Validate required IDs before proceeding
      if (!userId || !companyId) {
        toast.error(
          "User or company information is missing. Please refresh the page."
        );
        return;
      }

      // Submit order using the hook
      const orderIdentifier = await submitOrder();

      if (orderIdentifier) {
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("cartComment");
          localStorage.removeItem("cartAttachments");
          localStorage.removeItem("paymentDetails");
        }

        // Get the selected seller ID from the form values
        const selectedSellerId = getValues("selectedSellerId" as any) as
          | string
          | number
          | null;

        if (selectedSellerId) {
          emptyCartBySeller(selectedSellerId);
        } else {
          emptyCart();
        }

        router.push("/landing/orderslanding");
        toast.success("Order placed successfully");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error?.message || "Failed to place order. Please try again.");
    }
  };

  // Handler for saving order name from dialog
  const handleSaveOrderName = async (newOrderName: string) => {
    // Update local state - no API call needed since order isn't placed yet
    setOrderName(newOrderName);
    // Also update in form for when order is placed
    setValue("orderName" as any, newOrderName);
  };

  // Get watched values for cash discount - match reference implementation
  const preferences = (watch("preferences" as any) as any) || {};
  const paymentTermsId = preferences?.paymentTermsId;
  const cashDiscountTerm = preferences?.cashDiscountTerm;
  // Watch cashdiscount directly like reference implementation
  const cashdiscount = watch("cashdiscount" as any) as boolean;

  const cashDiscountValue =
    paymentTermsId?.cashdiscountValue ||
    cashDiscountTerm?.cashdiscountValue ||
    0;

  // Match reference implementation: just watch cashdiscount directly
  const isCashDiscountApplied = Boolean(cashdiscount);

  const isDefaultCashDiscountEnabled = Boolean(
    paymentTermsId?.cashdiscountValue
  );
  const { latestPaymentTerms, latestPaymentTermsLoading } =
    useGetLatestPaymentTerms(!isDefaultCashDiscountEnabled);

  // Cash discount handlers - implemented directly to trigger recalculation
  const handleCDApply = (
    cashDiscountValue: number,
    islatestTermAvailable: boolean,
    latestpaymentTerms?: any
  ) => {
    if (isRecalculatingRef.current || !globalCalc) {
      return; // Prevent re-entrancy
    }

    isRecalculatingRef.current = true;

    try {
      // Get current products
      const currentProducts = getValues("products") || [];

      // Apply cash discount to products synchronously
      // IMPORTANT: Preserve all tax-related fields (hsnDetails, taxBreakup, etc.)
      const updatedProducts = currentProducts.map((item: any) => {
        const product = { ...item };
        if (!product.originalUnitPrice) {
          product.originalUnitPrice = product.unitPrice;
        }
        product.cashdiscountValue = cashDiscountValue ? cashDiscountValue : 0;
        // Ensure tax-related fields are preserved for recalculation
        return product;
      });

      // Update payment terms if needed
      if (islatestTermAvailable && latestpaymentTerms) {
        setValue("preferences.paymentTermsId", latestpaymentTerms);
      }
      setValue("cashdiscount" as any, true);

      // Get calculation parameters
      const preferences = (getValues("preferences" as any) as any) || {};
      const isInter = (getValues("isInter") as boolean) || false;
      const taxExempted = (getValues("taxExempted") as boolean) || false;
      const insuranceCharges = Number(
        preferences?.insuranceId?.insuranceValue || 0
      );
      const isBeforeTax = preferences?.freightId?.beforeTax || false;

      // Recalculate to apply cash discount to unit prices and cart values
      const calculationResult = globalCalc({
        products: updatedProducts,
        isInter,
        taxExemption: taxExempted,
        insuranceCharges,
        precision: 2,
        Settings: {
          roundingAdjustment: quoteSettings?.roundingAdjustment || false,
          itemWiseShippingTax: false,
        },
        isSeller: false,
        overallShipping: (getValues("overallShipping" as any) as number) || 0,
        isBeforeTax,
      });

      // Update cart value with recalculated values
      if (calculationResult?.cartValue) {
        // Calculate totalTax from products to ensure accuracy
        let totalTax = calculationResult.cartValue.totalTax ?? 0;

        // If totalTax is 0 or missing, calculate from products
        if (
          totalTax === 0 &&
          calculationResult.products &&
          calculationResult.products.length > 0
        ) {
          totalTax = calculationResult.products.reduce(
            (sum: number, product: any) => {
              return sum + (product.totalTax || 0);
            },
            0
          );
        }

        // Set entire cartValue object
        const updatedCartValue = {
          ...calculationResult.cartValue,
          totalTax: totalTax,
        };
        setValue("cartValue" as any, updatedCartValue, { shouldDirty: false });
      }

      // Update products with recalculated values, preserving important original fields
      if (
        calculationResult?.products &&
        calculationResult.products.length > 0
      ) {
        const finalProducts = calculationResult.products.map(
          (calculatedProduct: any) => {
            // Find the corresponding product from updatedProducts to preserve original fields
            const calculatedProductId =
              calculatedProduct.brandProductId ||
              calculatedProduct.itemCode ||
              calculatedProduct.orderIdentifier ||
              calculatedProduct.productId ||
              "";

            const originalProduct = updatedProducts.find((p: any) => {
              const pId =
                p.brandProductId ||
                p.itemCode ||
                p.orderIdentifier ||
                p.productId ||
                "";
              return String(pId) === String(calculatedProductId);
            });

            if (originalProduct) {
              // Preserve important original fields while using calculated values
              return {
                ...originalProduct, // Start with original product to preserve all fields
                ...calculatedProduct, // Override with calculated values
                // Preserve quantity fields
                quantity:
                  originalProduct.quantity || calculatedProduct.quantity,
                askedQuantity:
                  originalProduct.askedQuantity ||
                  calculatedProduct.askedQuantity,
                unitQuantity:
                  originalProduct.unitQuantity ||
                  calculatedProduct.unitQuantity,
                // Preserve original identifiers and metadata
                brandProductId:
                  originalProduct.brandProductId ||
                  calculatedProduct.brandProductId,
                itemCode:
                  originalProduct.itemCode || calculatedProduct.itemCode,
                orderIdentifier:
                  originalProduct.orderIdentifier ||
                  calculatedProduct.orderIdentifier,
                productId:
                  originalProduct.productId || calculatedProduct.productId,
                itemNo: originalProduct.itemNo || calculatedProduct.itemNo,
                // Preserve display fields
                productShortDescription:
                  originalProduct.productShortDescription ||
                  calculatedProduct.productShortDescription,
                itemName:
                  originalProduct.itemName || calculatedProduct.itemName,
              };
            }
            return calculatedProduct;
          }
        );

        setValue("products", finalProducts, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, {
          shouldDirty: false,
        });
      }

      // Show success message
      if (islatestTermAvailable && latestpaymentTerms) {
        toast.success("Payment terms updated with cash discount successfully");
      } else {
        toast.success("Cash discount applied successfully");
      }
    } catch (error) {
      console.error("Error applying cash discount:", error);
      toast.error("Failed to apply cash discount");
    } finally {
      isRecalculatingRef.current = false;
    }
  };

  const handleRemoveCD = (prevTerms?: any) => {
    if (isRecalculatingRef.current || !globalCalc) {
      return; // Prevent re-entrancy
    }

    isRecalculatingRef.current = true;

    try {
      // Get current products
      const currentProducts = getValues("products") || [];

      // Remove cash discount from products
      // IMPORTANT: Preserve all tax-related fields (hsnDetails, taxBreakup, etc.)
      const updatedProducts = currentProducts.map((item: any) => {
        const product = { ...item };
        product.cashdiscountValue = 0;
        // Ensure tax-related fields are preserved for recalculation
        return product;
      });

      setValue("cashdiscount" as any, false);
      if (prevTerms) {
        setValue("preferences.paymentTermsId", prevTerms);
      }

      // Get calculation parameters
      const preferences = (getValues("preferences" as any) as any) || {};
      const isInter = (getValues("isInter") as boolean) || false;
      const taxExempted = (getValues("taxExempted") as boolean) || false;
      const insuranceCharges = Number(
        preferences?.insuranceId?.insuranceValue || 0
      );
      const isBeforeTax = preferences?.freightId?.beforeTax || false;

      // Recalculate to remove cash discount from unit prices and cart values
      const calculationResult = globalCalc({
        products: updatedProducts,
        isInter,
        taxExemption: taxExempted,
        insuranceCharges,
        precision: 2,
        Settings: {
          roundingAdjustment: quoteSettings?.roundingAdjustment || false,
          itemWiseShippingTax: false,
        },
        isSeller: false,
        overallShipping: (getValues("overallShipping" as any) as number) || 0,
        isBeforeTax,
      });

      // Update cart value with recalculated values
      if (calculationResult?.cartValue) {
        // Calculate totalTax from products to ensure accuracy
        let totalTax = calculationResult.cartValue.totalTax ?? 0;

        // If totalTax is 0 or missing, calculate from products
        if (
          totalTax === 0 &&
          calculationResult.products &&
          calculationResult.products.length > 0
        ) {
          totalTax = calculationResult.products.reduce(
            (sum: number, product: any) => {
              return sum + (product.totalTax || 0);
            },
            0
          );
        }

        // Set entire cartValue object
        const updatedCartValue = {
          ...calculationResult.cartValue,
          totalTax: totalTax,
        };
        setValue("cartValue" as any, updatedCartValue, { shouldDirty: false });
      }

      // Update products with recalculated values (unitPrice will have cash discount removed)
      if (
        calculationResult?.products &&
        calculationResult.products.length > 0
      ) {
        setValue("products", calculationResult.products, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, {
          shouldDirty: false,
        });
      }

      // Show success message
      toast.success("Payment terms removed with cash discount successfully");
    } catch (error) {
      console.error("Error removing cash discount:", error);
      toast.error("Failed to remove cash discount");
    } finally {
      isRecalculatingRef.current = false;
    }
  };

  // Handle quantity change - recalculate synchronously like reference implementation
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (isRecalculatingRef.current || !globalCalc) {
      return; // Prevent re-entrancy
    }

    isRecalculatingRef.current = true;

    try {
      const currentProducts = getValues("products") || [];

      // Update quantity in products array - match productId using multiple possible fields
      // OrderProductsTable uses: brandProductId || itemCode || orderIdentifier
      const updatedProducts = currentProducts.map((product: any) => {
        const productIdToMatch =
          product.brandProductId ||
          product.itemCode ||
          product.orderIdentifier ||
          product.productId ||
          "";

        if (String(productIdToMatch) === String(productId)) {
          return {
            ...product,
            askedQuantity: quantity,
            quantity: quantity,
            unitQuantity: quantity, // Also update unitQuantity for consistency
          };
        }
        return product;
      });

      // Get calculation parameters
      const preferences = (getValues("preferences" as any) as any) || {};
      const isInter = (getValues("isInter") as boolean) || false;
      const taxExempted = (getValues("taxExempted") as boolean) || false;
      const insuranceCharges = Number(
        preferences?.insuranceId?.insuranceValue || 0
      );
      const isBeforeTax = preferences?.freightId?.beforeTax || false;

      // Recalculate synchronously
      const calculationResult = globalCalc({
        products: updatedProducts,
        isInter,
        taxExemption: taxExempted,
        insuranceCharges,
        precision: 2,
        Settings: {
          roundingAdjustment: quoteSettings?.roundingAdjustment || false,
          itemWiseShippingTax: false,
        },
        isSeller: false,
        overallShipping: (getValues("overallShipping" as any) as number) || 0,
        isBeforeTax,
      });

      // Update all form values at once
      if (calculationResult?.cartValue) {
        setValue("cartValue" as any, calculationResult.cartValue, {
          shouldDirty: false,
        });
      }

      // Update products with calculated values, preserving important original fields
      if (
        calculationResult?.products &&
        calculationResult.products.length > 0
      ) {
        const finalProducts = calculationResult.products.map(
          (calculatedProduct: any) => {
            // Find the corresponding product from updatedProducts to preserve original fields
            const calculatedProductId =
              calculatedProduct.brandProductId ||
              calculatedProduct.itemCode ||
              calculatedProduct.orderIdentifier ||
              calculatedProduct.productId ||
              "";

            const originalProduct = updatedProducts.find((p: any) => {
              const pId =
                p.brandProductId ||
                p.itemCode ||
                p.orderIdentifier ||
                p.productId ||
                "";
              return String(pId) === String(calculatedProductId);
            });

            if (originalProduct) {
              // Preserve important original fields while using calculated values
              return {
                ...originalProduct, // Start with original product to preserve all fields
                ...calculatedProduct, // Override with calculated values
                // Preserve quantity fields from user input
                quantity: originalProduct.quantity,
                askedQuantity: originalProduct.askedQuantity,
                unitQuantity: originalProduct.quantity,
                // Preserve original identifiers and metadata
                brandProductId:
                  originalProduct.brandProductId ||
                  calculatedProduct.brandProductId,
                itemCode:
                  originalProduct.itemCode || calculatedProduct.itemCode,
                orderIdentifier:
                  originalProduct.orderIdentifier ||
                  calculatedProduct.orderIdentifier,
                productId:
                  originalProduct.productId || calculatedProduct.productId,
                itemNo: originalProduct.itemNo || calculatedProduct.itemNo,
                // Preserve display fields
                productShortDescription:
                  originalProduct.productShortDescription ||
                  calculatedProduct.productShortDescription,
                itemName:
                  originalProduct.itemName || calculatedProduct.itemName,
              };
            }
            return calculatedProduct;
          }
        );

        // Use shouldDirty: true to ensure React detects the change and re-renders
        setValue("products", finalProducts, { shouldDirty: true });
      } else {
        // If no calculated products, just update with the quantity change
        setValue("products", updatedProducts, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, {
          shouldDirty: false,
        });
      }
    } catch (error) {
      console.error("Error recalculating cart values:", error);
    } finally {
      isRecalculatingRef.current = false;
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/cart");
  };

  const setSellerAddress = watch("setSellerAddress");
  const sellerCompanyId = (setSellerAddress as any)?.companyId;

  // Watch form values for pricing context (these are reactive and will trigger re-renders)
  const cartValue = (watch("cartValue" as any) as any) || {};
  const isInter = (watch("isInter") as boolean) || false;
  const taxExempted = (watch("taxExempted") as boolean) || false;
  const preferencesForPricing = (watch("preferences" as any) as any) || {};

  // Extract cartValue stringified for dependency array
  const cartValueStringified = JSON.stringify(cartValue);

  // Get pricing context for OrderPriceDetails
  const pricingContext = useMemo(() => {
    const insuranceCharges = Number(
      preferencesForPricing?.insuranceId?.insuranceValue || 0
    );

    return {
      isInter,
      taxExemption: taxExempted,
      insuranceCharges,
      cartValue,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isInter,
    taxExempted,
    preferencesForPricing?.insuranceId?.insuranceValue,
    cartValueStringified,
  ]);

  return (
    <FormProvider {...methods}>
      <ApplicationLayout>
        {/* Sales Header - Fixed at top */}
        <div className="flex-shrink-0  z-50 bg-gray-50">
          <SalesHeader
            title={orderName}
            identifier=""
            buttons={[
              {
                label: "CANCEL",
                variant: "outline" as const,
                onClick: handleCancel,
              },
              {
                label: "PLACE ORDER",
                variant: "default" as const,
                onClick: handleSubmit(handlePlaceOrder, () => {
                  // Handle validation errors
                  toast.error(
                    "Please fix the validation errors before submitting"
                  );
                }),
                disabled: formState.isSubmitting || isSubmitting,
              },
            ]}
            onEdit={() => setIsEditNameDialogOpen(true)}
            showEditIcon={true}
            loading={isLoading}
            hideAppHeader={!!sellerId}
          />
        </div>

        {/* Order Summary Content - Scrollable area */}
        <div className="flex-1 w-full">
          <PageLayout variant="content">
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Left Side - Products Table, Address & Terms - 65% */}
              <div className={sellerId ? "w-full lg:w-[65%] space-y-2 sm:space-y-3 mt-[16px]" : "w-full lg:w-[65%] space-y-2 sm:space-y-3 mt-[80px]"}>
                {/* Products Table */}

                <Suspense fallback={null}>
                  <OrderProductsTable
                    products={products}
                    isEditable={true}
                    onQuantityChange={handleQuantityChange}
                    editedQuantities={{}}
                    showInvoicedQty={false}
                    itemsPerPage={5}
                    loading={isLoading}
                  />
                </Suspense>

                {/* Contact Details and Terms Cards - Side by Side */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">
                  {/* Contact Details Card */}
                  <OrderContactDetails
                    billingAddress={
                      (watch("setBillingAddress" as any) as any) || null
                    }
                    shippingAddress={
                      (watch("setShippingAddress" as any) as any) || null
                    }
                    registerAddress={
                      (watch("setRegisterAddress" as any) as any) || null
                    }
                    sellerAddress={
                      (watch("setSellerAddress" as any) as any) || null
                    }
                    warehouseName={
                      (watch("setWarehouseAddress" as any) as any)
                        ?.wareHouseName || undefined
                    }
                    warehouseAddress={
                      (watch("setWarehouseAddress" as any) as any)?.addressId ||
                      undefined
                    }
                    salesBranch={
                      (watch("setSellerAddress" as any) as any)?.name ||
                      undefined
                    }
                    requiredDate={
                      (watch("customerRequiredDate" as any) as string) ||
                      undefined
                    }
                    referenceNumber={
                      (watch("buyerReferenceNumber" as any) as string) || "-"
                    }
                    isEditable={true}
                    userId={user?.userId?.toString()}
                    buyerBranchId={
                      (watch("setBillingAddress" as any) as any)?.id ||
                      undefined
                    }
                    buyerCompanyId={user?.companyId}
                    productIds={products?.map((p: any) => p.productId) || []}
                    sellerCompanyId={sellerCompanyId}
                    onRequiredDateChange={(date: string) => {
                      setValue("customerRequiredDate" as any, date);
                    }}
                    onReferenceNumberChange={(ref: string) => {
                      setValue("buyerReferenceNumber" as any, ref);
                    }}
                    onBillingAddressChange={(address: any) => {
                      setValue("setBillingAddress" as any, address);
                    }}
                    onShippingAddressChange={(address: any) => {
                      setValue("setShippingAddress" as any, address);
                    }}
                    onSellerBranchChange={(sellerBranch: any) => {
                      if (sellerBranch) {
                        setValue("setSellerAddress" as any, {
                          id: sellerBranch.id,
                          name: sellerBranch.name,
                          branchId: sellerBranch.branchId,
                          companyId: sellerBranch.companyId,
                        });
                      }
                    }}
                    onWarehouseChange={(warehouse: any) => {
                      if (warehouse) {
                        setValue("setWarehouseAddress" as any, {
                          id: warehouse.id,
                          wareHouseName:
                            warehouse.wareHouseName || warehouse.name,
                          name: warehouse.name,
                          addressId: warehouse.addressId,
                          ...(warehouse.wareHousecode && {
                            wareHousecode: warehouse.wareHousecode,
                          }),
                        });

                        // Update deliveryPlace from warehouse city
                        if (warehouse.addressId?.city) {
                          setValue(
                            "deliveryPlace" as any,
                            warehouse.addressId.city
                          );
                        }
                      }
                    }}
                    loading={isLoading}
                  />

                  {/* Terms Card */}
                  <OrderTermsCard
                    orderTerms={{
                      deliveryTerms: preferences?.deliveryTermsId?.description,
                      deliveryTermsCode:
                        preferences?.deliveryTermsId?.deliveryTermsCode,
                      deliveryTermsCode2:
                        (watch("deliveryPlace" as any) as string) || "",
                      paymentTerms: preferences?.paymentTermsId?.description,
                      paymentTermsCode:
                        preferences?.paymentTermsId?.paymentTermsCode,
                      packageForwarding: preferences?.pkgFwdId?.description,
                      packageForwardingCode:
                        preferences?.pkgFwdId?.packageForwardingCode,
                      dispatchInstructions:
                        preferences?.dispatchInstructionsId?.description,
                      dispatchInstructionsCode:
                        preferences?.dispatchInstructionsId
                          ?.dispatchInstructionsCode,
                      freight: preferences?.freightId?.description,
                      freightCode: preferences?.freightId?.freightCode,
                      insurance: preferences?.insuranceId?.description,
                      insuranceCode: preferences?.insuranceId?.insuranceCode,
                      warranty: preferences?.warrantyId?.description,
                      warrantyCode: preferences?.warrantyId?.warrantyCode,
                      additionalTerms:
                        (watch("additionalTerms") as string) || "",
                      loading: isLoading,
                    }}
                  />
                </div>
              </div>

              {/* Right Side - Price Details - 33% */}

              <div className={sellerId ? "w-full lg:w-[33%] mt-[16px]" : "w-full lg:w-[33%] mt-[80px]"}>
                <div className="space-y-4">
                  <ApplyVolumeDiscountBtn
                    uploading={formState.isSubmitting || isSubmitting}
                    isSummary={true}
                  />
                  {/* Show cash discount card if cash discount is enabled in settings */}
                  {quoteSettings?.showCashDiscount && (
                    <div className="-mt-[10px]">
                      <CashDiscountCard
                        handleCDApply={handleCDApply}
                        handleRemoveCD={handleRemoveCD}
                        {...(latestPaymentTerms && {
                          latestpaymentTerms: latestPaymentTerms,
                        })}
                        isCashDiscountApplied={isCashDiscountApplied}
                        isSummaryPage={true}
                        cashDiscountValue={cashDiscountValue}
                        islatestTermAvailable={
                          !!latestPaymentTerms && !latestPaymentTermsLoading
                        }
                        prevPaymentTerms={paymentTermsId}
                        isOrder={true}
                      />
                    </div>
                  )}

                  <Suspense fallback={null}>
                    <OrderPriceDetails
                      products={products}
                      isInter={pricingContext.isInter}
                      insuranceCharges={pricingContext.insuranceCharges}
                      precision={2}
                      Settings={{
                        roundingAdjustment: true,
                      }}
                      isSeller={false}
                      taxExemption={pricingContext.taxExemption}
                      currency={
                        (watch("currency" as any) as any)?.symbol || "INR ₹"
                      }
                      overallShipping={
                        (watch("overallShipping" as any) as number) || 0
                      }
                      overallTax={pricingContext.cartValue?.totalTax || 0}
                      calculatedTotal={
                        pricingContext.cartValue?.calculatedTotal ||
                        pricingContext.cartValue?.grandTotal ||
                        0
                      }
                      subTotal={pricingContext.cartValue?.totalValue || 0}
                      taxableAmount={
                        pricingContext.cartValue?.taxableAmount || 0
                      }
                      totalCashDiscount={
                        pricingContext.cartValue?.totalCashDiscount
                      }
                      cashDiscountValue={
                        pricingContext.cartValue?.cashDiscountValue
                      }
                      hidePfRate={true}
                      loading={isLoading}
                    />
                  </Suspense>

                  {/* Attachments - Comments and File Uploads */}
                  <Attachments
                    showHeader={true}
                    showAttachments={true}
                    editAttachments={true}
                    showComments={true}
                    editComments={true}
                    fieldName="uploadedDocumentDetails"
                    folderName="Order"
                    isContentPage={false}
                    isOrder={true}
                    readOnly={false}
                  />
                </div>
              </div>
            </div>
          </PageLayout>
        </div>

        {/* Edit Order Name Dialog */}
        <EditOrderNameDialog
          open={isEditNameDialogOpen}
          onOpenChange={setIsEditNameDialogOpen}
          currentOrderName={orderName}
          onSave={handleSaveOrderName}
          loading={isLoading}
          title="Edit Order Name"
          label="Order Name"
          placeholder="Enter order name"
          successMessage="Order name updated successfully"
          errorMessage="Failed to update order name"
        />
      </ApplicationLayout>
    </FormProvider>
  );
}
