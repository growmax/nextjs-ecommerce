import cloneDeep from "lodash/cloneDeep";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import map from "lodash/map";
import some from "lodash/some";
import trim from "lodash/trim";

import type { CartItem } from "@/types/calculation/cart";

// Bundle product structure for payload
interface BundleProductPayload {
  bundleSelected?: number;
  isBundleSelected_fe?: number;
  [key: string]: unknown;
}

// Form bundle products payload
export const formBundleProductsPayload = (
  bundleArray: BundleProductPayload[]
): BundleProductPayload[] => {
  forEach(bundleArray, bp => {
    bp.bundleSelected = bp.bundleSelected ? 1 : 0;
    bp.isBundleSelected_fe = bp.isBundleSelected_fe ? 1 : 0;
  });

  return filter(bundleArray, bp => Boolean(bp?.isBundleSelected_fe));
};

// Quotation payment DTO interface
interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
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
  [key: string]: unknown;
}

interface QuotationPaymentDTOParams {
  values: {
    dbProductDetails: CartItem[];
    removedDbProductDetails?: CartItem[];
    VDapplied?: boolean;
    VDDetails?: {
      subTotal?: number;
      subTotalVolume?: number;
      overallTax?: number;
      taxableAmount?: number;
      calculatedTotal?: number;
      roundingAdjustment?: number;
      grandTotal?: number;
    };
    cartValue?: {
      totalValue?: number;
      totalTax?: number;
      taxableAmount?: number;
      calculatedTotal?: number;
      roundingAdjustment?: number;
      grandTotal?: number;
      totalLP?: number;
      pfRate?: number;
      totalShipping?: number;
      totalItems?: number;
    };
    buyerCurrencyId?: {
      id: number;
      [key: string]: unknown;
    };
    registerAddressDetails?: AddressDetails;
    billingAddressDetails?: AddressDetails;
    shippingAddressDetails?: AddressDetails;
    sellerAddressDetail?: AddressDetails;
    buyerBranchId?: number;
    buyerBranchName?: string;
    buyerCompanyId?: number;
    buyerCompanyName?: string;
    sellerBranchId?: number;
    sellerBranchName?: string;
    sellerCompanyId?: number;
    sellerCompanyName?: string;
    customerRequiredDate?: string;
    branchBusinessUnit?: {
      id: number;
      [key: string]: unknown;
    };
    quoteTerms?: {
      pfPercentage?: number;
      pfValue?: number;
      [key: string]: unknown;
    };
    pfRate?: number;
    isInter?: boolean;
    [key: string]: unknown;
  };
  overviewValues: {
    buyerReferenceNumber?: string;
    comment?: string;
    uploadedDocumentDetails?: unknown[];
    quoteUsers?: Array<{ id?: number; userId?: number }>;
    quoteDivisionId?: { id: number } | number;
    quoteType?: { id: number };
    tagsList?: Array<{ id: number }>;
    [key: string]: unknown;
  };
  previousVersionDetails?: {
    overallTax?: number;
    subTotal?: number;
    overallShipping?: number;
    totalPfValue?: number;
  };
  initialValues?: {
    quotationDetails: Array<{
      cartValue?: {
        totalTax?: number;
        totalValue?: number;
        totalShipping?: number;
        pfRate?: number;
      };
      billingAddressDetails?: AddressDetails;
      shippingAddressDetails?: AddressDetails;
      registerAddressDetails?: AddressDetails;
      sellerAddressDetail?: AddressDetails;
      buyerBranchId?: number;
      buyerBranchName?: string;
      buyerCompanyId?: number;
      buyerCompanyName?: string;
      sellerBranchId?: number;
      sellerBranchName?: string;
      sellerCompanyId?: number;
      sellerCompanyName?: string;
      customerRequiredDate?: string;
      [key: string]: unknown;
    }>;
  };
  displayName?: string;
  companyName?: string;
}

/**
 * Convert quotation data to payment DTO format for API submission
 */
