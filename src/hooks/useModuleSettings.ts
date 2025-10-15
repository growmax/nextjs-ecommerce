import CartServices from "@/lib/api/CartServices";
import find from "lodash/find";
import useSWR from "swr";

interface UserData {
  userId?: number;
  companyId?: number;
}

export default function useModuleSettings(userData: UserData | null = null) {
  const userId = userData?.userId;
  const companyId = userData?.companyId;

  const fetcher = () => {
    if (!userId || !companyId) {
      return Promise.reject(new Error("Missing userId or companyId"));
    }
    return CartServices.getModule({ userId, companyId });
  };

  const { data, error } = useSWR(
    userId && companyId ? [userId, "ModuleSettings", companyId] : null,
    fetcher
  );

  let quoteSettings;
  let orderSettings;
  let termSettings;

  // The API response has structure: { data: { quoteSection, salesSection, orderSection } }
  // Note: termsSection is not included in the current API response
  const apiData = data?.data;

  if (apiData?.quoteSection?.lsQuoteSec) {
    quoteSettings = {
      listPriceDisplay: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "LISTPRICE_BUYER_DSIPLAY",
      ])?.status,
      costDisplay: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "COST_DISPLAY",
      ])?.status,
      marginDisplay: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "MARGIN_DISPLAY",
      ])?.status,
      roundingAdjustment: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_ROUNDING_ADJUSTMENT",
      ])?.status,
      productBasedApproval: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "PRODUCT_MARGIN",
      ])?.status,
      customerReference: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "CUSTOMER_REFERENCE",
      ])?.status,
      targetPrice: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "Target_Price",
      ])?.status,
      showCashDiscount: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_CASHDISCOUNT",
      ])?.status,
      spr: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "SPR_MANDATORY",
      ])?.status,
      sprAttachment: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "SPR_ATTACHMENT",
      ])?.status,
      quoteValidity: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "QUOTE_VALIDITY",
      ])?.sectionDetailValue,
      requiredIncDate: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "REQUIRED_DATE",
      ])?.sectionDetailValue,
      showSpr: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "SPR",
      ])?.status,
      customerTags: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "CUSTOMER_TAGS",
      ])?.status,
      showShippingCharges: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_SHIPPING",
      ])?.status,
      showPfRate: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_PACKAGING_FORWARDING",
      ])?.status,
      showInsuranceCharges: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ENABLE_INSURANCE",
      ])?.status,
      accountOwnerRequired: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ACCOUNT_OWNER",
      ])?.status,
      tagsRequired: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "TAGS",
      ])?.status,
      isCustomerDateRequired: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "REQUIRED_DATE",
      ])?.status,
      newSubtotal: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "NEW_SUBTOTAL",
      ])?.status,
      addonDiscount: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ADDON_DISCOUNT",
      ])?.status,
      itemWiseShippingTax: find(apiData?.salesSection?.lsSalesSec, [
        "sectionDetailName",
        "ITEMWISE_SHIPPINGTAX",
      ])?.status,
      isMinQuoteValueEnabled: find(apiData?.quoteSection?.lsQuoteSec, [
        "sectionDetailName",
        "QUOTE_VALUE",
      ])?.status,
      // isMinOrderValueEnabled: find(data?.quoteSettingsData?.data.orderSection?.lsOrderSec, [
      //   "sectionDetailName",
      //   "ORDER_VALUE",
      // ])?.status,
      // editOrder: find(data?.quoteSettingsData?.data.orderSection?.lsOrderSec, [
      //   "sectionDetailName",
      //   "ORDER_EDIT",
      // ]).sectionDescription
    };
  }
  if (apiData?.orderSection) {
    orderSettings = {
      isMinOrderValueEnabled: find(apiData?.orderSection?.lsOrderSec, [
        "sectionDetailName",
        "ORDER_VALUE",
      ])?.status,
      editOrder: find(apiData?.orderSection?.lsOrderSec, [
        "sectionDetailName",
        "ORDER_EDIT",
      ])?.sectionDescription,
    };
  }

  // termsSection is null in the API response - terms data needs to come from a different endpoint
  // TODO: Add separate API call for terms data if needed
  const termsData = apiData?.termsSection?.lsTermsSec;

  if (termsData) {
    termSettings = {
      showDeliveryTerms: find(termsData, ["sectionDetailName", "DELIVERY"])
        ?.status,
      showDeliveryPlace: find(termsData, [
        "sectionDetailName",
        "DELIVERY_PLACE",
      ])?.status,
      showDispatchTerms: find(termsData, ["sectionDetailName", "DISPATCH"])
        ?.status,
      showInsuranceTerms: find(termsData, ["sectionDetailName", "INSURANCE"])
        ?.status,
      showPackagingTerms: find(termsData, ["sectionDetailName", "PACKAGING"])
        ?.status,
      showWarrantyTerms: find(termsData, ["sectionDetailName", "WARRANTY"])
        ?.status,
      showPaymentTerms: find(termsData, ["sectionDetailName", "PAYMENT_TERM"])
        ?.status,
      showFreightTerms: find(termsData, ["sectionDetailName", "FREIGHT_TERM"])
        ?.status,
      isAdditionalTermRequired: find(termsData, [
        "sectionDetailName",
        "ADDITIONAL_TERM",
      ])?.status,
      additionalTermLabel:
        find(termsData, ["sectionDetailName", "ADDITIONAL_TERM"])
          ?.sectionDescription || "Additional Terms",
    };
  }

  return {
    termSettings: termSettings || {},
    quoteSettings: quoteSettings || {},
    orderSettings: orderSettings || {},
    settingsLoading: !error && !data,
  };
}
