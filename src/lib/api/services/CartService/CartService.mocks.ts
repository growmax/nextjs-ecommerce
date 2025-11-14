// Mocks for CartService
// These mocks are for testing the service in isolation.

import type {
  Cart,
  CartCount,
  CartParams,
  ClearCartBySellerParams,
} from "./CartService";

export const mockCartParams: CartParams = {
  userId: "123",
  pos: 0,
};

export const mockCartParamsWithPos: CartParams = {
  userId: "123",
  pos: 1,
};

export const mockCartCount: CartCount = {
  count: 5,
  userId: "123",
};

export const mockCart: Cart = {
  id: "cart-123",
  userId: "123",
};

export const mockClearCartBySellerParams: ClearCartBySellerParams = {
  userId: "123",
  sellerId: "456",
};
