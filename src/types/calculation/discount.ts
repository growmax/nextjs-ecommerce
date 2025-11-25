import { CartItem, PricingSource } from "@/types/calculation/cart";

// Discount range structure
export interface DiscountRange {
  min_qty: number;
  max_qty: number;
  Value: number;
  CantCombineWithOtherDisCounts?: boolean;
  pricingConditionCode?: string | null;
}

// Discount result structure
export interface DiscountResult {
  suitableDiscount: DiscountRange | undefined;
  nextSuitableDiscount: DiscountRange | undefined;
}

// Price list discount data
export interface PriceListDiscountData {
  MasterPrice: number | null;
  BasePrice: number | null;
  priceListCode?: string;
  plnErpCode?: string;
  discounts?: DiscountRange[];
  isProductAvailableInPriceList?: boolean;
  pricingConditionCode?: string | null;
  isOveridePricelist?: boolean;
  PricingCondition?: string;
  isApprovalRequired?: boolean;
}

// Discount details structure
export interface DiscountDetails {
  BasePrice: number;
  plnErpCode?: string;
  priceListCode?: string;
  pricingConditionCode?: string | null;
}

// Volume discount data structure
export interface VolumeDiscountData {
  itemNo: string | number;
  volumeDiscount: number;
  appliedDiscount: number;
}

// Volume discount details structure
export interface VolumeDiscountDetails {
  subTotal: number;
  subTotalVolume: number;
  volumeDiscountApplied: number;
  overallTax: number;
  taxableAmount: number;
  grandTotal: number;
  shippingTax?: number;
  totalTax: number;
  pfRate?: number;
  insuranceCharges?: number;
  calculatedTotal?: number;
  roundingAdjustment?: number;
  // Dynamic tax totals (added at runtime)
  [taxName: string]: any;
}

// Pricing resolution structure
export interface PricingResolution {
  totalSellers: number;
  totalProducts: number;
  pricingBySources: {
    "seller-specific": number;
    "no-seller-id": number;
    "no-pricing": number;
  };
  productsWithoutPricing: Array<{
    productId: string | number;
    productName?: string;
    sellerId: string | number;
  }>;
}

// Margin calculation result
export interface MarginCalculationResult {
  totalHoCost: number;
  totalHoCostBC: number;
  totalProductCostBC: number;
  totalProductCost: number;
  hoProfit: number;
  costProfit: number;
  data: CartItem[];
}

// Product pricing match
export interface ProductPricingMatch {
  MasterPrice?: number;
  BasePrice?: number;
  priceListCode?: string;
  plnErpCode?: string;
  ProductVariantId?: string | number;
  pricingSource: PricingSource;
  matchedSellerId?: string | number;
  originalSellerIds?: (string | number)[];
  actualSellerId?: string | number;
  priceNotAvailable?: boolean;
}

// Pricing validation
export interface PricingValidation {
  hasMasterPrice: boolean;
  hasBasePrice: boolean;
  isAvailableInPriceList: boolean;
  isValid: boolean;
}
