// Tax requirement structure
export interface TaxReq {
  taxName: string;
  rate: number;
  compound: boolean;
}

// Tax breakup structure
export interface TaxBreakup {
  taxName: string;
  taxPercentage: number;
  compound: boolean;
}

// HSN tax type structure
export interface HsnTaxType {
  totalTax?: number;
  taxReqLs?: TaxReq[];
}

// HSN details structure
export interface HsnDetails {
  description?: string;
  hsnCode?: string;
  id?: string;
  interTax?: HsnTaxType;
  intraTax?: HsnTaxType;
  tax?: number;
  taxBreakup?: TaxBreakup[];
}

// Tax calculation parameters
export interface TaxCalculationParams {
  isInter: boolean;
  taxExemption: boolean;
  precision?: number;
}

// Tax exemption settings
export interface TaxExemptionSettings {
  isEnabled: boolean;
  reason?: string;
  exemptedTaxes?: string[];
}

// Tax summary structure
export interface TaxSummary {
  totalTax: number;
  interStateTax: number;
  intraStateTax: number;
  taxBreakup: Record<string, number>;
  exemptedAmount: number;
}
