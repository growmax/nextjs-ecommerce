// Mocks for quotationPaymentDTO utilities
// These mocks are for testing the utilities in isolation.

import type { CartItem } from "@/types/calculation/cart";

export interface BundleProductPayload {
  bundleSelected?: number;
  isBundleSelected_fe?: number;
  [key: string]: unknown;
}

export interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  pinCodeId?: string;
  pincode?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  email?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  [key: string]: unknown;
}

export const mockBundleProducts: BundleProductPayload[] = [
  {
    bundleSelected: 1,
    isBundleSelected_fe: 1,
    productId: "bundle-1",
    unitListPrice: 100,
  },
  {
    bundleSelected: 0,
    isBundleSelected_fe: 0,
    productId: "bundle-2",
    unitListPrice: 100,
  },
  {
    bundleSelected: 1,
    isBundleSelected_fe: 1,
    productId: "bundle-3",
    unitListPrice: 100,
  },
] as any;

export const mockCartItem: CartItem = {
  productId: "prod-1",
  quantity: 10,
  price: 100,
  unitPrice: 100,
  totalPrice: 1000,
  lineNo: 1,
  itemNo: 1,
  new: false,
} as CartItem;

export const mockCartItemWithVolumeDiscount: CartItem = {
  ...mockCartItem,
  volumeDiscountApplied: true,
} as CartItem;

export const mockAddressDetails: AddressDetails = {
  addressLine: "123 Main St",
  branchName: "Main Branch",
  city: "New York",
  state: "NY",
  country: "USA",
  countryCode: "US",
  pinCodeId: "10001",
  pincode: "10001",
  gst: "GST123",
  district: "Manhattan",
  locality: "Downtown",
  mobileNo: "1234567890",
  phone: "0987654321",
  email: "test@example.com",
  billToCode: "BILL001",
  shipToCode: "SHIP001",
  soldToCode: "SOLD001",
};

export const mockValues = {
  dbProductDetails: [mockCartItem],
  removedDbProductDetails: [],
  VDapplied: false,
  cartValue: {
    totalValue: 1000,
    totalTax: 100,
    taxableAmount: 900,
    calculatedTotal: 1100,
    roundingAdjustment: 0,
    grandTotal: 1100,
    totalLP: 50,
    pfRate: 5,
    totalShipping: 50,
    totalItems: 10,
  },
  buyerCurrencyId: {
    id: 1,
  },
  registerAddressDetails: mockAddressDetails,
  billingAddressDetails: mockAddressDetails,
  shippingAddressDetails: mockAddressDetails,
  sellerAddressDetail: {
    ...mockAddressDetails,
    sellerCompanyName: "Seller Company",
    sellerBranchName: "Seller Branch",
  },
  buyerBranchId: 1,
  buyerBranchName: "Buyer Branch",
  buyerCompanyId: 1,
  buyerCompanyName: "Buyer Company",
  sellerBranchId: 2,
  sellerBranchName: "Seller Branch",
  sellerCompanyId: 2,
  sellerCompanyName: "Seller Company",
  customerRequiredDate: "2024-12-31",
  branchBusinessUnit: {
    id: 1,
  },
  quoteTerms: {
    pfPercentage: 5,
    pfValue: 50,
  },
  pfRate: 5,
  isInter: false,
};

export const mockOverviewValues = {
  buyerReferenceNumber: "REF-001",
  comment: "Test comment",
  uploadedDocumentDetails: [],
  quoteUsers: [{ id: 1, userId: 1 }],
  quoteDivisionId: { id: 1 },
  quoteType: { id: 1 },
  tagsList: [{ id: 1 }],
};

export const mockInitialValues = {
  quotationDetails: [
    {
      buyerReferenceNumber: "INITIAL-REF",
      comment: "Initial comment",
      buyerBranchId: 1,
      buyerBranchName: "Initial Branch",
      buyerCompanyId: 1,
      buyerCompanyName: "Initial Company",
      customerRequiredDate: "2024-12-30",
      registerAddressDetails: mockAddressDetails,
      billingAddressDetails: mockAddressDetails,
      shippingAddressDetails: mockAddressDetails,
      sellerAddressDetail: mockAddressDetails,
    },
  ],
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

export const mockProductWithBundle = {
  ...mockCartItem,
  bundleProducts: mockBundleProducts,
} as unknown as CartItem;

export const mockProductWithDiscount = {
  ...mockCartItem,
  discountDetails: {
    discountId: "disc-1",
    Value: 10,
    BasePrice: 100,
    MasterPrice: 100,
  },
} as CartItem;

export const mockProductWithAccountOwner = {
  ...mockCartItem,
  accountOwner: {
    id: 1,
  },
} as CartItem;

export const mockProductWithBusinessUnit = {
  ...mockCartItem,
  businessUnit: {
    id: 1,
  },
} as CartItem;

export const mockProductWithDivision = {
  ...mockCartItem,
  division: {
    id: 1,
  },
} as CartItem;

export const mockProductWithWarehouse = {
  ...mockCartItem,
  wareHouse: {
    id: 1,
    wareHouseName: "Warehouse 1",
  },
} as CartItem;

export const mockProductWithTaxes = {
  ...mockCartItem,
  interTaxBreakup: [{ taxName: "GST", taxPercentage: 10, compound: false }],
  intraTaxBreakup: [
    { taxName: "CGST", taxPercentage: 10, compound: false },
    { taxName: "SGST", taxPercentage: 10, compound: false },
  ],
} as CartItem;
