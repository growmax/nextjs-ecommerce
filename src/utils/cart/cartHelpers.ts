import type { CartItem } from "@/types/calculation/cart";

/**
 * Check if a product is already in the cart
 * Supports multi-seller cart by matching sellerId
 * Migrated from buyer-fe/src/hooks/useCart.js
 *
 * @param cart - Current cart items
 * @param productId - Product ID to check
 * @param itemNo - Optional item number (for legacy support)
 * @param sellerId - Optional seller ID (for multi-seller cart)
 * @returns CartItem if found, undefined otherwise
 */
export function getIsInCart(
  cart: CartItem[],
  productId: number | string,
  itemNo?: string | number | null,
  sellerId?: string | number | null
): CartItem | undefined {
  if (sellerId) {
    // Multi-seller cart: match productId and sellerId
    return cart.find(
      item => item.productId == productId && item.sellerId == sellerId
    );
  } else if (itemNo) {
    // Legacy behavior: match productId and itemNo
    return cart.find(
      item => item.productId == productId && item.itemNo == itemNo
    );
  } else {
    // Legacy behavior: match only productId
    return cart.find(item => item.productId == productId);
  }
}

/**
 * Validate a cart item
 * Checks MOQ, packaging quantity, and other validations
 *
 * @param item - Cart item to validate
 * @returns Error message string or null if valid
 */
export function validateCartItem(item: CartItem): string | null {
  if (!item.quantity || item.quantity <= 0) {
    return "Quantity must be greater than 0";
  }

  return null; // Validation will be done in useCart hook
}

/**
 * Check inventory availability
 *
 * @param item - Cart item to check
 * @returns true if in stock, false otherwise
 */
export function checkInventory(item: CartItem): boolean {
  return item.inventoryResponse?.inStock ?? true;
}
