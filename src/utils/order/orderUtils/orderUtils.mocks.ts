/**
 * Mock data for orderUtils tests
 */

export const mockBundleProducts = [
  {
    bundleSelected: true,
    isBundleSelected_fe: true,
    productId: 1,
    productName: "Bundle Product 1",
    quantity: 2,
  },
  {
    bundleSelected: false,
    isBundleSelected_fe: false,
    productId: 2,
    productName: "Bundle Product 2",
    quantity: 1,
  },
  {
    bundleSelected: true,
    isBundleSelected_fe: true,
    productId: 3,
    productName: "Bundle Product 3",
    quantity: 3,
  },
];

export const mockProduct = {
  productId: 1,
  productName: "Test Product",
  unitPrice: 100,
  quantity: 2,
  unitListPrice: 120,
  showPrice: true,
  priceNotAvailable: false,
  accountOwner: { id: "123" },
  businessUnit: { id: 456 },
  division: { id: "789" },
  wareHouse: { id: 1, wareHouseName: "Warehouse 1" },
  discountDetails: {
    discountId: 1,
    Value: 10,
  },
  bundleProducts: mockBundleProducts,
  new: false,
  lineNo: 1,
  itemNo: 1,
  interTaxBreakup: [],
  intraTaxBreakup: [],
};

export const mockQuoteValues = {
  quoteName: "Test Quote",
  buyerCurrencyId: { id: 1 },
  branchBusinessUnit: { id: 100 },
  registerAddressDetails: {
    soldToCode: "BUYER001",
    branchName: "Main Branch",
  },
  isInter: true,
  pfRate: 5,
  quoteTerms: {
    pfPercentage: 5,
    pfValue: 10,
  },
  cartValue: {
    totalValue: 200,
    totalTax: 20,
    totalShipping: 10,
    calculatedTotal: 230,
    grandTotal: 230,
    taxableAmount: 200,
    pfRate: 10,
    roundingAdjustment: 0,
  },
  VDapplied: false,
  VDDetails: {
    subTotal: 190,
    subTotalVolume: 190,
    overallTax: 19,
    taxableAmount: 190,
    pfRate: 9.5,
    grandTotal: 218.5,
    calculatedTotal: 218.5,
    roundingAdjustment: 0,
  },
  dbProductDetails: [mockProduct],
  removedDbProductDetails: [],
  subtotal_bc: null,
};

export const mockOverviewValues = {
  comment: "  Test comment  ",
  buyerReferenceNumber: "REF-123",
  uploadedDocumentDetails: [],
  quoteUsers: [{ id: 1 }, { userId: 2 }],
  quoteDivisionId: { id: "10" },
  orderType: { id: "20" },
  tagsList: [{ id: 1 }, { id: 2 }],
  validityFrom: "2024-01-01",
  validityTill: "2024-12-31",
  quotationDetails: [{ quoteName: "Quote Name" }],
  approvalInitiated: false,
  orderUsers: [{ id: 3 }, { userId: 4 }],
  orderDivisionId: { id: 15 },
};

export const mockOrderValues = {
  buyerCurrencyId: { id: 1 },
  branchBusinessUnit: { id: 100 },
  registerAddressDetails: {
    soldToCode: "BUYER001",
    branchName: "Main Branch",
  },
  isInter: false,
  pfRate: 5,
  orderTerms: {
    pfPercentage: 5,
    pfValue: 10,
  },
  cartValue: {
    totalValue: 200,
    totalTax: 20,
    totalShipping: 10,
    calculatedTotal: 230,
    grandTotal: 230,
    taxableAmount: 200,
    pfRate: 10,
    totalLP: 240,
    totalItems: 2,
    roundingAdjustment: 0,
  },
  VDapplied: false,
  VDDetails: {
    subTotal: 190,
    subTotalVolume: 190,
    overallTax: 19,
    taxableAmount: 190,
    pfRate: 9.5,
    grandTotal: 218.5,
    calculatedTotal: 218.5,
    roundingAdjustment: 0,
  },
  dbProductDetails: [mockProduct],
  removedDbProductDetails: [],
};

export const mockInitialValues = {
  orderDetails: [
    {
      cartValue: {
        totalValue: 180,
        totalTax: 18,
        totalShipping: 9,
        pfRate: 9,
      },
    },
  ],
};

export const mockPreviousVersionDetails = {
  subTotal: 180,
  overallTax: 18,
  overallShipping: 9,
  totalPfValue: 9,
};

export const mockQuoteData = {
  updatedBuyerStatus: "QUOTE RECEIVED",
  validityTill: "2025-12-31",
  reorder: false,
};

export const mockCancelledQuoteData = {
  updatedBuyerStatus: "CANCELLED",
};

export const mockExpiredQuoteData = {
  updatedBuyerStatus: "QUOTE RECEIVED",
  validityTill: "2020-01-01",
};

export const mockOpenQuoteData = {
  updatedBuyerStatus: "OPEN",
};

export const mockOrderPlacedQuoteData = {
  updatedBuyerStatus: "ORDER PLACED",
};

export const mockReorderQuoteData = {
  updatedBuyerStatus: "ORDER PLACED",
  validityTill: "2025-12-31",
  reorder: true,
};
