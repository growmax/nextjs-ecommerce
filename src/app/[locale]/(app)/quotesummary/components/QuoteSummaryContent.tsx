"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { addDays } from "date-fns";
import { forEach, isEmpty, map, some, words } from "lodash";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

// Hooks
import useCurrencyFactor from "@/hooks/summary/useCurrencyFactor";
import useGetChannel from "@/hooks/summary/useGetChannel";
import useGetDivision from "@/hooks/summary/useGetDivision";
import useSummaryDefault from "@/hooks/summary/useSummaryDefault";
import useAccessControl from "@/hooks/useAccessControl";
import { useCart } from "@/hooks/useCart";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import useModuleSettings from "@/hooks/useModuleSettings";
import useUser from "@/hooks/useUser";

// Components
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
import ApplyVolumeDiscountBtn from "@/components/summary/ApplyVolumeDiscountBtn";
import Attachments from "@/components/summary/Attachments";
import SPRForm from "@/components/summary/SPRForm";
import SummaryNameCard from "@/components/summary/SummaryNameCard";
import TargetDiscountCard from "@/components/summary/TargetDiscountCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

// Utils
import { useCalculation } from "@/hooks/useCalculation/useCalculation";
import { formBundleProductsPayload, QuoteSubmissionService } from "@/lib/api";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { summaryReqDTO } from "@/utils/summary/summaryReqDTO";
import { BuyerQuoteSummaryValidations } from "@/utils/summary/validation";

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
 * Quote Summary Page Component
 * Re-implemented based on buyer-fe/src/components/Summary/QuoteSummary/QuoteSummary.js
 * Uses UI structure from QuoteDetailsClient for consistency
 */
