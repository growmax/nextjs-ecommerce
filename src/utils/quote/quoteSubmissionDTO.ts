import type { QuoteSubmissionPayload } from "@/lib/api";
import { filter, forEach, map, some, trim } from "lodash";

/**
 * Prepare quote submission DTO (Data Transfer Object) from form values
 * @param values - The quote details form values
 * @param overViewValues - Overview section values (customer info, users, tags, etc.)
 * @param displayName - Current user's display name
 * @param companyName - Current user's company name
 * @returns Formatted quote submission payload
 */
export const prepareQuoteSubmissionDTO = (
  values: Record<string, any>,  
  overViewValues: Record<string, any>,  
  displayName?: string,
  _companyName?: string
): QuoteSubmissionPayload => {
  // Start with the values object to preserve all existing fields
  const body: any = { ...values };  

  // Override/Update specific fields
  body.quoteName = values?.quoteName || overViewValues?.quoteName;
  body.comment = trim(overViewValues?.comment) || null;
  body.buyerReferenceNumber = overViewValues?.buyerReferenceNumber || null;
  body.uploadedDocumentDetails = overViewValues?.uploadedDocumentDetails || [];
  body.versionCreatedTimestamp = new Date().toISOString();

  // Domain URL
  body.domainURL = typeof window !== "undefined" ? window.location.origin : "";
  body.modifiedByUsername = displayName || "";

  // Users - extract IDs from user objects
  const quoteUserIds = map(
    overViewValues.quoteUsers || [],
    (user: any) => user?.id || user?.userId || user  
  );
  body.quoteUsers = quoteUserIds;
  body.deletableQuoteUsers = [];

  // Division and Order Type - handle both object and number formats
  if (overViewValues?.quoteDivisionId) {
    body.quoteDivisionId = typeof overViewValues.quoteDivisionId === 'object' 
      ? overViewValues.quoteDivisionId.id 
      : overViewValues.quoteDivisionId;
  }

  if (overViewValues?.orderType) {
    body.orderTypeId = typeof overViewValues.orderType === 'object'
      ? parseInt(overViewValues.orderType.id)
      : parseInt(overViewValues.orderType);
  }

  // Tags - extract IDs from tag objects
  const tagsId = map(overViewValues.tagsList || [], (tag: any) => tag?.id || tag);  
  body.tagsList = tagsId;
  body.deletableTagsList = [];

  // Branch Business Unit - handle both object and direct value
  if (values.branchBusinessUnit) {
    body.branchBusinessUnitId = typeof values.branchBusinessUnit === 'object'
      ? values.branchBusinessUnit.id
      : values.branchBusinessUnit;
    body.branchBusinessUnit = body.branchBusinessUnitId;
  }

  // Currency - extract ID from currency object
  if (values.buyerCurrencyId) {
    body.buyerCurrency = values.buyerCurrencyId;
    body.buyerCurrencyId = typeof values.buyerCurrencyId === 'object'
      ? values.buyerCurrencyId.id
      : values.buyerCurrencyId;
  }

  // Payer information
  body.payerCode = body.registerAddressDetails?.soldToCode || null;
  body.payerBranchName = body.registerAddressDetails?.branchName || null;

  // Calculate values from cartValue or VDDetails
  if (body.cartValue) {
    body.subTotal = body?.VDapplied && body?.VDDetails?.subTotal
      ? body.VDDetails.subTotal
      : body.cartValue.totalValue;
    
    body.overallTax = body?.VDapplied && body?.VDDetails?.overallTax
      ? body.VDDetails.overallTax
      : body.cartValue.totalTax;
    
    body.taxableAmount = body?.VDapplied && body?.VDDetails?.taxableAmount
      ? body.VDDetails.taxableAmount
      : body.cartValue.taxableAmount;
    
    body.calculatedTotal = body?.VDapplied && body?.VDDetails?.calculatedTotal
      ? body.VDDetails.calculatedTotal
      : body.cartValue.calculatedTotal;
    
    body.roundingAdjustment = body?.VDapplied && body?.VDDetails?.roundingAdjustment
      ? body.VDDetails.roundingAdjustment
      : body.cartValue.roundingAdjustment;
    
    body.grandTotal = body?.VDapplied && body?.VDDetails?.grandTotal
      ? body.VDDetails.grandTotal
      : body.cartValue.grandTotal;
    
    body.overallShipping = body.cartValue.totalShipping || 0;
    body.totalPfValue = body.cartValue.pfRate || 0;
  }

  body.subTotalWithVD = body?.VDDetails?.subTotalVolume;
  body.subtotal_bc = body.subtotal_bc || null;

  // Volume discount flag
  body.versionLevelVolumeDisscount = some(body.dbProductDetails || [], [
    "volumeDiscountApplied",
    true,
  ]);

  // Format product details
  if (body.dbProductDetails && Array.isArray(body.dbProductDetails)) {
    body.dbProductDetails = map(
      body.dbProductDetails,
      (prod: any) => {  
        const formattedProd: any = { ...prod };  
        
        // Account Owner
        formattedProd.accountOwnerId = prod.accountOwner
          ? (typeof prod.accountOwner === 'object' ? parseInt(prod.accountOwner.id) : parseInt(prod.accountOwner))
          : null;
        
        // Business Unit
        formattedProd.businessUnitId = prod.businessUnit
          ? (typeof prod.businessUnit === 'object' ? prod.businessUnit.id : prod.businessUnit)
          : null;
        
        // Division
        formattedProd.divisionId = prod.division
          ? (typeof prod.division === 'object' ? parseInt(prod.division.id) : parseInt(prod.division))
          : null;
        
        // Line and Item numbers (null for new products)
        formattedProd.lineNo = prod.new ? null : prod.lineNo;
        formattedProd.itemNo = prod.new ? null : prod.itemNo;
        
        // Warehouse
        formattedProd.orderWareHouseId = prod.wareHouse?.id || prod.orderWareHouseId;
        formattedProd.orderWareHouseName = prod.wareHouse?.wareHouseName || prod.orderWareHouseName;
        
        // P&F values
        formattedProd.pfPercentage = body.quoteTerms?.pfPercentage || body.pfRate || prod.pfPercentage || null;
        formattedProd.pfValue = body.quoteTerms?.pfValue || body.pfRate || prod.pfValue || null;
        
        // Taxes - use the correct tax breakup based on inter/intra state
        formattedProd.productTaxes = body.isInter
          ? (prod.interTaxBreakup || prod.productTaxes)
          : (prod.intraTaxBreakup || prod.productTaxes);
        
        // Discounts
        formattedProd.productDiscounts = prod?.discountDetails?.discountId
          ? [
              {
                id: null,
                discounId: prod.discountDetails.discountId,
                discounCode: null,
                orderProduct: null,
                discountPercentage: prod.discountDetails.Value,
              },
            ]
          : [];
        
        // Bundle products
        formattedProd.bundleProducts =
          prod?.bundleProducts?.length > 0
            ? formBundleProductsPayload(prod.bundleProducts)
            : [];
        
        // Unit List Price - handle showPrice flag
        formattedProd.unitListPrice =
          !prod.showPrice || prod.priceNotAvailable
            ? prod.unitLPRp || prod.unitListPrice
            : prod.unitListPrice;
        
        formattedProd.showPrice = prod?.showPrice && !prod?.priceNotAvailable;
        
        return formattedProd;
      }
    );

    // Merge removed products
    body.dbProductDetails = [
      ...body.dbProductDetails,
      ...(values.removedDbProductDetails || []),
    ];

    // Final cleanup for all products
    body.dbProductDetails.forEach((item: any) => {  
      item.productDiscounts =
        (item?.productDiscounts || []).length > 0 ? item.productDiscounts : [];
      item.bundleProducts =
        item?.bundleProducts?.length > 0
          ? formBundleProductsPayload(item.bundleProducts)
          : [];
      return item;
    });
  }

  return body as QuoteSubmissionPayload;
};

/**
 * Format bundle products for API payload
 * @param bundleArray - Array of bundle products
 * @returns Formatted bundle products array
 */
export const formBundleProductsPayload = (
  bundleArray: any[]  
) => {
  forEach(bundleArray, (bp) => {
    bp.bundleSelected = bp.bundleSelected ? 1 : 0;
    bp.isBundleSelected_fe = bp.isBundleSelected_fe ? 1 : 0;
  });

  return filter(bundleArray, (bp) => Boolean(bp?.isBundleSelected_fe));
};

/**
 * Check if product has bundle products selected
 * @param bundleProducts - Array of bundle products
 * @returns True if any bundle product is selected
 */
export function checkIsBundleProduct(
  bundleProducts?: any[]  
): boolean {
  if (
    bundleProducts?.length &&
    bundleProducts.length > 0 &&
    some(bundleProducts, (bp) => Boolean(bp.bundleSelected))
  ) {
    return true;
  }
  return false;
}
