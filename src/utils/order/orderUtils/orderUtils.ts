import { filter, forEach, map, some, trim } from "lodash";
import cloneDeep from "lodash/cloneDeep";

/**
 * Transform bundle products array for API payload
 * @param bundleArray - Array of bundle products
 * @returns Filtered array of selected bundle products
 */
export const formBundleProductsPayload = (bundleArray: any[]) => {
  forEach(bundleArray, bp => {
    bp.bundleSelected = bp.bundleSelected ? 1 : 0;
    bp.isBundleSelected_fe = bp.isBundleSelected_fe ? 1 : 0;
  });

  return filter(bundleArray, bp => Boolean(bp?.isBundleSelected_fe));
};

/**
 * Check if product has bundle products selected
 * @param bundleProducts - Array of bundle products
 * @returns true if any bundle product is selected
 */
export function checkIsBundleProduct(bundleProducts: any[]) {
  if (
    bundleProducts?.length > 0 &&
    some(bundleProducts, bp => Boolean(bp.bundleSelected))
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Transform quote data to order submission DTO
 * Used when converting a quote to an order (Place Order action)
 */
export const quoteSubmitDTO = (
  values: any,
  overViewValues: any,
  displayName: string,
  companyName: string,
  isPlaceOrder: boolean
) => {
  let body = values;
  body.comment = trim(overViewValues?.comment) || null;
  body.quoteName = values?.quoteName;
  body.buyerReferenceNumber = overViewValues?.buyerReferenceNumber;
  body.uploadedDocumentDetails = overViewValues?.uploadedDocumentDetails || [];
  body.versionCreatedTimestamp = new Date().toISOString();
  body.overallShipping = body?.cartValue?.totalShipping;
  body.taxableAmount = body?.cartValue?.taxableAmount;

  body.subTotal =
    body?.VDapplied && body?.VDDetails?.subTotalVolume
      ? body?.VDDetails.subTotal
      : body?.cartValue?.totalValue;
  body.subTotalWithVD = body?.VDDetails.subTotalVolume;
  body.overallTax =
    body?.VDapplied && body?.VDDetails.subTotalVolume
      ? body?.VDDetails.overallTax
      : body?.cartValue?.totalTax;

  body.taxableAmount =
    body?.VDapplied && body?.VDDetails.taxableAmount
      ? body?.VDDetails.taxableAmount
      : body?.cartValue?.taxableAmount;
  body.totalPfValue =
    body?.VDapplied && body?.VDDetails?.pfRate
      ? body?.VDDetails?.pfRate
      : body?.cartValue?.pfRate;

  // Grand Total Calculation
  body.calculatedTotal =
    body?.VDapplied && body?.VDDetails.grandTotal
      ? body?.VDDetails.grandTotal
      : body?.cartValue?.grandTotal;
  body.roundingAdjustment = values?.VDapplied
    ? values.VDDetails.roundingAdjustment && values.VDDetails.roundingAdjustment
    : values.cartValue.roundingAdjustment;
  body.grandTotal = values?.VDapplied
    ? values.VDDetails.grandTotal && values.VDDetails.grandTotal
    : values.cartValue.grandTotal;

  body.versionLevelVolumeDisscount = some(body.dbProductDetails, [
    "volumeDiscountApplied",
    true,
  ]);
  body.subtotal_bc = body.subtotal_bc ? body.subtotal_bc : null;

  body.domainURL = typeof window !== "undefined" ? window.location.origin : "";
  body.modifiedByUsername = displayName
    ? displayName
    : "" + ", " + companyName
      ? companyName
      : "";
  body.buyerCurrency = values.buyerCurrencyId;
  body.buyerCurrencyId = values.buyerCurrencyId?.id;
  body.payerCode = body.registerAddressDetails?.soldToCode;
  body.payerBranchName = body.registerAddressDetails?.branchName;

  const quoteUserIds = map(
    overViewValues.quoteUsers,
    (user: any) => user?.id || user?.userId
  );
  body.quoteUsers = quoteUserIds;
  body.deletableQuoteUsers = [];
  body.quoteDivisionId = overViewValues?.quoteDivisionId
    ? parseInt(overViewValues?.quoteDivisionId.id)
    : null;
  body.orderTypeId = overViewValues?.orderType
    ? parseInt(overViewValues.orderType?.id)
    : null;
  const tagsId = map(overViewValues.tagsList, (tag: any) => tag.id);
  body.tagsList = tagsId;
  body.deletableTagsList = [];

  // For brbu we use branchBussinessUnit param alone (not branchBusinessUnitId)
  body.branchBusinessUnitId = values.branchBusinessUnit
    ? values.branchBusinessUnit.id
    : "";
  body.branchBusinessUnit = values.branchBusinessUnit
    ? values.branchBusinessUnit.id
    : "";
  body.dbProductDetails = map(values?.dbProductDetails, (prod: any) => {
    return {
      ...prod,
      unitListPrice:
        !prod.showPrice || prod.priceNotAvailable
          ? prod.unitLPRp
          : prod.unitListPrice,
      accountOwnerId: prod.accountOwner ? parseInt(prod.accountOwner.id) : null,
      businessUnitId: prod?.businessUnit?.id || null,
      divisionId: prod?.division ? parseInt(prod.division.id) : null,
      lineNo: prod.new ? null : prod.lineNo,
      itemNo: prod.new ? null : prod.itemNo,
      pfPercentage: body.pfRate
        ? body.pfRate
        : body.quoteTerms
          ? body.quoteTerms.pfPercentage
          : null,
      pfValue: body.quoteTerms?.pfValue || body.pfRate ? body.pfRate : null,
      orderWareHouseId: prod?.wareHouse?.id,
      orderWareHouseName: prod?.wareHouse?.wareHouseName,
      productTaxes: body.isInter ? prod.interTaxBreakup : prod.intraTaxBreakup,
      productDiscounts: prod?.discountDetails?.discountId
        ? [
            {
              id: null,
              discounId: prod?.discountDetails?.discountId,
              discounCode: null,
              orderProduct: null,
              discountPercentage: prod?.discountDetails?.Value,
            },
          ]
        : [],
      bundleProducts:
        prod?.bundleProducts?.length > 0
          ? formBundleProductsPayload(prod.bundleProducts)
          : [],
      showPrice: prod?.showPrice && !prod?.priceNotAvailable,
    };
  });

  if (isPlaceOrder) {
    body.approvalInitiated = overViewValues.approvalInitiated;
    body.approvalGroupId = body.approvalGroupId ? body.approvalGroupId?.id : {};
    body.orderDivisionId = body.quoteDivisionId;
    body.isInternal = false;
    body.internal = false;
    body.sellerInternal = false;
    body["orderTerms"] = body["quoteTerms"];
    body["orderUsers"] = body["quoteUsers"];
    body["deletableOrderUsers"] = [];
    body.orderName = overViewValues?.quotationDetails[0]?.quoteName;
    body.reorder = false;
    body.reorderValidityFrom = overViewValues.validityFrom;
    body.reorderValidityTill = overViewValues.validityTill;
  } else {
    body.quoteName = overViewValues?.quotationDetails[0]?.quoteName;
  }

  body.dbProductDetails = [
    ...body.dbProductDetails,
    ...values.removedDbProductDetails,
  ];
  body.dbProductDetails.forEach((item: any) => {
    item.productDiscounts =
      (item?.productDiscounts || [])?.length > 0 ? item?.productDiscounts : [];
    item.bundleProducts =
      item?.bundleProducts?.length > 0
        ? formBundleProductsPayload(item.bundleProducts)
        : [];
    return item;
  });
  return body;
};

/**
 * Transform order data for payment/update operations
 * Used when editing existing orders or making payments
 */
export const orderPaymentDTO = (
  values: any,
  overviewValues: any,
  previousVersionDetails: any,
  initialValues: any,
  displayName: string,
  companyName: string,
  totalPaid: number,
  isReorder: boolean
) => {
  const defaultValues = initialValues.orderDetails[0];
  values.versionCreatedTimestamp = new Date().toISOString();
  values.uploadedDocumentDetails =
    overviewValues?.uploadedDocumentDetails || [];
  values.domainURL =
    typeof window !== "undefined" ? window.location.origin : "";
  values.modifiedByUsername = displayName
    ? displayName
    : "" + ", " + companyName
      ? companyName
      : "";
  const orderBody = cloneDeep(values);
  orderBody.buyerReferenceNumber = overviewValues?.buyerReferenceNumber;
  orderBody.comment = trim(overviewValues?.comment) || null;
  orderBody.payerCode = values.registerAddressDetails?.soldToCode;
  orderBody.payerBranchName = values.registerAddressDetails?.branchName;
  orderBody.buyerCurrencyId = values.buyerCurrencyId.id;
  orderBody.buyerCurrency = values.buyerCurrencyId;
  orderBody.subTotal = values?.VDapplied
    ? values.VDDetails.subTotalVolume && values.VDDetails.subTotal
    : values.cartValue.totalValue;
  orderBody.subTotal_bc = "";
  orderBody.subTotalWithVD = values.VDDetails.subTotalVolume;
  orderBody.totalPfValue = values?.cartValue?.pfRate;

  orderBody.overallTax = values?.VDapplied
    ? values.VDDetails.subTotalVolume && values.VDDetails.overallTax
    : values.cartValue.totalTax;
  orderBody.taxableAmount = values?.VDapplied
    ? values.VDDetails.taxableAmount && values.VDDetails.taxableAmount
    : values.cartValue.taxableAmount;

  // Grand Total Calculation
  orderBody.calculatedTotal = values?.VDapplied
    ? values.VDDetails.calculatedTotal && values.VDDetails.calculatedTotal
    : values.cartValue.calculatedTotal;
  orderBody.roundingAdjustment = values?.VDapplied
    ? values.VDDetails.roundingAdjustment && values.VDDetails.roundingAdjustment
    : values.cartValue.roundingAdjustment;
  orderBody.grandTotal = values?.VDapplied
    ? values.VDDetails.grandTotal && values.VDDetails.grandTotal
    : values.cartValue.grandTotal;
  orderBody.versionLevelVolumeDisscount = some(values.dbProductDetails, [
    "volumeDiscountApplied",
    true,
  ]);
  orderBody.totalLP = orderBody?.cartValue?.totalLP;
  if (!isReorder) {
    orderBody.cartValue = {
      ...orderBody.cartValue,
      grandTotal: orderBody.cartValue.grandTotal - totalPaid,
      totalItems: orderBody.cartValue.totalItems,
      totalLP: orderBody.cartValue.totalLP,
      totalTax:
        totalPaid > 0
          ? previousVersionDetails
            ? orderBody.cartValue.totalTax - previousVersionDetails.overallTax
            : orderBody.cartValue.totalTax - defaultValues.cartValue.totalTax
          : orderBody.cartValue.totalTax,
      totalValue:
        totalPaid > 0
          ? previousVersionDetails
            ? orderBody.cartValue.totalValue - previousVersionDetails.subTotal
            : orderBody.cartValue.totalValue -
              defaultValues.cartValue.totalValue
          : orderBody.cartValue.totalValue,
      totalShipping:
        totalPaid > 0
          ? previousVersionDetails
            ? orderBody.cartValue.totalShipping -
              previousVersionDetails.overallShipping
            : orderBody.cartValue.totalShipping -
              defaultValues.cartValue.totalShipping
          : orderBody.cartValue.totalShipping,
      pfRate:
        totalPaid > 0
          ? previousVersionDetails
            ? orderBody.cartValue.pfRate - previousVersionDetails.totalPfValue
            : orderBody.cartValue.pfRate - defaultValues.cartValue.pfRate
          : orderBody.cartValue.pfRate,
    };
  }

  orderBody.totalPaid = totalPaid;
  const quoteUserIds = map(
    overviewValues.orderUsers,
    (user: any) => user?.id || user?.userId
  );
  orderBody.orderUsers = quoteUserIds;
  orderBody.deletableOrderUsers = [];
  orderBody.orderDivisionId = overviewValues?.orderDivisionId
    ? overviewValues?.orderDivisionId?.id
    : overviewValues?.orderDivisionId;
  orderBody.orderTypeId = overviewValues.orderType
    ? parseInt(overviewValues.orderType.id)
    : null;
  const tagId = map(overviewValues?.tagsList, (tag: any) => tag.id);
  orderBody.tagsList = tagId;
  orderBody.deletableTagsList = [];

  // For brbu we use branchBussinessUnit param alone
  orderBody.branchBusinessUnit = values.branchBusinessUnit
    ? values.branchBusinessUnit.id
    : "";
  orderBody.branchBusinessUnitId = values.branchBusinessUnit
    ? values.branchBusinessUnit.id
    : "";
  let dbProductDetails = map(values?.dbProductDetails, (prod: any) => {
    return {
      ...prod,
      accountOwnerId: prod?.accountOwner
        ? parseInt(prod.accountOwner.id)
        : null,
      businessUnitId: prod.businessUnit ? prod.businessUnit.id : "",
      divisionId: prod?.division ? parseInt(prod.division.id) : null,
      lineNo: prod.new ? null : prod.lineNo,
      itemNo: prod.new ? null : prod.itemNo,
      pfValue: null, //hardcoded to null, due to pf issue.
      pfPercentage:
        values?.orderTerms.pfPercentage || values?.pfRate
          ? values?.pfRate
          : null,
      tentativeDeliveryDate: prod.tentativeDeliveryDate
        ? prod.tentativeDeliveryDate
        : null,
      orderWareHouseId: prod?.wareHouse?.id,
      orderWareHouseName: prod?.wareHouse?.wareHouseName,
      productTaxes: orderBody.isInter
        ? prod.interTaxBreakup
        : prod.intraTaxBreakup,
      productDiscounts: prod?.discountDetails?.discountId
        ? [
            {
              id: null,
              discounId: prod?.discountDetails?.discountId,
              discounCode: null,
              orderProduct: null,
              discountPercentage: prod?.discountDetails?.Value,
            },
          ]
        : [],
      bundleProducts:
        prod?.bundleProducts?.length > 0
          ? formBundleProductsPayload(prod.bundleProducts)
          : [],
    };
  });
  if (isReorder) {
    orderBody.dbProductDetails = [...dbProductDetails];
  } else {
    orderBody.dbProductDetails = [
      ...dbProductDetails,
      ...values.removedDbProductDetails,
    ];
  }

  orderBody.dbProductDetails.forEach((item: any) => {
    item.productDiscounts =
      (item?.productDiscounts || [])?.length > 0 ? item?.productDiscounts : [];
    item.bundleProducts =
      item?.bundleProducts?.length > 0
        ? formBundleProductsPayload(item.bundleProducts)
        : [];
    return item;
  });

  return orderBody;
};

/**
 * Validation interface for place order action
 */
export interface PlaceOrderValidation {
  isValid: boolean;
  message?: string;
  variant?: "info" | "error" | "warning" | "success";
}

/**
 * Validate if quote can be converted to order
 * @param quoteData - Quote data to validate
 * @returns Validation result
 */
export const validatePlaceOrder = (quoteData: {
  updatedBuyerStatus: string;
  validityTill?: string;
  reorder?: boolean;
}): PlaceOrderValidation => {
  const { updatedBuyerStatus, validityTill, reorder } = quoteData;

  // Check if quote is cancelled
  if (updatedBuyerStatus === "CANCELLED") {
    return {
      isValid: false,
      message: "Quote was cancelled already",
      variant: "info",
    };
  }

  // Check validity expiration
  if (validityTill && new Date() > new Date(validityTill)) {
    return {
      isValid: false,
      message: "Contract validity expired",
      variant: "info",
    };
  }

  // Check if quote is in OPEN status
  if (updatedBuyerStatus === "OPEN") {
    return {
      isValid: false,
      message:
        "Quote owner is working on this quote, wait for quote owner to respond",
      variant: "info",
    };
  }

  // Check if already converted to order
  if (updatedBuyerStatus === "ORDER PLACED") {
    return {
      isValid: false,
      message: "Quote was converted to order already",
      variant: "info",
    };
  }

  // Valid scenarios: reorder within validity or QUOTE RECEIVED status
  if (
    (reorder && validityTill && new Date() < new Date(validityTill)) ||
    updatedBuyerStatus === "QUOTE RECEIVED"
  ) {
    return {
      isValid: true,
    };
  }

  // Default case - quote owner is working on it
  return {
    isValid: false,
    message: "Quote owner is working on this quote",
    variant: "info",
  };
};
