// Main barrel export for all utility functions
// This file provides a single entry point for all utility modules

// Individual utility files
export * from "@/utils/functionalUtils";
export * from "@/utils/getProductIds";

// Calculation utilities
export * from "@/utils/calculation/cart-calculation";
export * from "@/utils/calculation/discountCalculation/discountCalculation";
export * from "@/utils/calculation/product-margin";
export * from "@/utils/calculation/product-utils";
export * from "@/utils/calculation/salesCalculation/salesCalculation";
export * from "@/utils/calculation/sellerCartUtils/sellerCartUtils";
export * from "@/utils/calculation/tax-breakdown";
export * from "@/utils/calculation/tax-calculation/tax-calculation";
export * from "@/utils/calculation/volume-discount-calculation/volume-discount-calculation";
// Specific exports from cartCalculation to avoid conflicts
export {
  addMoreUtils,
  calculate_volume_discount,
  cartCalculation as cartCalculationLegacy,
  discountDetails as discountDetailsLegacy,
  getProductWiseMargin,
  VolumeDiscountCalculation,
} from "@/utils/calculation/cartCalculation";

// Cart utilities
export * from "@/utils/cart/cartHelpers";
export * from "@/utils/cart/cartValidation";
export * from "@/utils/cart/validateQuantity";

// Date format utilities
export * from "@/utils/date-format/date-format";

// Details utilities (already has barrel export)
export * from "@/utils/details/orderdetails";

// Elasticsearch utilities
export * from "@/utils/elasticsearch/format-response";
export * from "@/utils/elasticsearch/search-queries";

// General utilities
export * from "@/utils/General/general";

// OpenSearch utilities
export * from "@/utils/opensearch/response-parser";

// Order utilities
export * from "@/utils/order/getLatestTaxData/getLatestTaxData";
// Specific exports from orderPaymentDTO to avoid conflicts
export {
  formBundleProductsPayload as formBundleProductsPayloadOrder,
  orderPaymentDTO as orderPaymentDTOFunction,
} from "@/utils/order/orderPaymentDTO/orderPaymentDTO";
// Specific exports from orderUtils to avoid conflicts
export {
  checkIsBundleProduct as checkIsBundleProductOrder,
  formBundleProductsPayload as formBundleProductsPayloadOrderUtils,
  orderPaymentDTO as orderPaymentDTOLegacy,
  quoteSubmitDTO,
  validatePlaceOrder,
  type PlaceOrderValidation,
} from "@/utils/order/orderUtils/orderUtils";

// Pricing utilities
export * from "@/utils/pricing/buildPricingCond";
export * from "@/utils/pricing/getProductPricing";

// Product utilities
export * from "@/utils/product/product-formatter";
export * from "@/utils/product/slug-generator";

// ProductList utilities
export * from "@/utils/ProductList/constants";
export * from "@/utils/ProductList/mockData";

// Quote utilities
// Specific exports from quotationPaymentDTO to avoid conflicts
export {
  formBundleProductsPayload as formBundleProductsPayloadQuote,
  quotationPaymentDTO,
} from "@/utils/quote/quotationPaymentDTO/quotationPaymentDTO";
// Specific exports from quoteSubmissionDTO to avoid conflicts
export {
  checkIsBundleProduct as checkIsBundleProductQuote,
  formBundleProductsPayload as formBundleProductsPayloadQuoteSubmission,
  prepareQuoteSubmissionDTO,
} from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";

// Sanitization utilities
export * from "@/utils/sanitization/sanitization.utils";

// Summary utilities
export * from "@/utils/summary/summaryReqDTO";
export * from "@/utils/summary/validation";