export const quotationPaymentDTO = (
  params: QuotationPaymentDTOParams
): Record<string, unknown> => {
  const { values, overviewValues, initialValues, displayName, companyName } =
    params;

  const quoteBody = cloneDeep(values) as Record<string, unknown>;

  // Set version timestamp
  quoteBody.versionCreatedTimestamp = new Date().toISOString();

  // Set uploaded documents
  quoteBody.uploadedDocumentDetails =
    overviewValues?.uploadedDocumentDetails || [];

  // Set domain URL
  quoteBody.domainURL =
    typeof window !== "undefined" ? window.location.origin : "";

  // Set modified by username
  quoteBody.modifiedByUsername = `${displayName || ""}, ${companyName || ""}`
    .trim()
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "");

  // Get first quotation detail for fallback values
  const firstQuoteDetail = initialValues?.quotationDetails?.[0];

  // Set buyer reference number and comment
  quoteBody.buyerReferenceNumber =
    overviewValues?.buyerReferenceNumber ||
    firstQuoteDetail?.buyerReferenceNumber ||
    null;
  quoteBody.comment =
    trim(overviewValues?.comment || "") || firstQuoteDetail?.comment || null;

  // Set payer code and branch name
  quoteBody.payerCode = values.registerAddressDetails?.soldToCode;
  quoteBody.payerBranchName = values.registerAddressDetails?.branchName;

  // Set buyer branch ID
  if (values.buyerBranchId) {
    quoteBody.buyerBranchId = values.buyerBranchId;
  } else if (values.registerAddressDetails?.branchId) {
    quoteBody.buyerBranchId = values.registerAddressDetails.branchId;
  }

  // Helper function to format address details
  const formatAddressDetails = (
    address: AddressDetails | undefined
  ): Record<string, unknown> | undefined => {
    if (!address) return undefined;
    return {
      addressLine: address.addressLine || "",
      branchName: address.branchName || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "",
      countryCode: address.countryCode || "",
      pinCodeId: address.pinCodeId || address.pincode || "",
      gst: address.gst || "",
      district: address.district || "",
      locality: address.locality || "",
      mobileNo: address.mobileNo || "",
      phone: address.phone || "",
      email: address.email || null,
      billToCode: address.billToCode || null,
      shipToCode: address.shipToCode || null,
      soldToCode: address.soldToCode || null,
    };
  };

  // Register Address Details
  if (values.registerAddressDetails) {
    quoteBody.registerAddressDetails = formatAddressDetails(
      values.registerAddressDetails
    );
  } else if (firstQuoteDetail?.registerAddressDetails) {
    quoteBody.registerAddressDetails = formatAddressDetails(
      firstQuoteDetail.registerAddressDetails
    );
  }

  // Billing Address Details
  if (values.billingAddressDetails) {
    quoteBody.billingAddressDetails = formatAddressDetails(
      values.billingAddressDetails
    );
  } else if (firstQuoteDetail?.billingAddressDetails) {
    quoteBody.billingAddressDetails = formatAddressDetails(
      firstQuoteDetail.billingAddressDetails
    );
  }

  // Shipping Address Details
  if (values.shippingAddressDetails) {
    quoteBody.shippingAddressDetails = formatAddressDetails(
      values.shippingAddressDetails
    );
  } else if (firstQuoteDetail?.shippingAddressDetails) {
    quoteBody.shippingAddressDetails = formatAddressDetails(
      firstQuoteDetail.shippingAddressDetails
    );
  }

  // Seller Address Details
  if (values.sellerAddressDetail) {
    const sellerAddress = formatAddressDetails(values.sellerAddressDetail);
    if (sellerAddress) {
      sellerAddress.sellerCompanyName =
        values.sellerAddressDetail.sellerCompanyName || "";
      sellerAddress.sellerBranchName =
        values.sellerAddressDetail.sellerBranchName || "";
      quoteBody.sellerAddressDetail = sellerAddress;
    }
  } else if (firstQuoteDetail?.sellerAddressDetail) {
    quoteBody.sellerAddressDetail = formatAddressDetails(
      firstQuoteDetail.sellerAddressDetail
    );
  }

  // Set buyer/seller company and branch information
  quoteBody.buyerBranchId =
    values.buyerBranchId || firstQuoteDetail?.buyerBranchId;
  quoteBody.buyerBranchName =
    values.buyerBranchName || firstQuoteDetail?.buyerBranchName || "";
  quoteBody.buyerCompanyId =
    values.buyerCompanyId || firstQuoteDetail?.buyerCompanyId;
  quoteBody.buyerCompanyName =
    values.buyerCompanyName || firstQuoteDetail?.buyerCompanyName || "";
  quoteBody.sellerBranchId =
    values.sellerBranchId || firstQuoteDetail?.sellerBranchId;
  quoteBody.sellerBranchName =
    values.sellerBranchName || firstQuoteDetail?.sellerBranchName || "";
  quoteBody.sellerCompanyId =
    values.sellerCompanyId || firstQuoteDetail?.sellerCompanyId;
  quoteBody.sellerCompanyName =
    values.sellerCompanyName || firstQuoteDetail?.sellerCompanyName || "";

  // Set customer required date
  if (values.customerRequiredDate) {
    quoteBody.customerRequiredDate = values.customerRequiredDate;
  } else if (firstQuoteDetail?.customerRequiredDate) {
    quoteBody.customerRequiredDate = firstQuoteDetail.customerRequiredDate;
  }

  // Set buyer currency
  quoteBody.buyerCurrencyId = values.buyerCurrencyId?.id
    ? parseInt(values.buyerCurrencyId.id.toString())
    : (firstQuoteDetail?.buyerCurrencyId as number) || undefined;
  quoteBody.buyerCurrency = (values.buyerCurrencyId ||
    firstQuoteDetail?.buyerCurrency) as unknown;

  // Set isInter flag
  quoteBody.isInter =
    values.isInter !== undefined
      ? values.isInter
      : (firstQuoteDetail?.isInter as boolean) || false;

  // Calculate financial values
  quoteBody.subTotal = values?.VDapplied
    ? values.VDDetails?.subTotalVolume && values.VDDetails?.subTotal
    : values.cartValue?.totalValue;

  quoteBody.subTotal_bc = "";
  quoteBody.subTotalWithVD = values.VDDetails?.subTotalVolume;

  quoteBody.totalPfValue = values?.cartValue?.pfRate;

  quoteBody.overallTax = values?.VDapplied
    ? values.VDDetails?.subTotalVolume && values.VDDetails?.overallTax
    : values.cartValue?.totalTax;

  quoteBody.taxableAmount = values?.VDapplied
    ? values.VDDetails?.taxableAmount && values.VDDetails?.taxableAmount
    : values.cartValue?.taxableAmount;

  // Grand Total Calculation
  quoteBody.calculatedTotal = values?.VDapplied
    ? values.VDDetails?.calculatedTotal && values.VDDetails?.calculatedTotal
    : values.cartValue?.calculatedTotal;

  quoteBody.roundingAdjustment = values?.VDapplied
    ? values.VDDetails?.roundingAdjustment &&
      values.VDDetails?.roundingAdjustment
    : values.cartValue?.roundingAdjustment;

  quoteBody.grandTotal = values?.VDapplied
    ? values.VDDetails?.grandTotal && values.VDDetails?.grandTotal
    : values.cartValue?.grandTotal;

  quoteBody.versionLevelVolumeDisscount = some(values.dbProductDetails, [
    "volumeDiscountApplied",
    true,
  ]);

  quoteBody.totalLP = (quoteBody?.cartValue as { totalLP?: number })?.totalLP;

  // Map quote users
  const quoteUsersSource =
    overviewValues?.quoteUsers || firstQuoteDetail?.quoteUsers || [];
  const quoteUserIds = map(
    Array.isArray(quoteUsersSource) ? quoteUsersSource : [],
    user => {
      if (typeof user === "number") return user;
      if (typeof user === "object" && user !== null) {
        return user?.id || user?.userId || user;
      }
      return user;
    }
  ).filter(id => id !== null && id !== undefined);
  quoteBody.quoteUsers = quoteUserIds.length > 0 ? quoteUserIds : [];
  quoteBody.deletableQuoteUsers = [];

  // Set quote division ID
  const quoteDivisionSource =
    overviewValues?.quoteDivisionId !== undefined &&
    overviewValues?.quoteDivisionId !== null
      ? overviewValues.quoteDivisionId
      : firstQuoteDetail?.quoteDivisionId;

  if (quoteDivisionSource !== undefined && quoteDivisionSource !== null) {
    if (
      typeof quoteDivisionSource === "object" &&
      quoteDivisionSource !== null &&
      "id" in quoteDivisionSource
    ) {
      quoteBody.quoteDivisionId = (quoteDivisionSource as { id: number }).id;
    } else {
      quoteBody.quoteDivisionId = quoteDivisionSource as number;
    }
  } else {
    quoteBody.quoteDivisionId = undefined;
  }

  // Set quote type ID
  const quoteTypeSource =
    overviewValues?.quoteType || firstQuoteDetail?.quoteType || null;

  if (quoteTypeSource) {
    if (
      typeof quoteTypeSource === "object" &&
      quoteTypeSource !== null &&
      "id" in quoteTypeSource
    ) {
      quoteBody.quoteTypeId = parseInt(
        (quoteTypeSource as { id: number }).id.toString()
      );
    } else if (typeof quoteTypeSource === "number") {
      quoteBody.quoteTypeId = quoteTypeSource;
    } else {
      quoteBody.quoteTypeId = null;
    }
  } else {
    quoteBody.quoteTypeId = null;
  }

  // Map tags
  const tagsSource =
    overviewValues?.tagsList || firstQuoteDetail?.tagsList || [];
  const tagId = map(Array.isArray(tagsSource) ? tagsSource : [], tag => {
    if (typeof tag === "number") return tag;
    if (typeof tag === "object" && tag !== null && "id" in tag) {
      return tag.id;
    }
    return tag;
  }).filter(id => id !== null && id !== undefined);
  quoteBody.tagsList = tagId.length > 0 ? tagId : [];
  quoteBody.deletableTagsList = [];

  // Set branch business unit
  quoteBody.branchBusinessUnit = (
    values.branchBusinessUnit ? values.branchBusinessUnit.id : ""
  ) as unknown;
  quoteBody.branchBusinessUnitId = (
    values.branchBusinessUnit ? values.branchBusinessUnit.id : ""
  ) as unknown;

  // Map product details
  const dbProductDetails = map(values?.dbProductDetails || [], prod => {
    return {
      ...prod,
      accountOwnerId: prod?.accountOwner
        ? parseInt((prod.accountOwner as { id: number }).id.toString())
        : null,
      businessUnitId: (prod.businessUnit as { id: number })?.id || "",
      divisionId: prod?.division
        ? parseInt((prod.division as { id: number }).id.toString())
        : null,

      lineNo: (prod as { new?: boolean; lineNo?: number }).new
        ? null
        : ((prod as { lineNo?: number }).lineNo ?? null),
      itemNo: (prod as { new?: boolean; itemNo?: number }).new
        ? null
        : ((prod as { itemNo?: number }).itemNo ?? null),

      pfValue: null,
      pfPercentage:
        values?.quoteTerms?.pfPercentage || values?.pfRate
          ? values?.pfRate
          : null,

      tentativeDeliveryDate:
        (prod as { tentativeDeliveryDate?: string }).tentativeDeliveryDate ||
        null,

      orderWareHouseId: (prod?.wareHouse as { id: number })?.id || null,
      orderWareHouseName:
        (prod?.wareHouse as { wareHouseName?: string })?.wareHouseName || null,

      productTaxes: quoteBody.isInter
        ? (prod as { interTaxBreakup?: unknown[] }).interTaxBreakup || []
        : (prod as { intraTaxBreakup?: unknown[] }).intraTaxBreakup || [],

      productDiscounts: (
        prod as { discountDetails?: { discountId?: string; Value?: number } }
      )?.discountDetails?.discountId
        ? [
            {
              id: null,
              discounId: (prod as { discountDetails?: { discountId?: string } })
                .discountDetails?.discountId,
              discounCode: null,
              orderProduct: null,
              discountPercentage: (
                prod as { discountDetails?: { Value?: number } }
              ).discountDetails?.Value,
            },
          ]
        : [],

      bundleProducts: (() => {
        const bundleProds = (prod as { bundleProducts?: unknown[] })
          .bundleProducts;
        if (Array.isArray(bundleProds) && bundleProds.length > 0) {
          return formBundleProductsPayload(
            bundleProds as unknown as BundleProductPayload[]
          );
        }
        return [];
      })(),
    };
  });

  quoteBody.dbProductDetails = [
    ...dbProductDetails,
    ...(values.removedDbProductDetails || []),
  ];

  // Ensure product discounts and bundle products are properly formatted
  const dbProductDetailsArray = (quoteBody.dbProductDetails || []) as Array<{
    productDiscounts?: unknown[];
    bundleProducts?: unknown[];
  }>;
  dbProductDetailsArray.forEach(product => {
    product.productDiscounts =
      (product?.productDiscounts?.length || 0) > 0
        ? (product.productDiscounts as unknown[])
        : ([] as unknown[]);
    product.bundleProducts =
      (product?.bundleProducts?.length || 0) > 0
        ? formBundleProductsPayload(
            product.bundleProducts as unknown as BundleProductPayload[]
          )
        : ([] as unknown[]);
  });

  // Preserve additional fields from firstQuoteDetail
  if (firstQuoteDetail) {
    if (firstQuoteDetail.shippingAddressId && !quoteBody.shippingAddressId) {
      quoteBody.shippingAddressId = firstQuoteDetail.shippingAddressId;
    }

    if (
      firstQuoteDetail.shippingIncluded !== undefined &&
      quoteBody.shippingIncluded === undefined
    ) {
      quoteBody.shippingIncluded = firstQuoteDetail.shippingIncluded;
    }

    if (
      firstQuoteDetail.quotationDescription &&
      !quoteBody.quotationDescription
    ) {
      quoteBody.quotationDescription = firstQuoteDetail.quotationDescription;
    }

    if (firstQuoteDetail.quoteName && !quoteBody.quoteName) {
      quoteBody.quoteName = firstQuoteDetail.quoteName;
    }

    if (
      values.quoteTerms &&
      typeof values.quoteTerms === "object" &&
      "additionalTerms" in values.quoteTerms
    ) {
      quoteBody.additionalTerms =
        (values.quoteTerms as { additionalTerms?: string }).additionalTerms ||
        "";
    } else if (
      firstQuoteDetail.quoteTerms &&
      typeof firstQuoteDetail.quoteTerms === "object" &&
      "additionalTerms" in firstQuoteDetail.quoteTerms
    ) {
      quoteBody.additionalTerms =
        (firstQuoteDetail.quoteTerms as { additionalTerms?: string })
          .additionalTerms || "";
    }

    if (
      firstQuoteDetail.overallShipping !== undefined &&
      quoteBody.overallShipping === undefined
    ) {
      quoteBody.overallShipping = firstQuoteDetail.overallShipping;
    }

    if (firstQuoteDetail.salesBranchCode && !quoteBody.salesBranchCode) {
      quoteBody.salesBranchCode = firstQuoteDetail.salesBranchCode;
    }
    if (firstQuoteDetail.salesOrgCode && !quoteBody.salesOrgCode) {
      quoteBody.salesOrgCode = firstQuoteDetail.salesOrgCode;
    }
  }

  return quoteBody;
};