export default function QuoteSummaryContent() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { companydata } = useUser();
  const { emptyCart, emptyCartBySeller } = useCart();
  const { quoteSettings } = useModuleSettings(user);
  const { hasQuotePermission } = useAccessControl();

  const isSummary = true;
  const isOrder = false; // This is a quote summary page, not an order
  const { initialValues, isLoading } = useSummaryDefault(isOrder, isSummary);
  // Form management - use useForm directly (not useSummaryForm wrapper)
  const methods = useForm({
    defaultValues: { ...initialValues, loading: true },
    resolver: yupResolver(BuyerQuoteSummaryValidations) as any,
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
  const products = useMemo(() => (watchedProducts as any[]) || [], [watchedProducts]);
  const sprEnabled = ((watch("sprDetails" as any) as any)?.spr) || false;
  const uploading = (watch("uploading" as any) as boolean) || false;

  // Get calculation hook for recalculating cart values when products change
  const { globalCalc } = useCalculation();
  
  // Refs to prevent infinite loops during recalculation and form reset
  const isRecalculatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const previousInitialValuesRef = useRef<string>("");

  const userId = (companydata as any)?.userId;
  const companyId = (companydata as any)?.companyId;
  const companyName = (companydata as any)?.companyName;
  const userData = (companydata as any)?.userData || (companydata as any);
  const currency = (companydata as any)?.currency || user?.currency;

  const [quoteName, setQuoteName] = useState(
    companyName ? words(companyName)[0] + "'s Quote" : "Quote"
  );
  const [openCreateRfqConfirmationDialog, setOpenCreateRfqConfirmationDialog] =
    useState(false);

  const { division } = useGetDivision(products);
  const { channel } = useGetChannel();
  const { CurrencyFactor } = useCurrencyFactor(user?.companyId);
  const { quoteValidity } = quoteSettings || {};

  const { isMinQuoteValueEnabled } = quoteSettings || {};
  const { minimumQuoteValue } = useGetCurrencyModuleSettings(
    user || {},
    isMinQuoteValueEnabled,
    currency || {}
  );

  // Reset form when initial values are loaded (only once when loading completes)
  useEffect(() => {
    if (!isLoading && !hasInitializedRef.current) {
      // Create a stable key from initialValues to detect actual changes
      const initialValuesKey = JSON.stringify({
        productsCount: initialValues?.products?.length || 0,
        cartValueTotal: initialValues?.cartValue?.grandTotal || 0,
      });

      // Only reset if initialValues actually changed or this is the first load
      if (initialValuesKey !== previousInitialValuesRef.current || !hasInitializedRef.current) {
        reset({
          ...initialValues,
          loading: false,
        });
        setQuoteName(companyName ? words(companyName)[0] + "'s Quote" : "Quote");
        previousInitialValuesRef.current = initialValuesKey;
        hasInitializedRef.current = true;
      }
    }
  }, [isLoading, initialValues, reset, companyName]);

  // Trigger validation when SPR status changes
  useEffect(() => {
    if (sprEnabled !== undefined) {
      trigger("sprDetails");
    }
  }, [sprEnabled, trigger]);

  // Update isInter based on billing and warehouse address states
  // Reference: buyer-fe useTaxBreakup.js line 40 - setBillingAddress?.state !== warehouse?.addressId?.state
  // Reference: buyer-fe SummaryBody.js line 154 - setValue("isInter", taxResutls.inter)
  useEffect(() => {
    const billingAddress = (watch("setBillingAddress" as any) as any) || null;
    const warehouseAddress = (watch("setWarehouseAddress" as any) as any) || null;

    if (billingAddress && warehouseAddress) {
      // Check both possible structures: billingAddress.state or billingAddress.addressId?.state
      const billingState = billingAddress?.state || (billingAddress as any)?.addressId?.state;
      // Check both possible structures: warehouseAddress.addressId?.state or warehouseAddress.state
      const warehouseState = warehouseAddress?.addressId?.state || (warehouseAddress as any)?.state;
      
      if (billingState && warehouseState) {
        const newIsInter = billingState !== warehouseState;
        const currentIsInter = getValues("isInter") as boolean;
        
        // Only update if the value has changed to avoid unnecessary recalculations
        if (currentIsInter !== newIsInter) {
          setValue("isInter", newIsInter, { shouldDirty: false });
          
          // Recalculate cart when isInter changes to ensure correct tax calculation
          // This ensures tax is calculated with the correct isInter value (IGST vs SGST/CGST)
          if (globalCalc && !isRecalculatingRef.current && products.length > 0) {
            isRecalculatingRef.current = true;
            try {
              const preferences = (getValues("preferences" as any) as any) || {};
              const taxExempted = (getValues("taxExempted") as boolean) || false;
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
                  roundingAdjustment: quoteSettings?.roundingAdjustment || false,
                  itemWiseShippingTax: false,
                },
                isSeller: false,
                overallShipping: (getValues("overallShipping" as any) as number) || 0,
                isBeforeTax,
              });

              if (calculationResult?.cartValue) {
                setValue("cartValue" as any, calculationResult.cartValue, { shouldDirty: false });
              }
              if (calculationResult?.products && calculationResult.products.length > 0) {
                setValue("products", calculationResult.products, { shouldDirty: false });
              }
              if (calculationResult?.breakup) {
                setValue("getBreakup" as any, calculationResult.breakup, { shouldDirty: false });
              }
            } catch (error) {
              console.error("Error recalculating cart after isInter change:", error);
            } finally {
              isRecalculatingRef.current = false;
            }
          }
        }
      }
    }
  }, [
    watch,
    setValue,
    getValues,
    globalCalc,
    products,
    quoteSettings,
  ]);

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
                const productIndex = typeof i === "number" ? i : parseInt(String(i), 10);
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
   * Prepare quote submission body
   */
  function getbody() {
    // Use companyId from component scope (from companydata) to ensure consistency
    // Fallback to form value if component scope companyId is not available
    const companyId = (companydata as any)?.companyId || getValues("companyId");
    const authData = {
      companyName: companyName,
      displayName: userData?.displayName,
    };
    const taxExempted = (getValues("taxExempted") as boolean) || false;
    const taxExemptionId = (getValues("taxExemptionId" as any) as any);
    const setSellerAddress = (getValues("setSellerAddress" as any) as any);
    const setShippingAddress = (getValues("setShippingAddress" as any) as any);
    const setBillingAddress = (getValues("setBillingAddress" as any) as any);
    const setRegisterAddress = (getValues("setRegisterAddress" as any) as any);
    const setWarehouseAddress = (getValues("setWarehouseAddress" as any) as any);
    const cartValue = (getValues("cartValue" as any) as any);
    const cashdiscount = (getValues("cashdiscount" as any) as boolean);
    const preferences = (getValues("preferences" as any) as any);
    const pfRate = (getValues("pfRate" as any) as number);
    let products = (getValues("products") as any[]);
    const additionalTerms = (getValues("additionalTerms") as string) || "";
    const buyerReferenceNumber = (getValues("buyerReferenceNumber") as string | null) || null;
    const customerRequiredDate = (getValues("customerRequiredDate") as string | null) || "";
    const VDDetails = (getValues("VDDetails" as any) as any) || {};
    const uploadedDocumentDetails = (getValues("uploadedDocumentDetails" as any) as any);
    const comment = (getValues("comment") as string);
    const sprDetails = (getValues("sprDetails" as any) as any);
    const isSPRRequested = (getValues("isSPRRequested" as any) as boolean);
    const branchBusinessUnit = (getValues("branchBusinessUnit" as any) as any);
    const isInter = (getValues("isInter") as boolean);
    const deliveryPlace = (getValues("deliveryPlace" as any) as string);
    
    // Map products - use spread operator like reference implementation, then override specific fields
    products = map(products, (prod: any) => {
      return {
        ...prod,
        unitListPrice:
          !prod.showPrice || prod.priceNotAvailable
            ? prod.unitLPRp
            : prod.unitListPrice,
        accountOwnerId: prod.accountOwnerId
          ? typeof prod.accountOwnerId === "object"
            ? parseInt(prod.accountOwnerId.id)
            : parseInt(prod.accountOwnerId)
          : null,
        businessUnitId: prod.businessUnit
          ? typeof prod.businessUnit === "object"
            ? prod.businessUnit.id
            : prod.businessUnit
          : null,
        cashdiscountValue: prod?.cashdiscountValue ? prod?.cashdiscountValue : 0,
        reqDeliveryDate: customerRequiredDate ? customerRequiredDate : null,
        divisionId: prod.division
          ? typeof prod.division === "object"
            ? parseInt(prod.division.id)
            : parseInt(prod.division)
          : null,
        lineNo: null,
        itemNo: null,
        pfPercentage:
          preferences?.pkgFwdId?.pfPercentage || pfRate ? pfRate : null,
        pfValue: preferences?.pkgFwdId?.pfValue || pfRate ? pfRate : null,
        shipToBranchName: setShippingAddress?.branchName,
        shipToCode: setShippingAddress?.shipToCode,
        orderWareHouseId: setWarehouseAddress?.id,
        orderWareHouseName: setWarehouseAddress?.wareHouseName,
        productTaxes: isInter ? prod.interTaxBreakup : prod.intraTaxBreakup,
        bundleProducts:
          prod?.bundleProducts?.length > 0
            ? formBundleProductsPayload(prod.bundleProducts)
            : [],
        showPrice: prod?.showPrice && !prod?.priceNotAvailable,
      };
    });

    const taxExemptionMessage = taxExemptionId && typeof taxExemptionId === "object" && "taxExemptName" in taxExemptionId
      ? (taxExemptionId as any).taxExemptName
      : "";

    return {
      additionalTerms,
      companyId,
      authData,
      setSellerAddress,
      setShippingAddress,
      setBillingAddress,
      setRegisterAddress,
      cartValue,
      preferences,
      pfRate,
      products,
      buyerReferenceNumber,
      customerRequiredDate,
      VDDetails,
      uploadedDocumentDetails,
      division,
      channel,
      taxExempted,
      taxExemptionMessage,
      comment,
      sprDetails,
      isSPRRequested,
      branchBusinessUnit,
      deliveryPlace,
      quoteSettings,
      cashdiscount,
    };
  }
 
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

    if (isMinQuoteValueEnabled && minimumQuoteValue !== undefined) {
      const values = getValues();
      const cartValue = (values as any)?.cartValue;
      if (minimumQuoteValue > (cartValue?.grandTotal || 0)) {
        toast.info(
          `Minimum quote value ${getAccounting(
            currency || {},
            minimumQuoteValue,
            (values as any)?.currency || currency || {}
          )}`
        );
        isError = true;
      }
    }
    if (getValues("products") && getValues("products").length === 0) {
      toast.info("Add line items to create a new version");
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
   * Request quote confirmation dialog handler
   */
  const requestQuoteConfirmationDialog = async (): Promise<boolean> => {
    if (some((getValues("products") as any[]), (item: any) => item.totalPrice < 0)) {
      toast.info(NEGATIVE_VALUE_MSG);
      return false;
    }

    // Trigger validation on all form fields
    const isValid = await trigger();

    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return false;
    }

    // Final XSS safety check
    const finalXSSCheck = () => {
      const comment = (getValues("comment") as string | null) || "";
      const buyerRef = (getValues("buyerReferenceNumber") as string | null) || "";
      const sprDetails = (getValues("sprDetails" as any) as any);

      if (comment && containsXSS(comment)) {
        toast.error("Invalid content detected in comments");
        return true;
      }

      if (buyerRef && containsXSS(buyerRef)) {
        toast.error("Invalid content detected in reference number");
        return true;
      }

      if (sprDetails?.spr) {
        if (sprDetails.companyName && containsXSS(sprDetails.companyName)) {
          toast.error("Invalid content detected in company name");
          return true;
        }
        if (sprDetails.projectName && containsXSS(sprDetails.projectName)) {
          toast.error("Invalid content detected in project name");
          return true;
        }
        if (
          sprDetails.priceJustification &&
          containsXSS(sprDetails.priceJustification)
        ) {
          toast.error("Invalid content detected in price justification");
          return true;
        }
        if (sprDetails.competitorNames?.some((name: string) => containsXSS(name))) {
          toast.error("Invalid content detected in competitor names");
          return true;
        }
      }

      return false;
    };

    if (finalXSSCheck()) {
      return false;
    }

    if (checkError()) {
      return false;
    }

    setOpenCreateRfqConfirmationDialog(true);
    return true;
  };

  /**
   * Request quote submission
   */
  const requestQuote = async () => {
    // Trigger validation on all form fields
    const isValid = await trigger();

    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return;
    }

    // Final XSS safety check
    const comment = getValues("comment");
    const buyerRef = getValues("buyerReferenceNumber");
    const sprDetails = getValues("sprDetails");

    if (comment && containsXSS(comment)) {
      toast.error("Invalid content detected in comments");
      return;
    }

    if (buyerRef && containsXSS(buyerRef)) {
      toast.error("Invalid content detected in reference number");
      return;
    }

    if (sprDetails?.spr) {
      if (sprDetails.companyName && containsXSS(sprDetails.companyName)) {
        toast.error("Invalid content detected in company name");
        return;
      }
      if (sprDetails.projectName && containsXSS(sprDetails.projectName)) {
        toast.error("Invalid content detected in project name");
        return;
      }
      if (
        sprDetails.priceJustification &&
        containsXSS(sprDetails.priceJustification)
      ) {
        toast.error("Invalid content detected in price justification");
        return;
      }
      if (sprDetails.competitorNames?.some((name: string) => containsXSS(name))) {
        toast.error("Invalid content detected in competitor names");
        return;
      }
    }

    if (checkError()) {
      return;
    }

    try {
      // Validate required IDs before proceeding
      if (!userId || !companyId) {
        toast.error("User or company information is missing. Please refresh the page.");
        return;
      }

      const bodyData = getbody();
      const body = summaryReqDTO(bodyData as any);
      const setShippingAddress = (getValues("setShippingAddress" as any) as any);
      const setBillingAddress = (getValues("setBillingAddress" as any) as any);

      if (body.shippingAddressDetails && typeof body.shippingAddressDetails === "object") {
        Object.assign(body.shippingAddressDetails, {
          email: setShippingAddress?.email,
          lattitude: setShippingAddress?.lattitude,
          longitude: setShippingAddress?.longitude,
          mobileNo: setShippingAddress?.mobileNo,
          phone: setShippingAddress?.phone,
          countryCode: setShippingAddress?.countryCode,
        });
      }

      if (body.billingAddressDetails && typeof body.billingAddressDetails === "object") {
        Object.assign(body.billingAddressDetails, {
          email: setBillingAddress?.email,
          lattitude: setBillingAddress?.lattitude,
          longitude: setBillingAddress?.longitude,
          mobileNo: setBillingAddress?.mobileNo,
          phone: setBillingAddress?.phone,
          countryCode: setBillingAddress?.countryCode,
        });
      }

      body.rfq = true;
      body.versionName = "RFQ";
      body.quoteName = quoteName;
      body.reorder = (getValues("reorder" as any) as boolean);
      const reorderValidityFrom = getValues("reorderValidityFrom" as any);
      const reorderValidityTill = getValues("reorderValidityTill" as any);
      body.reorderValidityFrom = reorderValidityFrom ? String(reorderValidityFrom) : null;
      body.reorderValidityTill = reorderValidityTill ? String(reorderValidityTill) : null;
      const currencyObj = (getValues("currency" as any) as any);
      body.buyerCurrencyId = currencyObj?.id;
      const accOwners = (getValues("AccOwners" as any) as any[]) || [];
      body.quoteUsers = map(
        accOwners,
        (user: any) => user?.id || user?.userId
      );
      body.deletableQuoteUsers = [];
      body.tagsList = [];
      body.deletableTagsList = [];
      // Extract numeric value from CurrencyFactor (handle both number and object cases)
      // Ensure we always pass a number, not an object
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
      const setSellerAddress = (getValues("setSellerAddress" as any) as any);
      
      // Extract sellerCompanyId and sellerCompanyName from setSellerAddress
      // Matching buyer-fe QuoteSummary.js and summaryReqDTO structure
      // Reference: summaryReqDTO.ts lines 371-372
      const sellerCompanyIdValue = 
        (setSellerAddress?.companyId?.id) || 
        (typeof setSellerAddress?.companyId === "object" && setSellerAddress?.companyId?.id) ||
        (typeof setSellerAddress?.companyId === "number" ? setSellerAddress?.companyId : null) ||
        sellerCompanyId || // Fallback to component-level value
        null;
      
      const sellerCompanyNameValue = 
        (setSellerAddress?.companyId?.name) ||
        (setSellerAddress?.companyId?.companyName) ||
        null;
      
      body.sellerCompanyId = sellerCompanyIdValue;
      body.sellerCompanyName = sellerCompanyNameValue;
      body.buyerCurrencyFactor = currencyFactorValue;
      body.currencyFactor = currencyFactorValue;
      body.overallShipping = (getValues("overallShipping" as any) as number) || 0;
      body.validityFrom = body.validityFrom
        ? body.validityFrom
        : new Date().toISOString();
      body.validityTill = body.validityTill
        ? body.validityTill
        : addDays(new Date(), quoteValidity || 30).toISOString();

      // Ensure companyId and userId are numbers (convert if string)
      const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;
      const numericCompanyId = typeof companyId === "string" ? parseInt(companyId, 10) : companyId;

      if (!numericUserId || !numericCompanyId || isNaN(numericUserId) || isNaN(numericCompanyId)) {
        toast.error("Invalid user or company ID. Please refresh the page.");
        return;
      }

      const response = await QuoteSubmissionService.createQuoteFromSummary(
        {
          userId: numericUserId,
          companyId: numericCompanyId,
        },
        body
      );

      if (response?.quotationIdentifier) {
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("cartComment");
          localStorage.removeItem("cartAttachments");
        }

        // Get the selected seller ID from the form values
        const selectedSellerId = (getValues("selectedSellerId" as any) as string | number | null);

        if (selectedSellerId) {
          emptyCartBySeller(selectedSellerId);
        } else {
          emptyCart();
        }

        router.push("/landing/quoteslanding");
        toast.success("RFQ initiated successfully");
      }
    } catch (error: any) {
      console.error("Error submitting quote:", error);
      toast.error(error?.message || "Failed to create quote. Please try again.");
    }
  };

  const handleNameChange = (val: string) => {
    setQuoteName(val);
  };

  // Get watched values for cash discount - match reference implementation
  const preferences = (watch("preferences" as any) as any) || {};
  const paymentTermsId = preferences?.paymentTermsId;
  const cashDiscountTerm = preferences?.cashDiscountTerm;
  // Watch cashdiscount directly like reference implementation (SummaryBody.js line 46)
  const cashdiscount = watch("cashdiscount" as any) as boolean;

  const cashDiscountValue =
    paymentTermsId?.cashdiscountValue ||
    cashDiscountTerm?.cashdiscountValue ||
    0;

  // Match reference implementation: just watch cashdiscount directly
  // Reference: SummaryBody.js line 46: const isCashDiscountApplied = watch("cashdiscount");
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
      
      // Apply cash discount to products synchronously (like handleCDApplyBase does)
      // IMPORTANT: Preserve all tax-related fields (hsnDetails, taxBreakup, etc.)
      const updatedProducts = currentProducts.map((item: any) => {
        const product = { ...item };
        if (!product.originalUnitPrice) {
          product.originalUnitPrice = product.unitPrice;
        }
        product.cashdiscountValue = cashDiscountValue ? cashDiscountValue : 0;
        // Ensure tax-related fields are preserved for recalculation
        // hsnDetails, interTaxBreakup, intraTaxBreakup, tax, totalTax should all be preserved
        // These are needed for globalCalc to properly calculate tax
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

      // Update cart value with recalculated values - match reference implementation
      // Reference: setValues_After_globalCalc sets entire cartValue object (line 1166-1173)
      // Reference: cartValue.totalTax = result.addTax (line 641, 449 in useCalculation.js)
      if (calculationResult?.cartValue) {
        // Calculate totalTax from products to ensure accuracy
        // Reference implementation sums product.totalTax values
        let totalTax = calculationResult.cartValue.totalTax ?? 0;
        
        // If totalTax is 0 or missing, calculate from products
        if (totalTax === 0 && calculationResult.products && calculationResult.products.length > 0) {
          totalTax = calculationResult.products.reduce((sum: number, product: any) => {
            // Use totalTax (sum of all tax values for the product)
            // Reference: cartValue.totalTax is sum of all product.totalTax values
            return sum + (product.totalTax || 0);
          }, 0);
        }
        
        // Set entire cartValue object like reference implementation does
        // This ensures all fields including totalTax are properly set
        const updatedCartValue = {
          ...calculationResult.cartValue,
          totalTax: totalTax,
        };
        setValue("cartValue" as any, updatedCartValue, { shouldDirty: false });
      }

      // Update products with recalculated values (unitPrice will have cash discount applied)
      if (calculationResult?.products && calculationResult.products.length > 0) {
        setValue("products", calculationResult.products, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, { shouldDirty: false });
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
      
      // Remove cash discount from products - match reference implementation
      // Reference: Just sets cashdiscountValue = 0, doesn't restore originalUnitPrice manually
      // The globalCalc function will handle price restoration based on cashdiscountValue
      // IMPORTANT: Preserve all tax-related fields (hsnDetails, taxBreakup, etc.)
      const updatedProducts = currentProducts.map((item: any) => {
        const product = { ...item };
        // Reference implementation just sets cashdiscountValue = 0 (line 1278)
        // globalCalc will handle restoring the price automatically
        product.cashdiscountValue = 0;
        // Ensure tax-related fields are preserved for recalculation
        // These fields are needed for globalCalc to properly calculate tax
        // hsnDetails, interTaxBreakup, intraTaxBreakup, tax, totalTax should all be preserved
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

      // Update cart value with recalculated values - match reference implementation
      // Reference: setValues_After_globalCalc sets entire cartValue object (line 1166-1173)
      // Reference: cartValue.totalTax = result.addTax (line 641, 449 in useCalculation.js)
      if (calculationResult?.cartValue) {
        // Calculate totalTax from products to ensure accuracy
        // Reference implementation sums product.totalTax values
        let totalTax = calculationResult.cartValue.totalTax ?? 0;
        
        // If totalTax is 0 or missing, calculate from products
        if (totalTax === 0 && calculationResult.products && calculationResult.products.length > 0) {
          totalTax = calculationResult.products.reduce((sum: number, product: any) => {
            // Use totalTax (sum of all tax values for the product)
            // Reference: cartValue.totalTax is sum of all product.totalTax values
            return sum + (product.totalTax || 0);
          }, 0);
        }
        
        // Set entire cartValue object like reference implementation does
        // This ensures all fields including totalTax are properly set
        const updatedCartValue = {
          ...calculationResult.cartValue,
          totalTax: totalTax,
        };
        setValue("cartValue" as any, updatedCartValue, { shouldDirty: false });
      }

      // Update products with recalculated values (unitPrice will have cash discount removed)
      if (calculationResult?.products && calculationResult.products.length > 0) {
        setValue("products", calculationResult.products, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, { shouldDirty: false });
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

      // Recalculate synchronously (like reference singleQtyEdit)
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

      // Update all form values at once (like setValues_After_globalCalc in reference)
      if (calculationResult?.cartValue) {
        setValue("cartValue" as any, calculationResult.cartValue, { shouldDirty: false });
      }

      // Update products with calculated values, preserving the user's quantity
      if (calculationResult?.products && calculationResult.products.length > 0) {
        const finalProducts = calculationResult.products.map((calculatedProduct: any) => {
          // Find the corresponding product from updatedProducts to preserve quantity
          // Match using the same logic as OrderProductsTable: brandProductId || itemCode || orderIdentifier || productId
          const calculatedProductId = 
            calculatedProduct.brandProductId ||
            calculatedProduct.itemCode ||
            calculatedProduct.orderIdentifier ||
            calculatedProduct.productId ||
            "";
          
          const userProduct = updatedProducts.find((p: any) => {
            const pId = 
              p.brandProductId ||
              p.itemCode ||
              p.orderIdentifier ||
              p.productId ||
              "";
            return String(pId) === String(calculatedProductId);
          });
          
          if (userProduct) {
            // Preserve the quantity the user just typed
            return {
              ...calculatedProduct,
              quantity: userProduct.quantity,
              askedQuantity: userProduct.askedQuantity,
              unitQuantity: userProduct.quantity, // Also preserve unitQuantity
            };
          }
          return calculatedProduct;
        });
        
        // Use shouldDirty: true to ensure React detects the change and re-renders
        setValue("products", finalProducts, { shouldDirty: true });
      } else {
        // If no calculated products, just update with the quantity change
        setValue("products", updatedProducts, { shouldDirty: true });
      }

      // Update getBreakup if available
      if (calculationResult?.breakup) {
        setValue("getBreakup" as any, calculationResult.breakup, { shouldDirty: false });
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
  const sellerCompanyId = (setSellerAddress as any)?.companyId?.id;

  // Watch form values for pricing context (these are reactive and will trigger re-renders)
  const cartValue = (watch("cartValue" as any) as any) || {};
  const isInter = (watch("isInter") as boolean) || false;
  const taxExempted = (watch("taxExempted") as boolean) || false;
  const preferencesForPricing = (watch("preferences" as any) as any) || {};
   console.log(cartValue);
   console.log(isInter);
   console.log(products);
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
  }, [isInter, taxExempted, preferencesForPricing?.insuranceId?.insuranceValue, JSON.stringify(cartValue)]);
 
 
  return (
    <FormProvider {...methods}>
      <ApplicationLayout>
        {/* Sales Header - Fixed at top */}
        <div className="flex-shrink-0 sticky top-0 z-50 bg-gray-50">
          <SalesHeader
            title={quoteName}
            identifier=""
            buttons={[
              {
                label: "CANCEL",
                variant: "outline" as const,
                onClick: handleCancel,
              },
              {
                label: "REQUEST FOR QUOTE",
                variant: "default" as const,
                onClick: handleSubmit(
                  requestQuoteConfirmationDialog,
                  (errors) => {
                    // Handle validation errors
                    if (errors?.sprDetails) {
                      const sprErrors = errors.sprDetails as any;
                      if (sprErrors.companyName) {
                        toast.error(
                          "End Customer Name: " + sprErrors.companyName.message
                        );
                      }
                      if (sprErrors.projectName) {
                        toast.error(
                          "Project Name: " + sprErrors.projectName.message
                        );
                      }
                      if (sprErrors.competitorNames) {
                        toast.error(
                          "Competitors: " + sprErrors.competitorNames.message
                        );
                      }
                      if (sprErrors.priceJustification) {
                        toast.error(
                          "Price Justification: " +
                            sprErrors.priceJustification.message
                        );
                      }
                      scrollToErrorField("sprDetails");
                    } else {
                      toast.error(
                        "Please fix the validation errors before submitting"
                      );
                    }
                  }
                ),
                disabled: formState.isSubmitting || !hasQuotePermission,
              },
            ]}
            loading={isLoading}
          />
        </div>

        {/* Quote Summary Content - Scrollable area */}
        <div className="flex-1 w-full">
          <PageLayout variant="content">
            {isLoading ? (
              <DetailsSkeleton
                showStatusTracker={false}
                leftWidth="lg:w-[65%]"
                rightWidth="lg:w-[33%]"
              />
            ) : (
              <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
                {/* Left Side - Products Table, Address & Terms - 65% */}
                <div className="w-full lg:w-[65%] space-y-2 sm:space-y-3 mt-[80px]">
                  {/* Quote Name Card */}
                  <SummaryNameCard
                    name={quoteName}
                    onNameChange={handleNameChange}
                    title="Quote Name"
                    loading={isLoading}
                  />

                  {/* Products Table */}
                  {!isLoading && products && products.length > 0 && (
                    <Suspense fallback={null}>
                      <OrderProductsTable
                        products={products}
                        isEditable={true}
                        onQuantityChange={handleQuantityChange}
                        editedQuantities={{}}
                        showInvoicedQty={false}
                        itemsPerPage={5}
                      />
                    </Suspense>
                  )}

                  {/* Contact Details and Terms Cards - Side by Side */}
                  {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">
                      {/* Contact Details Card */}
                        <OrderContactDetails
                        billingAddress={(watch("setBillingAddress" as any) as any) || null}
                        shippingAddress={(watch("setShippingAddress" as any) as any) || null}
                        registerAddress={(watch("setRegisterAddress" as any) as any) || null}
                        sellerAddress={(watch("setSellerAddress" as any) as any) || null}
                        warehouseName={((watch("setWarehouseAddress" as any) as any)?.wareHouseName) || undefined}
                        warehouseAddress={((watch("setWarehouseAddress" as any) as any)?.addressId) || undefined}
                        salesBranch={((watch("setSellerAddress" as any) as any)?.name) || undefined}
                        requiredDate={(watch("customerRequiredDate" as any) as string) || undefined}
                        referenceNumber={(watch("buyerReferenceNumber" as any) as string) || "-"}
                        isEditable={true}
                        userId={user?.userId?.toString()}
                        buyerBranchId={((watch("setBillingAddress" as any) as any)?.id) || undefined}
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
                          // OrderContactDetails now includes the id field in the address
                          setValue("setBillingAddress" as any, address);
                        }}
                        onShippingAddressChange={(address: any) => {
                          setValue("setShippingAddress" as any, address);
                        }}
                        onSellerBranchChange={(sellerBranch: any) => {
                          if (sellerBranch) {
                            // Update seller address with the seller branch data
                            // Ensure companyId is an object with id and name (matching summaryReqDTO structure)
                            // Reference: summaryReqDTO.ts expects setSellerAddress.companyId.id and setSellerAddress.companyId.name
                            const companyIdObj = sellerBranch.companyId 
                              ? (typeof sellerBranch.companyId === "object" 
                                  ? sellerBranch.companyId 
                                  : { id: sellerBranch.companyId, name: sellerBranch.companyName || sellerBranch.companyId?.name || null })
                              : null;
                            
                            setValue("setSellerAddress" as any, {
                              id: sellerBranch.id,
                              name: sellerBranch.name,
                              branchId: sellerBranch.branchId,
                              companyId: companyIdObj,
                              salesBranchCode: sellerBranch.salesBranchCode || null,
                            });
                          }
                        }}
                        onWarehouseChange={(warehouse: any) => {
                          if (warehouse) {
                            // Update warehouse address with the warehouse data
                            // Reference: buyer-fe SummaryBody.js line 118 - setValue("deliveryPlace", response?.data?.addressId?.city)
                            setValue("setWarehouseAddress" as any, {
                              id: warehouse.id,
                              wareHouseName: warehouse.wareHouseName || warehouse.name,
                              name: warehouse.name,
                              addressId: warehouse.addressId, // Preserve addressId for city access
                              ...(warehouse.wareHousecode && {
                                wareHousecode: warehouse.wareHousecode,
                              }),
                            });
                            
                            // Update deliveryPlace from warehouse city
                            // Reference: buyer-fe SummaryBody.js line 118
                            if (warehouse.addressId?.city) {
                              setValue("deliveryPlace" as any, warehouse.addressId.city);
                            }
                          }
                        }}
                      />

                      {/* Terms Card */}
                      <OrderTermsCard
                        orderTerms={{
                          // Map preference structure to match buyer-fe TermsCard format
                          // Reference: buyer-fe TermsCard.js lines 66-154
                          deliveryTerms: preferences?.deliveryTermsId?.description,
                          deliveryTermsCode: preferences?.deliveryTermsId?.deliveryTermsCode,
                          deliveryTermsCode2: (watch("deliveryPlace" as any) as string) || "", // Delivery Place
                          paymentTerms: preferences?.paymentTermsId?.description,
                          paymentTermsCode: preferences?.paymentTermsId?.paymentTermsCode,
                          packageForwarding: preferences?.pkgFwdId?.description,
                          packageForwardingCode: preferences?.pkgFwdId?.packageForwardingCode,
                          dispatchInstructions: preferences?.dispatchInstructionsId?.description,
                          dispatchInstructionsCode: preferences?.dispatchInstructionsId?.dispatchInstructionsCode,
                          freight: preferences?.freightId?.description,
                          freightCode: preferences?.freightId?.freightCode,
                          insurance: preferences?.insuranceId?.description,
                          insuranceCode: preferences?.insuranceId?.insuranceCode,
                          warranty: preferences?.warrantyId?.description,
                          warrantyCode: preferences?.warrantyId?.warrantyCode,
                          additionalTerms: (watch("additionalTerms") as string) || "",
                        }}
                      />
                    </div>
                  )}

                  {/* End Customer Info - Required Date and Buyer Reference Number */}
                  {/* {!isLoading && (
                    <EndCustomerInfo
                      isSummaryPage={true}
                      isOrder={false}
                      showHeader={true}
                      isEdit={true}
                      isLoading={isLoading}
                    />
                  )} */}

                </div>

                {/* Right Side - Price Details, Customer Information, and Attachments - 33% */}
                {!isLoading && (
                  <div className="w-full lg:w-[33%] mt-[80px]">
                    <div className="space-y-4">
                      <ApplyVolumeDiscountBtn
                        uploading={formState.isSubmitting}
                        isSummary={true}
                        isLoading={isLoading}
                      />
                      {/* Show cash discount card if cash discount is enabled in settings */}
                      {/* The card component itself handles visibility based on cashDiscountValue and isSummaryPage */}
                      {quoteSettings?.showCashDiscount && (
                        <CashDiscountCard
                          handleCDApply={handleCDApply}
                          handleRemoveCD={handleRemoveCD}
                          {...(latestPaymentTerms && { latestpaymentTerms: latestPaymentTerms })}
                          isCashDiscountApplied={isCashDiscountApplied}
                          isSummaryPage={true}
                          cashDiscountValue={cashDiscountValue}
                          islatestTermAvailable={
                            !!latestPaymentTerms && !latestPaymentTermsLoading
                          }
                          prevPaymentTerms={paymentTermsId}
                          isOrder={false}
                        />
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
                            ((watch("currency" as any) as any)?.symbol) || "INR ₹"
                          }
                          overallShipping={(watch("overallShipping" as any) as number) || 0}
                          overallTax={
                            pricingContext.cartValue?.totalTax || 0
                          }
                          calculatedTotal={
                            pricingContext.cartValue?.calculatedTotal ||
                            pricingContext.cartValue?.grandTotal ||
                            0
                          }
                          subTotal={pricingContext.cartValue?.totalValue || 0}
                          taxableAmount={
                            pricingContext.cartValue?.taxableAmount || 0
                          }
                          totalCashDiscount={pricingContext.cartValue?.totalCashDiscount}
                          cashDiscountValue={pricingContext.cartValue?.cashDiscountValue}
                          hidePfRate={true}
                        />
                      </Suspense>
                      
                      {/* Target Discount Card - Only show for quotes, not orders */}
                      {/* Reference: buyer-fe SalesBody.js lines 370-377 - placed after CartPriceDetails */}
                      {!isOrder && (
                        <div className="mt-4">
                          <TargetDiscountCard
                            isContentPage={false}
                            isSummaryPage={true}
                          />
                        </div>
                      )}

                      {/* SPR Form Section - Customer Information (End Customer Name, Project Name, Competitors, Price Justification) */}
                      <div className="mt-4 space-y-4" id="sprDetails">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="spr-toggle"
                            checked={sprEnabled || false}
                            onCheckedChange={checked => {
                              setValue("sprDetails.spr", checked === true);
                              trigger("sprDetails");
                            }}
                          />
                          <Label
                            htmlFor="spr-toggle"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Request Special Price (SPR)
                          </Label>
                        </div>

                        <SPRForm
                          isContentPage={false}
                          isSummaryPage={true}
                        />
                      </div>

                      {/* Attachments - Comments and File Uploads */}
                      <Attachments
                        showHeader={true}
                        showAttachments={true}
                        editAttachments={true}
                        showComments={true}
                        editComments={true}
                        fieldName="uploadedDocumentDetails"
                        folderName="Quote"
                        isContentPage={false}
                        isOrder={false}
                        readOnly={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </PageLayout>
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          open={openCreateRfqConfirmationDialog}
          onOpenChange={setOpenCreateRfqConfirmationDialog}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <DialogTitle>Request For Quote</DialogTitle>
              </div>
              <DialogDescription>
                Note: New Quote will be created
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenCreateRfqConfirmationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setOpenCreateRfqConfirmationDialog(false);
                  requestQuote();
                }}
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Submitting..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ApplicationLayout>
    </FormProvider>
  );
}
