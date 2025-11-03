// Core cart item structure used throughout calculations
export interface CartItem {
  productId: string | number;
  itemNo?: string | number;
  quantity: number;
  askedQuantity?: number;
  unitPrice: number;
  unitListPrice?: number;
  totalPrice: number;
  totalLP?: number;
  discount?: number;
  discountPercentage?: number;
  discountedPrice?: number;
  initial_discounted_price_fe?: number;
  initial_unitListPrice_fe?: number;
  tax?: number;
  totalTax?: number;
  pfItemValue?: number;
  pfRate?: number;
  itemTaxableAmount?: number;
  shippingCharges?: number;
  cashdiscountValue?: number;
  cashDiscountedPrice?: number;
  basicDiscountedPrice?: number;
  originalUnitPrice?: number;
  buyerRequestedPrice?: number;
  unitLP?: number;
  unitLPRp?: number;
  actualdisc?: number;
  acturalUP?: number;
  hsnCode?: string;
  showPrice?: boolean;
  priceNotAvailable?: boolean;
  isProductAvailableInPriceList?: boolean;
  volumeDiscountApplied?: boolean;
  volumeDiscount?: number;
  appliedDiscount?: number;
  discountDetails?: DiscountDetails;
  nextSuitableDiscount?: DiscountRange;
  CantCombineWithOtherDisCounts?: boolean;
  discountPercentage?: number;
  MasterPrice?: number;
  BasePrice?: number;
  priceListCode?: string;
  plnErpCode?: string;
  packagingQuantity?: number;
  minOrderQuantity?: number;
  checkMOQ?: boolean;
  bcProductCost?: number;
  productCostLoad?: number;
  productCost?: number;
  addonCost?: number;
  addonCostBC?: number;
  totalProductCost?: number;
  totalbcProductCost?: number;
  dmc?: number;
  marginPercentage?: number;
  productShortDescription?: string;
  totalInterTax?: number;
  totalIntraTax?: number;
  interTaxBreakup?: TaxBreakup[];
  intraTaxBreakup?: TaxBreakup[];
  compoundInter?: TaxReq[];
  compoundIntra?: TaxReq[];
  unitVolumePrice?: number;
  totalVolumeDiscountPrice?: number;
  goingForApproval?: boolean;
  taxInclusive?: boolean;
  taxVolumeDiscountPercentage?: number;
  unitListPrice?: number;
  bcProductCost?: number;
  productCostLoad?: number;
  packagingQty?: number;
  sellerId?: string | number;
  sellerName?: string;
  vendorId?: string | number;
  vendorName?: string;
  sellerLocation?: string;
  vendorLocation?: string;
  listPricePublic?: boolean;
  hsnDetails?: HsnDetails;
  bundleProducts?: BundleProduct[];
  additionalDiscounts?: AdditionalDiscount[];
  pricingSource?: PricingSource;
  matchedSellerId?: string | number;
  originalSellerIds?: (string | number)[];
  actualSellerId?: string | number;
  pricingConditionCode?: string | null;
  overrideDiscount?: number;
  unitListPrice?: number;
  disc_prd_related_obj?: PriceListDiscountData;
  isApprovalRequired?: boolean;
  // Dynamic tax properties (added at runtime)
  [taxName: string]: any;
}

// Bundle product structure
export interface BundleProduct {
  unitListPrice: number;
  isBundleSelected_fe?: boolean;
  bundleSelected?: boolean;
}

// Additional discount structure
export interface AdditionalDiscount {
  discounId?: string;
  discountPercentage: number;
}

// Pricing source tracking
export type PricingSource =
  | "seller-specific"
  | "getAllSellerPrices-exact"
  | "getAllSellerPrices-cross-seller";

// Calculated cart value structure
export interface CartValue {
  totalItems: number;
  totalValue: number;
  totalTax: number;
  grandTotal: number;
  totalLP: number;
  pfRate: number;
  totalShipping: number;
  totalCashDiscount: number;
  totalBasicDiscount: number;
  cashDiscountValue: number;
  hideListPricePublic: boolean;
  hasProductsWithNegativeTotalPrice?: boolean;
  hasAllProductsAvailableInPriceList?: boolean;
  calculatedTotal?: number;
  roundingAdjustment?: number;
  insuranceCharges?: number;
  taxableAmount?: number;
  // Dynamic tax totals (added at runtime)
  [taxName: string]: any;
}

// Seller cart structure
export interface SellerCart {
  seller: SellerInfo;
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  pricing?: CartValue;
  processedItems?: CartItem[];
  volumeDiscountDetails?: VolumeDiscountDetails;
  pfRate?: number;
}

// Seller information
export interface SellerInfo {
  id: string | number;
  sellerId: string | number;
  name: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  deliveryDays?: string;
  shippingType?: string;
}

// Settings structure used in calculations
export interface CalculationSettings {
  roundingAdjustment?: boolean;
  itemWiseShippingTax?: boolean;
}
