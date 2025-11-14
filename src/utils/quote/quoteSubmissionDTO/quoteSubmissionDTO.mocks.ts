// Mocks for quoteSubmissionDTO utilities
// These mocks are for testing the utilities in isolation.

export const mockBundleProducts = [
  {
    bundleSelected: 1,
    isBundleSelected_fe: 1,
    productId: "bundle-1",
  },
  {
    bundleSelected: 0,
    isBundleSelected_fe: 0,
    productId: "bundle-2",
  },
  {
    bundleSelected: 1,
    isBundleSelected_fe: 1,
    productId: "bundle-3",
  },
];

export const mockProduct = {
  productId: "prod-1",
  quantity: 10,
  price: 100,
  lineNo: 1,
  itemNo: 1,
  new: false,
  showPrice: true,
  priceNotAvailable: false,
  unitListPrice: 100,
  unitLPRp: 95,
};

export const mockProductWithVolumeDiscount = {
  ...mockProduct,
  volumeDiscountApplied: true,
};

export const mockProductWithAccountOwner = {
  ...mockProduct,
  accountOwner: {
    id: 1,
  },
};

export const mockProductWithBusinessUnit = {
  ...mockProduct,
  businessUnit: {
    id: 1,
  },
};

export const mockProductWithDivision = {
  ...mockProduct,
  division: {
    id: 1,
  },
};

export const mockProductWithWarehouse = {
  ...mockProduct,
  wareHouse: {
    id: 1,
    wareHouseName: "Warehouse 1",
  },
};

export const mockProductWithTaxes = {
  ...mockProduct,
  interTaxBreakup: [{ taxId: 1, amount: 10 }],
  intraTaxBreakup: [{ taxId: 2, amount: 20 }],
  productTaxes: [{ taxId: 3, amount: 30 }],
};

export const mockProductWithDiscount = {
  ...mockProduct,
  discountDetails: {
    discountId: "disc-1",
    Value: 10,
  },
};

export const mockProductWithBundle = {
  ...mockProduct,
  bundleProducts: mockBundleProducts,
};

export const mockProductNew = {
  ...mockProduct,
  new: true,
  lineNo: 5,
  itemNo: 5,
};

export const mockProductWithoutShowPrice = {
  ...mockProduct,
  showPrice: false,
};

export const mockProductPriceNotAvailable = {
  ...mockProduct,
  priceNotAvailable: true,
};

export const mockCartValue = {
  totalValue: 1000,
  totalTax: 100,
  taxableAmount: 900,
  calculatedTotal: 1100,
  roundingAdjustment: 0,
  grandTotal: 1100,
  totalShipping: 50,
  pfRate: 5,
};

export const mockVDDetails = {
  subTotal: 900,
  subTotalVolume: 800,
  overallTax: 90,
  taxableAmount: 810,
  calculatedTotal: 990,
  roundingAdjustment: 10,
  grandTotal: 1000,
};

export const mockValues = {
  quoteName: "Test Quote",
  dbProductDetails: [mockProduct],
  removedDbProductDetails: [],
  cartValue: mockCartValue,
  VDapplied: false,
  buyerCurrencyId: {
    id: 1,
  },
  branchBusinessUnit: {
    id: 1,
  },
  registerAddressDetails: {
    soldToCode: "SOLD001",
    branchName: "Main Branch",
  },
  quoteTerms: {
    pfPercentage: 5,
    pfValue: 50,
  },
  pfRate: 5,
  isInter: false,
  subtotal_bc: null,
};

export const mockOverviewValues = {
  quoteName: "Overview Quote",
  comment: "Test comment",
  buyerReferenceNumber: "REF-001",
  uploadedDocumentDetails: [],
  quoteUsers: [{ id: 1, userId: 1 }],
  quoteDivisionId: { id: 1 },
  orderType: { id: 2 },
  tagsList: [{ id: 1 }],
};
