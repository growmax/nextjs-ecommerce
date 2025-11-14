// Mocks for salesCalculation utilities
// These mocks are for testing the utilities in isolation.

export interface CurrencyOptions {
  currencyCode?: string;
  decimal: string;
  description?: string;
  precision: number;
  symbol: string;
  thousand: string;
}

export interface ElasticProductData {
  businessUnitId?: string;
  businessUnitCode?: string;
  businessUnitName?: string;
  divisionId?: string;
  divisionCode?: string;
  divisionName?: string;
  hsnDescription?: string;
  hsnCode?: string;
  hsnId?: string;
  hsnTaxBreakup?: {
    interTax?: number;
    intraTax?: number;
  };
  hsnTax?: number;
  inventory?: Array<{ availableQty?: number }>;
  listpricePublic?: number;
  standardLeadTime?: number;
  customProduct?: boolean;
  packagingQty?: number;
  productsSubCategories?: Array<{ isPrimary: number }>;
  [key: string]: any;
}

export interface ProductDetail {
  productId: string | number;
  hsnDetails?: {
    tax?: number;
    interTax?: {
      totalTax?: number;
      taxReqLs?: Array<{
        taxName: string;
        rate: number;
        compound: boolean;
      }>;
    };
    intraTax?: {
      totalTax?: number;
      taxReqLs?: Array<{
        taxName: string;
        rate: number;
        compound: boolean;
      }>;
    };
  };
  [key: string]: any;
}

export interface ExistingProduct {
  productId: string | number;
  hsnDetails?: any;
  tax?: number;
  totalInterTax?: number;
  totalIntraTax?: number;
  interTaxBreakup?: any[];
  intraTaxBreakup?: any[];
  compoundInter?: any[];
  compoundIntra?: any[];
  productTaxes?: any[];
  [key: string]: any;
}

export const mockCurrencyOptions: CurrencyOptions = {
  currencyCode: "USD",
  decimal: ".",
  description: "US Dollar",
  precision: 2,
  symbol: "$",
  thousand: ",",
};

export const mockCustomCurrencyOptions: CurrencyOptions = {
  currencyCode: "EUR",
  decimal: ",",
  description: "Euro",
  precision: 2,
  symbol: "€",
  thousand: ".",
};

export const mockElasticProductData: ElasticProductData = {
  businessUnitId: "BU-1",
  businessUnitCode: "BU001",
  businessUnitName: "Business Unit 1",
  divisionId: "DIV-1",
  divisionCode: "DIV001",
  divisionName: "Division 1",
  hsnDescription: "Test HSN",
  hsnCode: "12345678",
  hsnId: "HSN-1",
  hsnTaxBreakup: {
    interTax: 10,
    intraTax: 8,
  },
  hsnTax: 10,
  inventory: [{ availableQty: 100 }],
  listpricePublic: 1000,
  standardLeadTime: 5,
  customProduct: false,
  packagingQty: 10,
  productsSubCategories: [{ isPrimary: 0 }, { isPrimary: 1 }],
};

export const mockElasticProductDataWithoutOptional: Partial<ElasticProductData> =
  {
    inventory: [],
  } as ElasticProductData;

export const mockProductDetail: ProductDetail = {
  productId: "prod-1",
  hsnDetails: {
    tax: 10,
    interTax: {
      totalTax: 10,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 10,
          compound: false,
        },
      ],
    },
    intraTax: {
      totalTax: 8,
      taxReqLs: [
        {
          taxName: "CGST",
          rate: 4,
          compound: false,
        },
        {
          taxName: "SGST",
          rate: 4,
          compound: false,
        },
      ],
    },
  },
};

export const mockProductDetailWithCompoundTax: ProductDetail = {
  productId: "prod-2",
  hsnDetails: {
    tax: 12,
    interTax: {
      totalTax: 12,
      taxReqLs: [
        {
          taxName: "GST",
          rate: 10,
          compound: false,
        },
        {
          taxName: "CESS",
          rate: 2,
          compound: true,
        },
      ],
    },
    intraTax: {
      totalTax: 12,
      taxReqLs: [
        {
          taxName: "CGST",
          rate: 5,
          compound: false,
        },
        {
          taxName: "CESS",
          rate: 2,
          compound: true,
        },
      ],
    },
  },
};

export const mockExistingProduct: ExistingProduct = {
  productId: "prod-1",
};

export const mockExistingProductWithHsn: ExistingProduct = {
  productId: "prod-1",
  hsnDetails: {
    tax: 5,
    interTax: {
      totalTax: 5,
    },
  },
};
