// Volume discount object structure
export interface VolumeDiscountObject {
  DiscountId?: string;
  Percentage: number;
}

// Volume discount item structure
export interface VolumeDiscountItem {
  productId?: string | number;
  volume_discount_obj?: VolumeDiscountObject;
  discChanged?: boolean;
  CantCombineWithOtherDisCounts?: boolean;
  discount?: number;
  discountPercentage?: number;
  unitListPrice?: number;
  appliedDiscount?: number;
  unitPrice?: number;
  askedQuantity?: number;
  totalPrice?: number;
  pfItemValue?: number;
  pfRate?: number;
  tax?: number;
  taxVolumeDiscountPercentage?: number;
  itemTaxableAmount?: number;
  shippingCharges?: number;
  productCost?: number;
  unitVolumePrice?: number;
  totalVolumeDiscountPrice?: number;
  dmc?: number;
  marginPercentage?: number;
  volumeDiscount?: number;
  volumeDiscountApplied?: boolean;
  taxInclusive?: boolean;
  // Dynamic tax properties (added at runtime)
  [taxName: string]: any;
}

// Volume discount calculation parameters
export interface VolumeDiscountCalculationParams {
  isInter: boolean;
  precision?: number;
  Settings?: CalculationSettings;
  beforeTax?: boolean;
  beforeTaxPercentage?: number;
  overallShipping?: number;
  insuranceCharges?: number;
}

// Volume discount calculation result
export interface VolumeDiscountCalculationResult {
  products: VolumeDiscountItem[];
  vdDetails: VolumeDiscountDetails;
  pfRate: number;
}

// Calculation settings for volume discounts
export interface CalculationSettings {
  roundingAdjustment?: boolean;
  itemWiseShippingTax?: boolean;
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
