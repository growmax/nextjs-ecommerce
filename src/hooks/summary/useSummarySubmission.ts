"use client";

import { useCart } from "@/hooks/useCart";
import OrdersService from "@/lib/api/services/OrdersService/OrdersService";
import QuoteSubmissionService from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { SummaryFormData, summaryReqDTO } from "@/utils/summary/summaryReqDTO";
import { addDays } from "date-fns";
import { map } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import { toast } from "sonner";

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
      if (
        sprDetails.competitorNames?.some((name: string) => containsXSS(name))
      ) {
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
    // Use registerAddress if available and has fields, otherwise use billingAddress
    const registerAddressRaw = formValues.setRegisterAddress;
    const setRegisterAddress = 
      (registerAddressRaw && Object.keys(registerAddressRaw).length > 0)
        ? registerAddressRaw
        : setBillingAddress;
    const setSellerAddress = formValues.setSellerAddress;
    const setWarehouseAddress = formValues.setWarehouseAddress;
    const isInter = formValues.isInter || false;
    const preferences = formValues.preferences || {};
    const pfRate = formValues.pfRate || 0;
    const customerRequiredDate = formValues.customerRequiredDate || null;

      // Prepare products with proper transformation for submission
      // Remove duplicate tax entries to match expected format
      let products = (formValues.products || []).map((prod: any) => {
        // Get tax breakups and remove duplicates
        const interTaxBreakup = prod.interTaxBreakup || [];
        const intraTaxBreakup = prod.intraTaxBreakup || [];
        
        // Remove duplicates from tax breakups (match expected format)
        const uniqueInterTax = interTaxBreakup.filter((tax: any, index: number, self: any[]) => 
          index === self.findIndex((t: any) => 
            t.taxName === tax.taxName && t.taxPercentage === tax.taxPercentage
          )
        );
        const uniqueIntraTax = intraTaxBreakup.filter((tax: any, index: number, self: any[]) => 
          index === self.findIndex((t: any) => 
            t.taxName === tax.taxName && t.taxPercentage === tax.taxPercentage
          )
        );

        return {
          ...prod,
          // Account Owner
          accountOwnerId: prod.accountOwnerId
            ? typeof prod.accountOwnerId === "object"
              ? parseInt(prod.accountOwnerId.id)
              : parseInt(prod.accountOwnerId)
            : null,
          // Business Unit
          businessUnitId: prod.businessUnit
            ? typeof prod.businessUnit === "object"
              ? prod.businessUnit.id
              : prod.businessUnit
            : null,
          // Division
          divisionId: prod.division
            ? typeof prod.division === "object"
              ? parseInt(prod.division.id)
              : parseInt(prod.division)
            : null,
          // Line and Item numbers (null for new orders)
          lineNo: null,
          itemNo: null,
          // P&F values
          pfPercentage:
            preferences?.pkgFwdId?.pfPercentage || pfRate ? pfRate : null,
          pfValue: null, // Hardcoded to null as per expected format
          // Shipping address fields
          shipToBranchName: setShippingAddress?.branchName || null,
          shipToCode: setShippingAddress?.shipToCode || null,
          // Warehouse
          orderWareHouseId: setWarehouseAddress?.id || prod.orderWareHouseId || null,
          orderWareHouseName: setWarehouseAddress?.wareHouseName || prod.orderWareHouseName || null,
          // Product taxes - CRITICAL: Must be set based on isInter, no duplicates
          productTaxes: isInter 
            ? uniqueInterTax
            : uniqueIntraTax,
          // Tax breakups without duplicates
          interTaxBreakup: uniqueInterTax,
          intraTaxBreakup: uniqueIntraTax,
          // Cash discount value
          cashdiscountValue: prod?.cashdiscountValue || 0,
          // Required delivery date
          reqDeliveryDate: customerRequiredDate ? customerRequiredDate : null,
          // Unit list price
          unitListPrice:
            !prod.showPrice || prod.priceNotAvailable
              ? prod.unitLPRp
              : prod.unitListPrice,
          // Show price
          showPrice: prod?.showPrice && !prod?.priceNotAvailable,
          // Bundle products (if any)
          bundleProducts: prod?.bundleProducts?.length > 0
            ? prod.bundleProducts
            : [],
        };
      });

    // Get company name from form values (could be in different locations)
    const companyName = 
      formValues.companyName || 
      formValues.userData?.companyName || 
      formValues.companydata?.companyName || 
      "";

    // Build summary request DTO
    const summaryData: SummaryFormData = {
      additionalTerms: formValues.additionalTerms || "",
      companyId: companyId || 0,
      setSellerAddress: setSellerAddress || {},
      setBillingAddress: setBillingAddress || {},
      setRegisterAddress: setRegisterAddress || {},
      setShippingAddress: setShippingAddress || {},
      authData: {
        companyName: companyName,
        displayName: formValues.userData?.displayName || formValues.companydata?.userData?.displayName || "",
      },
      buyerReferenceNumber: formValues.buyerReferenceNumber || null,
      customerRequiredDate: customerRequiredDate,
      products: products,
      VDDetails: formValues.VDDetails || {},
      cartValue: formValues.cartValue || {},
      division: formValues.division || null,
      channel: formValues.channel || null,
      preferences: preferences,
      pfRate: pfRate,
      uploadedDocumentDetails: formValues.uploadedDocumentDetails || [],
      comment: formValues.comment || null,
      taxExempted: formValues.taxExempted || false,
      taxExemptionMessage: formValues.taxMessage || formValues.taxExemptionMessage || "",
      sprDetails: formValues.sprDetails || {},
      isSPRRequested: formValues.sprDetails?.spr || false,
      isOrder: isOrder,
      branchBusinessUnit: formValues.branchBusinessUnit || null,
      deliveryPlace: formValues.deliveryPlace || null,
      quoteSettings: {
        showInsuranceCharges:
          preferences?.insuranceId?.insuranceValue !== null,
      },
      cashdiscount:
        preferences?.paymentTermsId?.cashdiscount || false,
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
      const formValues = getValues();
      const preferences = formValues.preferences || {};

      // Add order-specific fields
      body.overallShipping = formValues.overallShipping || 0;
      body.orderName = formValues.orderName || "Order";
      body.orderDescription = body.orderDescription || "string";
      
      // Ensure buyerCompanyName is populated (not empty string)
      if (!body.buyerCompanyName || body.buyerCompanyName === "") {
        const companyName = 
          formValues.companyName || 
          formValues.userData?.companyName || 
          formValues.companydata?.companyName || 
          "";
        body.buyerCompanyName = companyName;
      }
      
      // Add cashdiscount at top level (matching expected format)
      body.cashdiscount = preferences?.paymentTermsId?.cashdiscount || false;
      
      // Add currency fields
      const currencyObj = formValues.currency;
      body.buyerCurrencyId = currencyObj?.id || null;
      body.buyerCurrencyFactor = currencyFactor;
      body.currencyFactor = currencyFactor;
      
      // Add seller company and branch information
      const setSellerAddress = formValues.setSellerAddress;
      // sellerCompanyId should be the company ID (number), not the sellerId
      body.sellerCompanyId = setSellerAddress?.companyId?.id || setSellerAddress?.companyId || null;
      
      // sellerCompanyName - try multiple sources (matching QuoteSummaryContent pattern)
      // First check if summaryReqDTO already set it correctly
      let sellerCompanyName = (body.sellerCompanyName as string) || null;
      // If not set or null, try from setSellerAddress.companyId.name
      if (!sellerCompanyName) {
        sellerCompanyName = setSellerAddress?.companyId?.name || null;
      }
      // Fallback: get from first product's sellerName if companyId.name is not available
      if (!sellerCompanyName && formValues.products && formValues.products.length > 0) {
        sellerCompanyName = (formValues.products[0] as any)?.sellerName || null;
      }
      // Fallback: get from sellerAddress directly if available
      if (!sellerCompanyName && setSellerAddress?.sellerCompanyName) {
        sellerCompanyName = setSellerAddress.sellerCompanyName;
      }
      // Only override if we found a value, otherwise keep what summaryReqDTO set
      if (sellerCompanyName) {
        body.sellerCompanyName = sellerCompanyName;
      }
      
      // sellerBranchId should be the branch ID (from setSellerAddress.id)
      body.sellerBranchId = setSellerAddress?.id || null;
      body.sellerBranchName = setSellerAddress?.name || null;
      body.salesBranchCode = setSellerAddress?.salesBranchCode || null;
      
      // Add branch business unit (both fields for compatibility)
      const branchBusinessUnit = formValues.branchBusinessUnit;
      if (branchBusinessUnit) {
        // Handle both object with branchBUId and direct value
        const branchBUId = branchBusinessUnit?.branchBUId || branchBusinessUnit?.id || branchBusinessUnit;
        body.branchBusinessUnitId = branchBUId;
        body.branchBusinessUnit = branchBUId;
      }
      
      // Add payer information from register address
      const setRegisterAddress = formValues.setRegisterAddress || formValues.setBillingAddress;
      body.payerCode = setRegisterAddress?.soldToCode || setRegisterAddress?.billToCode || undefined;
      body.payerBranchName = setRegisterAddress?.branchName || undefined;
      
      // Add order type ID from channel (default to 1 if not provided, matching expected format)
      if (formValues.channel?.id) {
        body.orderTypeId = parseInt(String(formValues.channel.id));
      } else {
        body.orderTypeId = 1; // Default order type ID
      }
      
      // Ensure taxMessage is empty string if null
      if (body.taxMessage === null || body.taxMessage === undefined) {
        body.taxMessage = "";
      }
      
      // Add cartValue to body (required by API)
      // Ensure cartValue has proper tax totals based on isInter
      const isInter = formValues.isInter || false;
      if (formValues.cartValue) {
        const cartValue = { ...formValues.cartValue };
        // Add IGSTTotal for inter-state or SGSTTotal/CGSTTotal for intra-state
        if (isInter) {
          // For inter-state, calculate IGSTTotal from products
          if (formValues.products && Array.isArray(formValues.products)) {
            let igstTotal = 0;
            formValues.products.forEach((prod: any) => {
              if (prod.interTaxBreakup && Array.isArray(prod.interTaxBreakup)) {
                prod.interTaxBreakup.forEach((tax: any) => {
                  if (tax.taxName === "IGST") {
                    const taxAmount = (prod.totalPrice || 0) * (tax.taxPercentage || 0) / 100;
                    igstTotal += taxAmount;
                  }
                });
              }
            });
            cartValue.IGSTTotal = igstTotal;
          }
        } else {
          // For intra-state, calculate SGSTTotal and CGSTTotal from products
          if (formValues.products && Array.isArray(formValues.products)) {
            let sgstTotal = 0;
            let cgstTotal = 0;
            formValues.products.forEach((prod: any) => {
              if (prod.intraTaxBreakup && Array.isArray(prod.intraTaxBreakup)) {
                prod.intraTaxBreakup.forEach((tax: any) => {
                  const taxAmount = (prod.totalPrice || 0) * (tax.taxPercentage || 0) / 100;
                  if (tax.taxName === "SGST") {
                    sgstTotal += taxAmount;
                  } else if (tax.taxName === "CGST") {
                    cgstTotal += taxAmount;
                  }
                });
              }
            });
            cartValue.SGSTTotal = sgstTotal;
            cartValue.CGSTTotal = cgstTotal;
          }
        }
        body.cartValue = cartValue;
      }
      
      // Add reorder validity fields (null for new orders)
      body.reorderValidityFrom = null;
      body.reorderValidityTill = null;
      
      // Ensure sprDetails has sprRequestedDiscount field (matching quote structure)
      if (body.sprDetails && typeof body.sprDetails === "object") {
        const sprDetails = body.sprDetails as Record<string, unknown>;
        if (sprDetails.sprRequestedDiscount === undefined) {
          sprDetails.sprRequestedDiscount = 0;
        }
      }

      // Ensure orderTerms is present and complete
      // summaryReqDTO should create it, but ensure all fields are set with proper defaults
      if (body.orderTerms && typeof body.orderTerms === "object") {
        // Ensure all required fields are present in orderTerms
        const orderTerms = body.orderTerms as Record<string, unknown>;
        // Add missing fields with defaults if not present
        if (orderTerms.deliveryTermsCode2 === undefined && formValues.deliveryPlace) {
          orderTerms.deliveryTermsCode2 = formValues.deliveryPlace;
        }
        // Ensure all code fields are strings (not undefined) - matching quote structure
        if (!orderTerms.deliveryTermsCode) orderTerms.deliveryTermsCode = "";
        if (!orderTerms.dispatchInstructionsCode) orderTerms.dispatchInstructionsCode = "";
        if (!orderTerms.freightCode) orderTerms.freightCode = "";
        if (!orderTerms.insuranceCode) orderTerms.insuranceCode = "";
        if (!orderTerms.packageForwardingCode) orderTerms.packageForwardingCode = "";
        if (!orderTerms.paymentTermsCode) orderTerms.paymentTermsCode = "";
        if (!orderTerms.warrantyCode) orderTerms.warrantyCode = "";
      } else if (!body.orderTerms) {
        // Fallback: create orderTerms if it's completely missing
        body.orderTerms = {
          beforeTax: preferences?.freightId?.beforeTax || false,
          beforeTaxPercentage: preferences?.freightId?.beforeTaxPercentage || 0,
          deliveryTerms: preferences?.deliveryTermsId?.name || preferences?.deliveryTermsId?.description || null,
          deliveryTermsId: preferences?.deliveryTermsId?.id || null,
          deliveryTermsCode: preferences?.deliveryTermsId?.deliveryTermsCode || "",
          ...(formValues.deliveryPlace ? { deliveryTermsCode2: formValues.deliveryPlace } : {}),
          diValue: 0,
          dispatchInstructions: preferences?.dispatchInstructionsId?.name || null,
          dispatchInstructionsId: preferences?.dispatchInstructionsId?.id || null,
          dispatchInstructionsCode: preferences?.dispatchInstructionsId?.dispatchInstructionsCode || "",
          dtValue: 0,
          freight: preferences?.freightId?.name || null,
          freightId: preferences?.freightId?.id || null,
          freightValue: 0,
          freightCode: preferences?.freightId?.freightCode || "",
          frByPercentage: preferences?.freightId?.frByPercentage || false,
          frHeader: preferences?.freightId?.frHeader || false,
          insurance: preferences?.insuranceId?.name || null,
          insuranceId: preferences?.insuranceId?.id || null,
          insByPercentage: preferences?.insuranceId?.insByPercentage || false,
          insuranceValue: preferences?.insuranceId?.insuranceValue || null,
          insurancePercentage: preferences?.insuranceId?.insurancePercentage || null,
          insuranceCode: preferences?.insuranceId?.insuranceCode || "",
          insHeader: preferences?.insuranceId?.insHeader || false,
          packageForwarding: preferences?.pkgFwdId?.name || null,
          packageForwardingId: preferences?.pkgFwdId?.id || null,
          packageForwardingCode: preferences?.pkgFwdId?.packageForwardingCode || "",
          paymentTerms: preferences?.paymentTermsId?.description || null,
          paymentTermsId: preferences?.paymentTermsId?.id || null,
          paymentTermsCode: preferences?.paymentTermsId?.paymentTermsCode || "",
          payOnDelivery: preferences?.paymentTermsId?.payOnDelivery || false,
          bnplEnabled: preferences?.paymentTermsId?.bnplEnabled || false,
          cashdiscountValue: preferences?.paymentTermsId?.cashdiscountValue || 0,
          cashdiscount: preferences?.paymentTermsId?.cashdiscount || false,
          ptValue: 0,
          pfValue: null,
          pfPercentage: preferences?.pkgFwdId?.pfPercentage || formValues.pfRate || null,
          pfHeader: preferences?.pkgFwdId?.pfHeader || false,
          pfByPercentage: preferences?.pkgFwdId?.pfByPercentage || false,
          warranty: preferences?.warrantyId?.name || null,
          warrantyId: preferences?.warrantyId?.id || null,
          warrantyValue: 0,
          warrantyCode: preferences?.warrantyId?.warrantyCode || "",
        };
      }
      
      // Add order users (account owners)
      const accOwners = formValues.AccOwners || [];
      body.orderUsers = map(
        accOwners,
        (user: any) => user?.id || user?.userId
      );
      body.deletableOrderUsers = [];
      body.tagsList = [];
      body.deletableTagsList = [];

      // Add shipping and billing address details (email, coordinates, phone, etc.)
      // Match QuoteSummaryContent pattern exactly
      const setShippingAddress = formValues.setShippingAddress;
      const setBillingAddress = formValues.setBillingAddress;

      if (body.shippingAddressDetails && typeof body.shippingAddressDetails === "object") {
        Object.assign(body.shippingAddressDetails, {
          email: setShippingAddress?.email || null,
          lattitude: setShippingAddress?.lattitude || null,
          longitude: setShippingAddress?.longitude || null,
          mobileNo: setShippingAddress?.mobileNo || "", // Empty string to match expected format
          phone: setShippingAddress?.phone || "", // Empty string to match expected format
          countryCode: setShippingAddress?.countryCode || null,
        });
      }

      if (body.billingAddressDetails && typeof body.billingAddressDetails === "object") {
        Object.assign(body.billingAddressDetails, {
          email: setBillingAddress?.email || null,
          lattitude: setBillingAddress?.lattitude || null,
          longitude: setBillingAddress?.longitude || null,
          mobileNo: setBillingAddress?.mobileNo || "", // Empty string to match expected format
          phone: setBillingAddress?.phone || "", // Empty string to match expected format
          countryCode: setBillingAddress?.countryCode || null,
        });
      }

      const response = await OrdersService.createOrderFromSummary(
        {
          userId,
          companyId,
        },
        body
      );
       console.log(response);
      if (response?.data?.orderIdentifier) {
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

        // Navigate to orders landing page
        router.push("/landing/orderslanding");

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
      const shippingDetails = body.shippingAddressDetails as Record<
        string,
        unknown
      >;
      const billingDetails = body.billingAddressDetails as Record<
        string,
        unknown
      >;

      shippingDetails.email = formValues.setShippingAddress?.email || "";
      shippingDetails.lattitude =
        formValues.setShippingAddress?.lattitude || null;
      shippingDetails.longitude =
        formValues.setShippingAddress?.longitude || null;
      shippingDetails.mobileNo =
        formValues.setShippingAddress?.mobileNo || null;
      shippingDetails.phone = formValues.setShippingAddress?.phone || null;
      shippingDetails.countryCode =
        formValues.setShippingAddress?.countryCode || null;

      billingDetails.email = formValues.setBillingAddress?.email || "";
      billingDetails.lattitude =
        formValues.setBillingAddress?.lattitude || null;
      billingDetails.longitude =
        formValues.setBillingAddress?.longitude || null;
      billingDetails.mobileNo = formValues.setBillingAddress?.mobileNo || null;
      billingDetails.phone = formValues.setBillingAddress?.phone || null;
      billingDetails.countryCode =
        formValues.setBillingAddress?.countryCode || null;

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
      toast.error(
        error?.message || "Failed to create quote. Please try again."
      );
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
