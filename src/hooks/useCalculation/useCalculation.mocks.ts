// Mock data for useCalculation tests

export const mockProduct = {
  productId: 1,
  productName: "Test Product",
  quantity: 2,
  askedQuantity: 2,
  unitPrice: 100,
  unitListPrice: 120,
  discount: 10,
  discountPercentage: 10,
  pfItemValue: 0,
  shippingCharges: 10,
  cashdiscountValue: 0,
  showPrice: true,
  priceNotAvailable: false,
  hsnDetails: {
    interTax: 18,
    intraTax: 18,
  },
};

export const mockProducts = [mockProduct];

export const mockProductWithoutHsn = {
  productId: 2,
  productName: "Product Without HSN",
  quantity: 1,
  unitPrice: 50,
  unitListPrice: 60,
  discount: 5,
};

export const mockCalculationParams = {
  products: mockProducts,
  isInter: true,
  taxExemption: false,
  insuranceCharges: 5,
  precision: 2,
  Settings: {},
  isSeller: false,
  overallShipping: 20,
  isBeforeTax: false,
};

export const mockEmptyProducts = {
  products: [],
  isInter: true,
  taxExemption: false,
};

export const mockExpectedEmptyResult = {
  cartValue: {
    totalItems: 0,
    totalLP: 0,
    totalValue: 0,
    totalTax: 0,
    totalShipping: 0,
    pfRate: 0,
    taxableAmount: 0,
    grandTotal: 0,
  },
  products: [],
  breakup: [],
};
