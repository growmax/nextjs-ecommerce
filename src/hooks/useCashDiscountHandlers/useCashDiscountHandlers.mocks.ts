// Mock data for useCashDiscountHandlers tests
import type { CartItem } from "@/types/calculation/cart";
import type { PaymentTerm } from "@/lib/api";

export const mockProduct: CartItem = {
  productId: 1,
  productName: "Test Product",
  quantity: 2,
  unitPrice: 100,
  totalPrice: 200,
  originalUnitPrice: 100,
  unitListPrice: 120,
  cashdiscountValue: 0,
  discount: 10,
  discountPercentage: 10,
};

export const mockProducts: CartItem[] = [
  mockProduct,
  {
    productId: 2,
    productName: "Test Product 2",
    quantity: 1,
    unitPrice: 50,
    totalPrice: 50,
    originalUnitPrice: 50,
    unitListPrice: 60,
    cashdiscountValue: 0,
    discount: 5,
    discountPercentage: 5,
  },
];

export const mockPaymentTerms: PaymentTerm = {
  id: 1,
  paymentTerms: "Net 30",
  description: "Payment due in 30 days",
  cashdiscount: true,
  cashdiscountValue: 5,
} as any;

export const mockProductsWithDiscount: CartItem[] = mockProducts.map(p => ({
  ...p,
  cashdiscountValue: 5,
}));

export const mockSetProducts = jest.fn();
export const mockSetCartValue = jest.fn();
