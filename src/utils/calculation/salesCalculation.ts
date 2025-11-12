import { formatMoney } from "accounting-js";
import { find, isArray } from "lodash";

interface PriceInfo {
  isPriceNotAvailable?: boolean;
  ShowDiscountedPrice?: boolean;
  ShowUnitListPrice?: boolean;
  ShowDiscount?: boolean;
  ShowRequestPrice?: boolean;
}

interface CurrencyOptions {
  currencyCode?: string;
  decimal: string;
  description?: string;
  precision: number;
  symbol: string;
  thousand: string;
}

interface BusinessUnit {
  businessUnitCode: string;
  description: string;
  id: string;
  unitName: string;
}

interface Division {
  divisionCode: string;
  id: string;
  name: string;
}

interface HsnTaxBreakup {
  interTax?: number;
  intraTax?: number;
}

interface HsnDetails {
  description: string;
  hsnCode: string;
  id: string;
  interTax?: number | undefined;
  intraTax?: number | undefined;
  tax?: number | undefined;
}

interface InventoryItem {
  availableQty?: number;
}

interface InventoryResponse {
  inventoryData: InventoryItem[] | null | undefined;
  availableStock: number | null;
  inStock: boolean;
}

interface ProductSubCategory {
  isPrimary: number;
}

interface ElasticProductData {
  businessUnitId?: string;
  businessUnitCode?: string;
  businessUnitName?: string;
  businessUnit?: BusinessUnit | null;
  divisionId?: string;
  divisionCode?: string;
  divisionName?: string;
  division?: Division | null;
  hsnDescription?: string;
  hsnCode?: string;
  hsnId?: string;
  hsnTaxBreakup?: HsnTaxBreakup;
  hsnTax?: number;
  hsnDetails?: HsnDetails;
  inventory?: InventoryItem[];
  inventoryResponse?: InventoryResponse;
  listpricePublic?: number;
  listPricePublic?: number | undefined;
  standardLeadTime?: number;
  deliveryLeadTime?: number | undefined;
  customProduct?: boolean;
  isCustomProduct?: boolean | undefined;
  packagingQty?: number;
  packagingQuantity?: number | undefined;
  productsSubCategories?: ProductSubCategory[];
  primary_products_categoryObjects?: ProductSubCategory | undefined;
}

/**
 *
 * @param listPricePublic listPrice
 * @param showPrice showprice
 * @param isPriceNotAvailable price not available
 * @returns PriceInfo return Value
 */
export function getPriceInfo(
  listPricePublic: number | null | undefined,
  showPrice: boolean,
  isPriceNotAvailable: boolean
): PriceInfo {
  const showHide: PriceInfo = {};
  if (isPriceNotAvailable) {
    showHide.isPriceNotAvailable = true;
  }
  if (showPrice && listPricePublic && !isPriceNotAvailable) {
    showHide.ShowDiscountedPrice = true;
    showHide.ShowUnitListPrice = true;
    showHide.ShowDiscount = true;
  }
  if (showPrice && !listPricePublic && !isPriceNotAvailable) {
    showHide.ShowDiscountedPrice = true;
  }
  if ((!showPrice && !listPricePublic) || (!showPrice && listPricePublic)) {
    showHide.ShowRequestPrice = true;
  }
  return showHide;
}
/**
 *
 * @param user user
 * @param input input
 * @param CustomSymbol symbol
 * @returns string return Value
 */
export function getAccounting(
  user: CurrencyOptions | null | undefined,
  input: number | string | null | undefined,
  CustomSymbol?: CurrencyOptions
): string {
  const { symbol, decimal, thousand, precision } = CustomSymbol
    ? CustomSymbol
    : user || {
        currencyCode: "INR",
        decimal: ".",
        description: "Indian Rupee",
        precision: 2,
        symbol: "₹",
        thousand: ",",
      };
  const options = {
    symbol,
    decimal,
    thousand,
    precision,
  };
  return input && isFinite(Number(input))
    ? formatMoney(parseFloat(String(input)), options)
    : formatMoney(0.0, options);
}

export const roundOf = (value: number | string | null | undefined): number => {
  if (value !== null && value !== undefined) {
    return parseFloat(parseFloat(String(value)).toFixed(2));
  } else {
    return 0;
  }
};

export const manipulateProductsElasticData = (
  esData: ElasticProductData | ElasticProductData[]
): ElasticProductData | ElasticProductData[] => {
  if (isArray(esData)) {
    esData.forEach((o: ElasticProductData) => {
      return assignData(o);
    });
  } else {
    assignData(esData);
  }
  return esData;
};

/**
 *
 * @param data
 * @returns
 */
