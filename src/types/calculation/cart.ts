// Import types
import type {
  DiscountDetails,
  DiscountRange,
  PriceListDiscountData,
  VolumeDiscountDetails,
  VolumeDiscountData,
} from "@/types/calculation/discount";
import type { HsnDetails, TaxBreakup, TaxReq } from "@/types/calculation/tax";

// Re-export types that are commonly used with cart
export type { VolumeDiscountDetails, VolumeDiscountData };

// Core cart item structure used throughout calculations
export interface CartItem {
  productId: string | number;
  itemNo?: string | number;
  quantity: number;
  askedQuantity?: number;
  unitPrice: number;
  totalPrice: number; // ensure totalPrice is always defined once item is in cart
  totalLP?: number;
  discount?: number;
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
  discountsList?: DiscountRange[]; // Array of quantity-based discount ranges from discount API
  packagingQuantity?: number;
  minOrderQuantity?: number;
  checkMOQ?: boolean;
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
  disc_prd_related_obj?: PriceListDiscountData;
  isApprovalRequired?: boolean;
  // Replacement/Alternative product fields
  replacement?: boolean;
  alternativeProduct?: string | number;
  // Product display fields
  productName?: string;
  shortDescription?: string;
  brandName?: string;
  brandsName?: string;
  img?: string;
  productAssetss?: Array<{
    source: string;
    isDefault?: boolean;
  }>;
  // Inventory fields
  inventoryResponse?: {
    inStock: boolean;
  };
  // Additional product metadata
  id?: string | number;
  partnerId?: string | number;
  partnerName?: string;
  // Dynamic tax properties (added at runtime)
  [taxName: string]: any;
}

// Bundle product structure
export interface BundleProduct {
  productId?: number;
  bundleProductsId?: number;
  accessoryProductId?: number;
  unitListPrice: number;
  isBundleSelected_fe?: boolean;
  bundleSelected?: boolean;
  isParentProduct?: boolean;
  productName?: string;
  shortDescription?: string;
  img?: string;
  // Additional bundle fields
  [key: string]: any;
}

// Additional discount structure
export interface AdditionalDiscount {
  discounId?: string;
  discountPercentage: number;
}

// Pricing source tracking
export type PricingSource = "seller-specific" | "no-seller-id" | "no-pricing";

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
  [taxName: string]: number | string | boolean | undefined;
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
