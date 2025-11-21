"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import { summaryReqDTO, SummaryFormData } from "@/utils/summary/summaryReqDTO";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import OrdersService from "@/lib/api/services/OrdersService/OrdersService";
import QuoteSubmissionService from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { addDays } from "date-fns";
import { map } from "lodash";

/**
 * Hook to handle summary form submission (both orders and quotes)
 * 
 * @param isOrder - Whether this is an order (true) or quote (false)
 * @param getValues - Form getValues function
 * @param trigger - Form trigger function for validation
 * @param userId - User ID
 * @param companyId - Company ID
 * @param currencyFactor - Currency factor
 * @param quoteValidity - Quote validity days (for quotes only)
 * @returns Submission handler and loading state
 */
export default function useSummarySubmission(
  isOrder: boolean,
  getValues: UseFormGetValues<any>,
  trigger: UseFormTrigger<any>,
  userId: number | string | null | undefined,
  companyId: number | string | null | undefined,
  currencyFactor: number = 1,
  quoteValidity: number = 30
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { emptyCart, emptyCartBySeller } = useCart();

  /**
   * Validate form and check for XSS
   */
  const validateForm = async (): Promise<boolean> => {
    // Trigger validation on all form fields
    const isValid = await trigger();

    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return false;
    }

    // Final XSS safety check
    const comment = getValues("comment");
    const buyerRef = getValues("buyerReferenceNumber");
    const sprDetails = getValues("sprDetails");

    if (comment && containsXSS(comment)) {
      toast.error("Invalid content detected in comments");
      return false;
    }

    if (buyerRef && containsXSS(buyerRef)) {
      toast.error("Invalid content detected in reference number");
      return false;
    }

    if (sprDetails?.spr) {
      if (sprDetails.companyName && containsXSS(sprDetails.companyName)) {
        toast.error("Invalid content detected in company name");
        return false;
      }
      if (sprDetails.projectName && containsXSS(sprDetails.projectName)) {
        toast.error("Invalid content detected in project name");
        return false;
      }
      if (
        sprDetails.priceJustification &&
        containsXSS(sprDetails.priceJustification)
      ) {
        toast.error("Invalid content detected in price justification");
        return false;
      }
      if (sprDetails.competitorNames?.some((name: string) => containsXSS(name))) {
        toast.error("Invalid content detected in competitor names");
        return false;
      }
    }

    return true;
  };

  /**
   * Prepare form data for submission
   */
  const prepareSubmissionData = (): SummaryFormData => {
    const formValues = getValues();
    const setShippingAddress = formValues.setShippingAddress;
    const setBillingAddress = formValues.setBillingAddress;
    const setRegisterAddress = formValues.setRegisterAddress || setBillingAddress;
    const setSellerAddress = formValues.setSellerAddress;

    // Prepare products with bundle handling if needed
    let products = formValues.products || [];
    
    // TODO: Add bundle product handling if needed
    // products = formBundleProductsPayload(products);

    // Build summary request DTO
    const summaryData: SummaryFormData = {
      additionalTerms: formValues.additionalTerms || "",
      companyId: companyId || 0,
      setSellerAddress: setSellerAddress || {},
      setBillingAddress: setBillingAddress || {},
      setRegisterAddress: setRegisterAddress || {},
      setShippingAddress: setShippingAddress || {},
      authData: {
        companyName: formValues.userData?.companyName || "",
        displayName: formValues.userData?.displayName || "",
      },
      buyerReferenceNumber: formValues.buyerReferenceNumber || null,
      customerRequiredDate: formValues.customerRequiredDate || null,
      products: products,
      VDDetails: formValues.VDDetails || {},
      cartValue: formValues.cartValue || {},
      division: formValues.division || null,
      channel: formValues.channel || null,
      preferences: formValues.preferences || {},
      pfRate: formValues.pfRate || 0,
      uploadedDocumentDetails: formValues.uploadedDocumentDetails || [],
      comment: formValues.comment || null,
      taxExempted: formValues.taxExempted || false,
      taxExemptionMessage: formValues.taxMessage || null,
      sprDetails: formValues.sprDetails || {},
      isSPRRequested: formValues.sprDetails?.spr || false,
      isOrder: isOrder,
      branchBusinessUnit: formValues.branchBusinessUnit || null,
      deliveryPlace: formValues.deliveryPlace || null,
      quoteSettings: {
        showInsuranceCharges: formValues.preferences?.insuranceId?.insuranceValue !== null,
      },
      cashdiscount: formValues.preferences?.paymentTermsId?.cashdiscount || false,
    };

    return summaryData;
  };

  /**
   * Submit order
   */
  const submitOrder = async (): Promise<string | null> => {
    if (!validateForm()) {
      return null;
    }

    if (!userId || !companyId) {
      toast.error("User ID or Company ID is missing");
      return null;
    }

    setIsSubmitting(true);

    try {
      const summaryData = prepareSubmissionData();
      const body = summaryReqDTO(summaryData);

      // Add order-specific fields
      body.overallShipping = getValues("overallShipping") || 0;
      body.orderName = getValues("orderName") || "Order";
      body.orderDescription = body.orderDescription || "string";

      const response = await OrdersService.createOrderFromSummary(
        {
          userId,
          companyId,
        },
        body
      );

      if (response?.orderIdentifier) {
        // Clear cart
        const selectedSellerId = getValues("selectedSellerId");
        if (selectedSellerId) {
          emptyCartBySeller(selectedSellerId);
        } else {
          emptyCart();
        }

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("cartComment");
          localStorage.removeItem("cartAttachments");
          localStorage.removeItem("paymentDetails");
        }

        toast.success("Order placed successfully");

        return response.orderIdentifier;
      }

      throw new Error("Order creation failed");
    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast.error(error?.message || "Failed to place order. Please try again.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Submit quote
   */
  const submitQuote = async (quoteName: string): Promise<string | null> => {
    if (!validateForm()) {
      return null;
    }

    if (!userId || !companyId) {
      toast.error("User ID or Company ID is missing");
      return null;
    }

    setIsSubmitting(true);

    try {
      const summaryData = prepareSubmissionData();
      const body = summaryReqDTO(summaryData);

      // Add quote-specific fields
      const formValues = getValues();
      const shippingDetails = body.shippingAddressDetails as Record<string, unknown>;
      const billingDetails = body.billingAddressDetails as Record<string, unknown>;
      
      shippingDetails.email = formValues.setShippingAddress?.email || "";
      shippingDetails.lattitude = formValues.setShippingAddress?.lattitude || null;
      shippingDetails.longitude = formValues.setShippingAddress?.longitude || null;
      shippingDetails.mobileNo = formValues.setShippingAddress?.mobileNo || null;
      shippingDetails.phone = formValues.setShippingAddress?.phone || null;
      shippingDetails.countryCode = formValues.setShippingAddress?.countryCode || null;

      billingDetails.email = formValues.setBillingAddress?.email || "";
      billingDetails.lattitude = formValues.setBillingAddress?.lattitude || null;
      billingDetails.longitude = formValues.setBillingAddress?.longitude || null;
      billingDetails.mobileNo = formValues.setBillingAddress?.mobileNo || null;
      billingDetails.phone = formValues.setBillingAddress?.phone || null;
      billingDetails.countryCode = formValues.setBillingAddress?.countryCode || null;

      body.rfq = true;
      body.versionName = "RFQ";
      body.quoteName = quoteName;
      body.reorder = formValues.reOrder || false;
      body.reorderValidityFrom = formValues.reorderValidityFrom || null;
      body.reorderValidityTill = formValues.reorderValidityTill || null;
      body.buyerCurrencyId = formValues.currency?.id || null;
      body.quoteUsers = map(
        formValues.AccOwners || [],
        (user: any) => user?.id || user?.userId
      );
      body.deletableQuoteUsers = [];
      body.tagsList = [];
      body.deletableTagsList = [];
      body.buyerCurrencyFactor = currencyFactor;
      body.currencyFactor = currencyFactor;
      body.overallShipping = formValues.overallShipping || 0;
      body.validityFrom = body.validityFrom
        ? body.validityFrom
        : new Date().toISOString();
      body.validityTill = body.validityTill
        ? body.validityTill
        : addDays(new Date(), quoteValidity).toISOString();

      const response = await QuoteSubmissionService.createQuoteFromSummary(
        {
          userId,
          companyId,
        },
        body
      );

      if (response?.quotationIdentifier) {
        // Clear cart
        const selectedSellerId = formValues.selectedSellerId;
        if (selectedSellerId) {
          emptyCartBySeller(selectedSellerId);
        } else {
          emptyCart();
        }

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("cartComment");
          localStorage.removeItem("cartAttachments");
        }

        toast.success("RFQ initiated successfully");

        return response.quotationIdentifier;
      }

      throw new Error("Quote creation failed");
    } catch (error: any) {
      console.error("Error submitting quote:", error);
      toast.error(error?.message || "Failed to create quote. Please try again.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Navigate to success page
   */
  const navigateToSuccess = (identifier: string) => {
    if (isOrder) {
      router.push(`/success?orderIdentifier=${identifier}`);
    } else {
      router.push("/landing/quoteslanding");
    }
  };

  return {
    submitOrder,
    submitQuote,
    navigateToSuccess,
    isSubmitting,
    validateForm,
  };
}

