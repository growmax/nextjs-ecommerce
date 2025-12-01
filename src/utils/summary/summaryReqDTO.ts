import { trim } from "lodash";
import { some } from "lodash";

// Types for summary request DTO
export interface SummaryFormData {
  additionalTerms?: string;
  companyId: number | string;
  setSellerAddress: {
    id: number;
    name: string;
    companyId: {
      id: number;
      name: string;
    };
    salesBranchCode?: string | null;
  };
  setBillingAddress: {
    id: number;
    addressLine: string;
    branchName: string;
    city: string;
    country: string;
    district: string;
    gst: string;
    locality: string;
    pinCodeId: string;
    state: string;
    billToCode?: string;
  };
  setRegisterAddress?: {
    addressLine?: string;
    branchName?: string;
    city?: string;
    country?: string;
    district?: string;
    locality?: string;
    pinCodeId?: string;
    state?: string;
    gst?: string;
    billToCode?: string;
    shipToCode?: string;
    soldToCode?: string;
  };
  setShippingAddress: {
    id: number;
    addressLine: string;
    branchName: string;
    city: string;
    country: string;
    district: string;
    gst: string;
    locality: string;
    pinCodeId: string;
    state: string;
    shipToCode?: string;
  };
  authData?: {
    companyName?: string;
    displayName?: string;
  };
  buyerReferenceNumber?: string | null;
  customerRequiredDate?: string | null;
  products: Array<Record<string, unknown>>;
  VDDetails: {
    calculatedTotal?: number;
    roundingAdjustment?: number;
    grandTotal?: number;
    taxableAmount?: number;
    subTotalVolume?: number;
    subTotal?: number;
    overallTax?: number;
  };
  cartValue: {
    calculatedTotal: number;
    roundingAdjustment: number;
    grandTotal: number;
    taxableAmount: number;
    totalTax: number;
    totalValue: number;
  };
  division?: {
    id: number;
  } | null;
  channel?: {
    id: number;
  } | null;
  preferences?: {
    freightId?: {
      beforeTax?: boolean;
      beforeTaxPercentage?: number;
      name?: string;
      id?: number;
      frByPercentage?: boolean;
      frHeader?: string;
      freightCode?: string;
    };
    deliveryTermsId?: {
      name?: string;
      description?: string;
      id?: number;
      deliveryTermsCode?: string;
    };
    dispatchInstructionsId?: {
      name?: string;
      id?: number;
      dispatchInstructionsCode?: string;
    };
    insuranceId?: {
      name?: string;
      id?: number;
      insByPercentage?: boolean;
      insuranceValue?: number;
      insurancePercentage?: number;
      insuranceCode?: string;
      insHeader?: string;
    };
    pkgFwdId?: {
      name?: string;
      id?: number;
      pfPercentage?: number;
      packageForwardingCode?: string;
      pfHeader?: string;
      pfByPercentage?: boolean;
    };
    paymentTermsId?: {
      description?: string;
      id?: number;
      payOnDelivery?: boolean;
      bnplEnabled?: boolean;
      cashdiscountValue?: number;
      cashdiscount?: boolean;
      paymentTermsCode?: string;
    };
    warrantyId?: {
      name?: string;
      id?: number;
      warrantyCode?: string;
    };
  };
  pfRate?: number;
  uploadedDocumentDetails?: Array<Record<string, unknown>>;
  comment?: string | null;
  taxExempted?: boolean;
  taxExemptionMessage?: string;
  sprDetails?: Record<string, unknown>;
  isSPRRequested?: boolean;
  isOrder?: boolean;
  branchBusinessUnit?: {
    branchBUId?: string | number;
  };
  deliveryPlace?: string;
  quoteSettings?: {
    showInsuranceCharges?: boolean;
  };
  cashdiscount?: boolean;
}

/**
 * Transform summary form data to API payload format
 * Migrated from buyer-fe/src/utils/summary-utils.js
 *
 * @param props - Summary form data
 * @returns API payload object
 */