function assignData(data: ElasticProductData): ElasticProductData {
  data.businessUnit = data?.businessUnitId
    ? {
        businessUnitCode: data?.businessUnitCode || "",
        description: data?.businessUnitName || "",
        id: data?.businessUnitId,
        unitName: data?.businessUnitName || "",
      }
    : null;
  data.division = data?.divisionId
    ? {
        divisionCode: data?.divisionCode || "",
        id: data?.divisionId,
        name: data?.divisionName || "",
      }
    : null;
  data.hsnDetails = {
    description: data?.hsnDescription || "",
    hsnCode: data?.hsnCode || "",
    id: data?.hsnId || "",
    interTax: data?.hsnTaxBreakup?.interTax,
    intraTax: data?.hsnTaxBreakup?.intraTax,
    tax: data?.hsnTax,
  };
  data.inventoryResponse = {
    inventoryData: data?.inventory,
    availableStock: data?.inventory?.length
      ? data?.inventory[0]?.availableQty || null
      : null,
    inStock: data?.inventory && data?.inventory?.length > 0 ? true : false,
  };
  data.listPricePublic = data?.listpricePublic;
  data.deliveryLeadTime = data?.standardLeadTime;
  data.isCustomProduct = data?.customProduct;
  data.packagingQuantity = data?.packagingQty;
  if (data?.productsSubCategories && data?.productsSubCategories?.length > 0) {
    data.primary_products_categoryObjects = find(data.productsSubCategories, [
      "isPrimary",
      1,
    ]);
  }

  return data;
}

import each from "lodash/each";
import isEmpty from "lodash/isEmpty";
import remove from "lodash/remove";

// Define supporting types, as strictly as possible, but flexible for project context.
type TaxReq = {
  taxName: string;
  rate: number;
  compound: boolean;
};

type HsnTaxType = {
  totalTax?: number;
  taxReqLs?: TaxReq[];
};

type HsnDetailsType = {
  tax?: number;
  interTax?: HsnTaxType;
  intraTax?: HsnTaxType;
  [key: string]: any;
};

type ProductDetail = {
  productId: string | number;
  hsnDetails?: HsnDetailsType;
  [key: string]: any;
};

type TaxBreakup = {
  taxName: string;
  taxPercentage: number;
  compound: boolean;
};

type ExistingProduct = {
  productId: string | number;
  hsnDetails?: HsnDetailsType;
  tax?: number;
  totalInterTax?: number;
  totalIntraTax?: number;
  interTaxBreakup?: TaxBreakup[];
  intraTaxBreakup?: TaxBreakup[];
  compoundInter?: TaxReq[];
  compoundIntra?: TaxReq[];
  productTaxes?: TaxBreakup[];
  [key: string]: any;
};

/**
 * Sets tax details for products.
 * @param existingPrdArr Array of products to update (mutates items)
 * @param productDetailArr Array of reference product details
 * @param isInter true for inter-state, false for intra-state
 * @param taxExemption if true, sets all related taxes to 0
 * @returns updated array
 */
export const setTaxDetails = (
  existingPrdArr: ExistingProduct[] | undefined,
  productDetailArr: ProductDetail[],
  isInter: boolean,
  taxExemption: boolean
): ExistingProduct[] | undefined => {
  if (!existingPrdArr) return existingPrdArr;

  each(existingPrdArr, (item: ExistingProduct) => {
    const tempDetails = find(productDetailArr, [
      "productId",
      item.productId,
    ]) as ProductDetail | undefined;
    
    // Only assign if hsnDetails exists
    if (tempDetails?.hsnDetails) {
      item.hsnDetails = tempDetails.hsnDetails;
    }

    // Set main tax
    item.tax = taxExemption
      ? 0
      : parseFloat(String(item?.hsnDetails?.tax ?? 0)) || 0;

    // Set total taxes
    item.totalInterTax = taxExemption
      ? 0
      : parseFloat(String(item.hsnDetails?.interTax?.totalTax ?? 0)) || 0;
    item.totalIntraTax = taxExemption
      ? 0
      : parseFloat(String(item.hsnDetails?.intraTax?.totalTax ?? 0)) || 0;

    // INTER TAX BREAKUP
    item.interTaxBreakup = [];
    item.compoundInter = remove(item.hsnDetails?.interTax?.taxReqLs ?? [], [
      "compound",
      true,
    ]);
    if (!isEmpty(item.compoundInter) && item.compoundInter[0] && item.hsnDetails?.interTax?.taxReqLs) {
      item.hsnDetails.interTax.taxReqLs.push(item.compoundInter[0]);
    }
    each(item.hsnDetails?.interTax?.taxReqLs ?? [], (taxes: TaxReq) => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      item.interTaxBreakup!.push(tax);
    });

    // INTRA TAX BREAKUP
    item.intraTaxBreakup = [];
    item.compoundIntra = remove(item.hsnDetails?.intraTax?.taxReqLs ?? [], [
      "compound",
      true,
    ]);
    if (!isEmpty(item.compoundIntra) && item.compoundIntra[0] && item.hsnDetails?.intraTax?.taxReqLs) {
      item.hsnDetails.intraTax.taxReqLs.push(item.compoundIntra[0]);
    }
    each(item.hsnDetails?.intraTax?.taxReqLs ?? [], (taxes: TaxReq) => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      item.intraTaxBreakup!.push(tax);
    });

    // Select final taxes
    item.productTaxes = isInter ? item.interTaxBreakup : item.intraTaxBreakup;
  });

  return existingPrdArr;
};
