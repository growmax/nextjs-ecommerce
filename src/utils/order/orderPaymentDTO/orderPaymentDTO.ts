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

// Order payment DTO interface
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

interface OrderPaymentDTOParams {
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
    orderTerms?: {
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
    orderUsers?: Array<{ id?: number; userId?: number }>;
    orderDivisionId?: { id: number } | number;
    orderType?: { id: number };
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
    orderDetails: Array<{
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
  totalPaid?: number;
  isReorder?: boolean;
}

/**
 * Convert order data to payment DTO format for API submission
 */
export const orderPaymentDTO = (
  params: OrderPaymentDTOParams
): Record<string, unknown> => {
  const {
    values,
    overviewValues,
    previousVersionDetails,
    initialValues,
    displayName,
    companyName,
    totalPaid = 0,
    isReorder = false,
  } = params;

  const defaultValues = initialValues?.orderDetails?.[0];
  const orderBody = cloneDeep(values) as Record<string, unknown>;

  // Set version timestamp
  orderBody.versionCreatedTimestamp = new Date().toISOString();

  // Set uploaded documents
  orderBody.uploadedDocumentDetails =
    overviewValues?.uploadedDocumentDetails || [];

  // Set domain URL
  orderBody.domainURL =
    typeof window !== "undefined" ? window.location.origin : "";

  // Set modified by username
  orderBody.modifiedByUsername = `${displayName || ""}, ${companyName || ""}`
    .trim()
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "");

  // Get first order detail for fallback values
  const firstOrderDetail = initialValues?.orderDetails?.[0];

  // Set buyer reference number and comment
  // Use edited value if provided, otherwise use original from firstOrderDetail
  orderBody.buyerReferenceNumber =
    overviewValues?.buyerReferenceNumber ||
    firstOrderDetail?.buyerReferenceNumber ||
    null;
  orderBody.comment =
    trim(overviewValues?.comment || "") || firstOrderDetail?.comment || null;

  // Set payer code and branch name
  orderBody.payerCode = values.registerAddressDetails?.soldToCode;
  orderBody.payerBranchName = values.registerAddressDetails?.branchName;

  // Set buyer branch ID - API requires this for branch information
  if (values.buyerBranchId) {
    orderBody.buyerBranchId = values.buyerBranchId;
  } else if (values.registerAddressDetails?.branchId) {
    orderBody.buyerBranchId = values.registerAddressDetails.branchId;
  }

  // Helper function to format address details
  // Note: API accepts null for optional fields, so we use null instead of undefined
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

  // Register Address Details (payer address)
  if (values.registerAddressDetails) {
    orderBody.registerAddressDetails = formatAddressDetails(
      values.registerAddressDetails
    );
  } else if (firstOrderDetail?.registerAddressDetails) {
    orderBody.registerAddressDetails = formatAddressDetails(
      firstOrderDetail.registerAddressDetails
    );
  }

  // Billing Address Details
  if (values.billingAddressDetails) {
    orderBody.billingAddressDetails = formatAddressDetails(
      values.billingAddressDetails
    );
  } else if (firstOrderDetail?.billingAddressDetails) {
    orderBody.billingAddressDetails = formatAddressDetails(
      firstOrderDetail.billingAddressDetails
    );
  }

  // Shipping Address Details
  if (values.shippingAddressDetails) {
    orderBody.shippingAddressDetails = formatAddressDetails(
      values.shippingAddressDetails
    );
  } else if (firstOrderDetail?.shippingAddressDetails) {
    orderBody.shippingAddressDetails = formatAddressDetails(
      firstOrderDetail.shippingAddressDetails
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
      orderBody.sellerAddressDetail = sellerAddress;
    }
  } else if (firstOrderDetail?.sellerAddressDetail) {
    orderBody.sellerAddressDetail = formatAddressDetails(
      firstOrderDetail.sellerAddressDetail
    );
  }

  // Set buyer/seller company and branch information
  orderBody.buyerBranchId =
    values.buyerBranchId || firstOrderDetail?.buyerBranchId;
  orderBody.buyerBranchName =
    values.buyerBranchName || firstOrderDetail?.buyerBranchName || "";
  orderBody.buyerCompanyId =
    values.buyerCompanyId || firstOrderDetail?.buyerCompanyId;
  orderBody.buyerCompanyName =
    values.buyerCompanyName || firstOrderDetail?.buyerCompanyName || "";
  orderBody.sellerBranchId =
    values.sellerBranchId || firstOrderDetail?.sellerBranchId;
  orderBody.sellerBranchName =
    values.sellerBranchName || firstOrderDetail?.sellerBranchName || "";
  orderBody.sellerCompanyId =
    values.sellerCompanyId || firstOrderDetail?.sellerCompanyId;
  orderBody.sellerCompanyName =
    values.sellerCompanyName || firstOrderDetail?.sellerCompanyName || "";

  // Set customer required date
  if (values.customerRequiredDate) {
    orderBody.customerRequiredDate = values.customerRequiredDate;
  } else if (firstOrderDetail?.customerRequiredDate) {
    orderBody.customerRequiredDate = firstOrderDetail.customerRequiredDate;
  }

  // Set buyer currency - ensure buyerCurrencyId is a number and buyerCurrency is the full object
  orderBody.buyerCurrencyId = values.buyerCurrencyId?.id
    ? parseInt(values.buyerCurrencyId.id.toString())
    : (firstOrderDetail?.buyerCurrencyId as number) || undefined;
  orderBody.buyerCurrency = (values.buyerCurrencyId ||
    firstOrderDetail?.buyerCurrency) as unknown;

  // Set isInter flag - required for determining tax breakup
  orderBody.isInter =
    values.isInter !== undefined
      ? values.isInter
      : (firstOrderDetail?.isInter as boolean) || false;

  // Calculate financial values
  orderBody.subTotal = values?.VDapplied
    ? values.VDDetails?.subTotalVolume && values.VDDetails?.subTotal
    : values.cartValue?.totalValue;

  orderBody.subTotal_bc = "";
  orderBody.subTotalWithVD = values.VDDetails?.subTotalVolume;

  orderBody.totalPfValue = values?.cartValue?.pfRate;

  orderBody.overallTax = values?.VDapplied
    ? values.VDDetails?.subTotalVolume && values.VDDetails?.overallTax
    : values.cartValue?.totalTax;

  orderBody.taxableAmount = values?.VDapplied
    ? values.VDDetails?.taxableAmount && values.VDDetails?.taxableAmount
    : values.cartValue?.taxableAmount;

  // Grand Total Calculation
  orderBody.calculatedTotal = values?.VDapplied
    ? values.VDDetails?.calculatedTotal && values.VDDetails?.calculatedTotal
    : values.cartValue?.calculatedTotal;

  orderBody.roundingAdjustment = values?.VDapplied
    ? values.VDDetails?.roundingAdjustment &&
      values.VDDetails?.roundingAdjustment
    : values.cartValue?.roundingAdjustment;

  orderBody.grandTotal = values?.VDapplied
    ? values.VDDetails?.grandTotal && values.VDDetails?.grandTotal
    : values.cartValue?.grandTotal;

  orderBody.versionLevelVolumeDisscount = some(values.dbProductDetails, [
    "volumeDiscountApplied",
    true,
  ]);

  orderBody.totalLP = (orderBody?.cartValue as { totalLP?: number })?.totalLP;

  // Adjust cart values based on payments (if not reorder)
  if (!isReorder && orderBody.cartValue) {
    const cartValue = orderBody.cartValue as {
      grandTotal?: number;
      totalItems?: number;
      totalLP?: number;
      totalTax?: number;
      totalValue?: number;
      totalShipping?: number;
      pfRate?: number;
      [key: string]: unknown;
    };
    orderBody.cartValue = {
      ...cartValue,
      grandTotal: (cartValue.grandTotal || 0) - totalPaid,
      totalItems: cartValue.totalItems,
      totalLP: cartValue.totalLP,
      totalTax:
        totalPaid > 0
          ? previousVersionDetails
            ? (cartValue.totalTax || 0) -
              (previousVersionDetails.overallTax || 0)
            : (cartValue.totalTax || 0) -
              (defaultValues?.cartValue?.totalTax || 0)
          : (cartValue.totalTax ?? undefined),
      totalValue:
        totalPaid > 0
          ? previousVersionDetails
            ? (cartValue.totalValue || 0) -
              (previousVersionDetails.subTotal || 0)
            : (cartValue.totalValue || 0) -
              (defaultValues?.cartValue?.totalValue || 0)
          : (cartValue.totalValue ?? undefined),
      totalShipping:
        totalPaid > 0
          ? previousVersionDetails
            ? (cartValue.totalShipping || 0) -
              (previousVersionDetails.overallShipping || 0)
            : (cartValue.totalShipping || 0) -
              (defaultValues?.cartValue?.totalShipping || 0)
          : (cartValue.totalShipping ?? undefined),
      pfRate:
        totalPaid > 0
          ? previousVersionDetails
            ? (cartValue.pfRate || 0) -
              (previousVersionDetails.totalPfValue || 0)
            : (cartValue.pfRate || 0) - (defaultValues?.cartValue?.pfRate || 0)
          : (cartValue.pfRate ?? undefined),
    };
  }

  orderBody.totalPaid = totalPaid;

  // Map order users - use overviewValues if provided, otherwise use firstOrderDetail
  const orderUsersSource =
    overviewValues?.orderUsers || firstOrderDetail?.orderUsers || [];
  const quoteUserIds = map(
    Array.isArray(orderUsersSource) ? orderUsersSource : [],
    user => {
      if (typeof user === "number") return user;
      if (typeof user === "object" && user !== null) {
        return user?.id || user?.userId || user;
      }
      return user;
    }
  ).filter(id => id !== null && id !== undefined);
  orderBody.orderUsers = quoteUserIds.length > 0 ? quoteUserIds : [];
  orderBody.deletableOrderUsers = [];

  // Set order division ID - use overviewValues if provided, otherwise use firstOrderDetail
  const orderDivisionSource =
    overviewValues?.orderDivisionId !== undefined &&
    overviewValues?.orderDivisionId !== null
      ? overviewValues.orderDivisionId
      : firstOrderDetail?.orderDivisionId;

  if (orderDivisionSource !== undefined && orderDivisionSource !== null) {
    if (
      typeof orderDivisionSource === "object" &&
      orderDivisionSource !== null &&
      "id" in orderDivisionSource
    ) {
      orderBody.orderDivisionId = (orderDivisionSource as { id: number }).id;
    } else {
      orderBody.orderDivisionId = orderDivisionSource as number;
    }
  } else {
    orderBody.orderDivisionId = undefined;
  }

  // Set order type ID - use overviewValues if provided, otherwise use firstOrderDetail
  const orderTypeSource =
    overviewValues?.orderType || firstOrderDetail?.orderType || null;

  if (orderTypeSource) {
    if (
      typeof orderTypeSource === "object" &&
      orderTypeSource !== null &&
      "id" in orderTypeSource
    ) {
      orderBody.orderTypeId = parseInt(
        (orderTypeSource as { id: number }).id.toString()
      );
    } else if (typeof orderTypeSource === "number") {
      orderBody.orderTypeId = orderTypeSource;
    } else {
      orderBody.orderTypeId = null;
    }
  } else {
    orderBody.orderTypeId = null;
  }

  // Map tags - use overviewValues if provided, otherwise use firstOrderDetail
  const tagsSource =
    overviewValues?.tagsList || firstOrderDetail?.tagsList || [];
  const tagId = map(Array.isArray(tagsSource) ? tagsSource : [], tag => {
    if (typeof tag === "number") return tag;
    if (typeof tag === "object" && tag !== null && "id" in tag) {
      return tag.id;
    }
    return tag;
  }).filter(id => id !== null && id !== undefined);
  orderBody.tagsList = tagId.length > 0 ? tagId : [];
  orderBody.deletableTagsList = [];

  // Set branch business unit
  orderBody.branchBusinessUnit = (
    values.branchBusinessUnit ? values.branchBusinessUnit.id : ""
  ) as unknown;
  orderBody.branchBusinessUnitId = (
    values.branchBusinessUnit ? values.branchBusinessUnit.id : ""
  ) as unknown;

  // Map product details - preserve all fields from product, only modify specific ones
  // This matches the pattern from the original implementation
  const dbProductDetails = map(values?.dbProductDetails || [], prod => {
    const anyProd = prod as any;

    const accountOwnerId =
      anyProd?.accountOwner && typeof anyProd.accountOwner === "object"
        ? Number(anyProd.accountOwner.id) || null
        : null;

    const businessUnitId =
      anyProd?.businessUnit && typeof anyProd.businessUnit === "object"
        ? Number(anyProd.businessUnit.id) || ""
        : "";

    const divisionId =
      anyProd?.division && typeof anyProd.division === "object"
        ? Number(anyProd.division.id) || null
        : null;

    const orderWareHouseId =
      anyProd?.wareHouse && typeof anyProd.wareHouse === "object"
        ? Number(anyProd.wareHouse.id) || null
        : null;

    const orderWareHouseName =
      anyProd?.wareHouse && typeof anyProd.wareHouse === "object"
        ? (anyProd.wareHouse.wareHouseName as string) || null
        : null;

    return {
      ...prod,

      accountOwnerId,
      businessUnitId,
      divisionId,

      // Line numbers (can be null for new products)
      lineNo: anyProd.new ? null : (anyProd.lineNo ?? null),
      itemNo: anyProd.new ? null : (anyProd.itemNo ?? null),

      // PF
      pfValue: null,
      pfPercentage:
        values?.orderTerms?.pfPercentage || values?.pfRate
          ? values?.pfRate
          : null,

      // Delivery dates
      tentativeDeliveryDate: anyProd.tentativeDeliveryDate || null,

      // Warehouse (flattened from nested object)
      orderWareHouseId,
      orderWareHouseName,

      // Tax - use correct breakup based on isInter flag
      productTaxes: orderBody.isInter
        ? (anyProd.interTaxBreakup as unknown[]) || []
        : (anyProd.intraTaxBreakup as unknown[]) || [],

      // Discounts
      productDiscounts: anyProd.discountDetails?.discountId
        ? [
            {
              id: null,
              discounId: anyProd.discountDetails.discountId,
              discounCode: null,
              orderProduct: null,
              discountPercentage: anyProd.discountDetails.Value,
            },
          ]
        : [],

      // Bundle products
      bundleProducts: (() => {
        const bundleProds = anyProd.bundleProducts;
        if (Array.isArray(bundleProds) && bundleProds.length > 0) {
          return formBundleProductsPayload(
            bundleProds as BundleProductPayload[]
          );
        }
        return [];
      })(),
    };
  });

  // Add removed products if not reorder
  if (isReorder) {
    orderBody.dbProductDetails = [...dbProductDetails];
  } else {
    orderBody.dbProductDetails = [
      ...dbProductDetails,
      ...(values.removedDbProductDetails || []),
    ];
  }

  // Ensure product discounts and bundle products are properly formatted
  const dbProductDetailsArray = (orderBody.dbProductDetails || []) as Array<{
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

  // Preserve additional fields from firstOrderDetail that aren't explicitly set
  // This ensures we don't lose any data from the original order
  if (firstOrderDetail) {
    // Preserve shipping address ID if exists
    if (firstOrderDetail.shippingAddressId && !orderBody.shippingAddressId) {
      orderBody.shippingAddressId = firstOrderDetail.shippingAddressId;
    }

    // Preserve shipping included flag if exists
    if (
      firstOrderDetail.shippingIncluded !== undefined &&
      orderBody.shippingIncluded === undefined
    ) {
      orderBody.shippingIncluded = firstOrderDetail.shippingIncluded;
    }

    // Preserve order description if exists
    if (firstOrderDetail.orderDescription && !orderBody.orderDescription) {
      orderBody.orderDescription = firstOrderDetail.orderDescription;
    }

    // Preserve order name if exists
    if (firstOrderDetail.orderName && !orderBody.orderName) {
      orderBody.orderName = firstOrderDetail.orderName;
    }

    // Preserve additional terms from orderTerms if exists
    if (
      values.orderTerms &&
      typeof values.orderTerms === "object" &&
      "additionalTerms" in values.orderTerms
    ) {
      orderBody.additionalTerms =
        (values.orderTerms as { additionalTerms?: string }).additionalTerms ||
        "";
    } else if (
      firstOrderDetail.orderTerms &&
      typeof firstOrderDetail.orderTerms === "object" &&
      "additionalTerms" in firstOrderDetail.orderTerms
    ) {
      orderBody.additionalTerms =
        (firstOrderDetail.orderTerms as { additionalTerms?: string })
          .additionalTerms || "";
    }

    // Preserve overall shipping if not already set
    if (
      firstOrderDetail.overallShipping !== undefined &&
      orderBody.overallShipping === undefined
    ) {
      orderBody.overallShipping = firstOrderDetail.overallShipping;
    }

    // Preserve sales branch code and sales org code if exists
    if (firstOrderDetail.salesBranchCode && !orderBody.salesBranchCode) {
      orderBody.salesBranchCode = firstOrderDetail.salesBranchCode;
    }
    if (firstOrderDetail.salesOrgCode && !orderBody.salesOrgCode) {
      orderBody.salesOrgCode = firstOrderDetail.salesOrgCode;
    }
  }

  return orderBody;
};