export const summaryReqDTO = (
  props: SummaryFormData
): Record<string, unknown> => {
  const {
    additionalTerms,
    companyId,
    setSellerAddress,
    setBillingAddress,
    setRegisterAddress,
    setShippingAddress,
    authData,
    buyerReferenceNumber,
    customerRequiredDate,
    products,
    VDDetails,
    cartValue,
    division,
    channel,
    preferences,
    pfRate,
    uploadedDocumentDetails,
    comment,
    taxExempted,
    taxExemptionMessage,
    sprDetails,
    isSPRRequested = false,
    isOrder = false,
    branchBusinessUnit,
    deliveryPlace,
    quoteSettings,
    cashdiscount,
  } = props;

  const body: Record<string, unknown> = {
    additionalTerms: additionalTerms,
    billingAddressDetails: {
      addressLine: setBillingAddress.addressLine,
      branchName: setBillingAddress.branchName,
      city: setBillingAddress.city,
      country: setBillingAddress.country,
      district: setBillingAddress.district,
      gst: setBillingAddress.gst,
      locality: setBillingAddress.locality,
      pinCodeId: setBillingAddress.pinCodeId,
      state: setBillingAddress.state,
      billToCode: setBillingAddress.billToCode,
    },
    buyerBranchId: setBillingAddress.id,
    buyerBranchName: setBillingAddress.branchName,
    buyerCompanyId: companyId,
    buyerCompanyName: authData?.companyName || "",
    buyerReferenceNumber: buyerReferenceNumber,
    // NOTE - For brbu we use branchBussinessUnit param alone (not branchBusinessUnitId, for safer i didn't remove that )
    // REVIEW - for Orders => branchBusinesssUnit, Quotes => branchBusinessUnitId
    branchBusinessUnitId: branchBusinessUnit?.branchBUId,
    branchBusinessUnit: branchBusinessUnit?.branchBUId,
    cashdiscount: cashdiscount,
    comment: trim(comment || "") || null,
    customProductDetails: [],
    customerRequiredDate: customerRequiredDate
      ? new Date(customerRequiredDate).toISOString()
      : null,
    dbProductDetails: products,
    deliveryDate: null,
    domainURL:
      typeof window !== "undefined"
        ? window.location.origin
        : "demo.schwingstetterindia.com",

    // REVIEW - Grand Total Calculation...
    calculatedTotal: VDDetails.calculatedTotal
      ? VDDetails.calculatedTotal
      : cartValue.calculatedTotal,
    roundingAdjustment: VDDetails.roundingAdjustment
      ? VDDetails.roundingAdjustment
      : cartValue.roundingAdjustment,
    grandTotal: VDDetails.grandTotal
      ? VDDetails.grandTotal
      : cartValue.grandTotal,

    taxableAmount: VDDetails.taxableAmount
      ? VDDetails.taxableAmount
      : cartValue.taxableAmount,
    isSPRRequested: isOrder ? false : isSPRRequested,
    sprDetails: sprDetails
      ? {
          ...sprDetails,
          sprRequestedDiscount:
            typeof sprDetails.sprRequestedDiscount === "string"
              ? parseFloat(sprDetails.sprRequestedDiscount) || 0
              : sprDetails.sprRequestedDiscount || 0,
        }
      : sprDetails,
    modifiedByUsername: authData?.displayName
      ? authData?.displayName + (authData?.companyName ? ", " + authData?.companyName : "")
      : "",
    notes: null,
    [isOrder ? "orderDescription" : "quoteDescription"]: "string",
    [isOrder ? "orderDivisionId" : "quoteDivisionId"]: division
      ? parseInt(String(division.id))
      : null,
    orderTypeId: channel ? parseInt(String(channel.id)) : null,
    orderIdentifier: null,
    orderName: "orderName",
    [isOrder ? "orderTerms" : "quoteTerms"]: {
      beforeTax: preferences?.freightId?.beforeTax,
      beforeTaxPercentage: preferences?.freightId?.beforeTaxPercentage,
      deliveryTerms: preferences?.deliveryTermsId?.name
        ? preferences?.deliveryTermsId?.name
        : preferences?.deliveryTermsId?.description,
      deliveryTermsId: preferences?.deliveryTermsId?.id,
      ...(deliveryPlace ? { deliveryTermsCode2: deliveryPlace } : {}),
      diValue: 0,
      dispatchInstructions: preferences?.dispatchInstructionsId?.name,
      dispatchInstructionsId: preferences?.dispatchInstructionsId?.id,
      dtValue: 0,
      freight: preferences?.freightId?.name,
      freightId: preferences?.freightId?.id,
      freightValue: 0,
      insurance: preferences?.insuranceId?.name,
      insuranceId: preferences?.insuranceId?.id,
      insByPercentage: preferences?.insuranceId?.insByPercentage,
      insuranceValue: quoteSettings?.showInsuranceCharges
        ? preferences?.insuranceId?.insuranceValue || 0
        : null,
      insurancePercentage: quoteSettings?.showInsuranceCharges
        ? preferences?.insuranceId?.insurancePercentage || 0
        : null,
      packageForwarding: preferences?.pkgFwdId?.name,
      packageForwardingId: preferences?.pkgFwdId?.id,
      paymentTerms: preferences?.paymentTermsId?.description,
      paymentTermsId: preferences?.paymentTermsId?.id,
      payOnDelivery: preferences?.paymentTermsId?.payOnDelivery,
      bnplEnabled: preferences?.paymentTermsId?.bnplEnabled,
      cashdiscountValue: preferences?.paymentTermsId?.cashdiscountValue,
      cashdiscount: preferences?.paymentTermsId?.cashdiscount,
      ptValue: 0,
      // pfValue: preferences.pkgFwdId.pfValue || pfRate ? pfRate : null,
      pfValue: null, // hardcoded to null, due to pf issue.
      pfPercentage:
        preferences?.pkgFwdId?.pfPercentage || pfRate ? pfRate : null,
      warranty: preferences?.warrantyId?.name,
      warrantyId: preferences?.warrantyId?.id,
      warrantyValue: 0,
      insuranceCode: preferences?.insuranceId?.insuranceCode,
      paymentTermsCode: preferences?.paymentTermsId?.paymentTermsCode,
      packageForwardingCode: preferences?.pkgFwdId?.packageForwardingCode,
      freightCode: preferences?.freightId?.freightCode,
      warrantyCode: preferences?.warrantyId?.warrantyCode,
      deliveryTermsCode: preferences?.deliveryTermsId?.deliveryTermsCode,
      dispatchInstructionsCode:
        preferences?.dispatchInstructionsId?.dispatchInstructionsCode,
      pfHeader: preferences?.pkgFwdId?.pfHeader,
      pfByPercentage: preferences?.pkgFwdId?.pfByPercentage,
      frByPercentage: preferences?.freightId?.frByPercentage,
      frHeader: preferences?.freightId?.frHeader,
      insHeader: preferences?.insuranceId?.insHeader,
    },
    orderVersion: 0,
    overallTax: VDDetails.subTotalVolume
      ? VDDetails.overallTax
      : cartValue.totalTax,
    payerCode: setRegisterAddress?.soldToCode || undefined,
    payerBranchName: setRegisterAddress?.branchName || undefined,
    po: true,
    quotationIdentifier: null,
    quoteName: "quoteName",
    requiredDate: customerRequiredDate
      ? new Date(customerRequiredDate).toISOString()
      : null,
    registerAddressDetails:
      setRegisterAddress && Object.keys(setRegisterAddress).length > 0
        ? {
            addressLine: setRegisterAddress?.addressLine,
            branchName: setRegisterAddress?.branchName,
            city: setRegisterAddress?.city,
            country: setRegisterAddress?.country,
            district: setRegisterAddress?.district,
            locality: setRegisterAddress?.locality,
            pincode: setRegisterAddress?.pinCodeId,
            state: setRegisterAddress?.state,
            gst: setRegisterAddress?.gst,
            billToCode: setRegisterAddress?.billToCode,
            shipToCode: setRegisterAddress?.shipToCode,
            soldToCode: setRegisterAddress?.soldToCode,
          }
        : {},
    shippingAddressDetails: {
      addressLine: setShippingAddress.addressLine,
      branchName: setShippingAddress.branchName,
      city: setShippingAddress.city,
      country: setShippingAddress.country,
      district: setShippingAddress.district,
      gst: setShippingAddress.gst,
      locality: setShippingAddress.locality,
      pinCodeId: setShippingAddress.pinCodeId,
      state: setShippingAddress.state,
      shipToCode: setShippingAddress.shipToCode,
    },
    shippingAddressId: setShippingAddress.id,
    subTotal: VDDetails.subTotalVolume
      ? VDDetails.subTotal
      : cartValue.totalValue,
    subTotalWithVD: VDDetails.subTotalVolume,
    sellerBranchId: setSellerAddress.id,
    sellerBranchName: setSellerAddress.name,
    sellerCompanyId: setSellerAddress.companyId.id,
    sellerCompanyName: setSellerAddress.companyId.name,
    salesBranchCode: setSellerAddress?.salesBranchCode || null,
    sellerReferenceNumber: "string",
    taxExemption: taxExempted,
    taxMessage: taxExemptionMessage,
    uploadedDocumentDetails: uploadedDocumentDetails
      ? uploadedDocumentDetails
      : [],
    versionCreatedTimestamp: new Date().toISOString(),
    versionLevelVolumeDisscount: some(products, [
      "volumeDiscountApplied",
      true,
    ]),
    validityDate: null,
  };

  return body;
};
