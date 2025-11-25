import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Define cart-related data types
export interface Cart {
  id: string;
  userId: string;
}

export interface CartCount {
  count: number;
  userId: string;
}

export interface CartParams {
  userId: string;
  pos?: number;
}

export interface ClearCartBySellerParams {
  userId: string;
  sellerId: string;
}

export class CartService extends BaseService<CartService> {
  // Configure default client for cart operations
  protected defaultClient = coreCommerceClient;

  /**
   * 🚀 SIMPLIFIED: Get cart count by user ID (auto-context)
   * Usage: CartService.getCartCount({ userId: "1339", pos: 0 })
   */
  async getCartCount(params: CartParams): Promise<CartCount> {
    const { userId, pos = 0 } = params;

    return (await this.call(
      `/carts/findCartsCountByUserId?userId=${userId}&pos=${pos}`,
      {},
      "GET"
    )) as CartCount;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: CartService.getCartCountServerSide({ userId: "1339", pos: 0 })
   */
  async getCartCountServerSide(params: CartParams): Promise<CartCount | null> {
    const { userId, pos = 0 } = params;

    return (await this.callSafe(
      `/carts/findCartsCountByUserId?userId=${userId}&pos=${pos}`,
      {},
      "GET"
    )) as CartCount | null;
  }

  /**
   * 🚀 SIMPLIFIED: Get user's cart (auto-context)
   * Usage: CartService.getCart({ userId: "1032", pos: 0 })
   */
  async getCart(params: CartParams): Promise<Cart> {
    const { userId, pos = 0 } = params;

    return (await this.call(
      `/carts?userId=${userId}&find=ByUserId&pos=${pos}`,
      {},
      "GET"
    )) as Cart;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side get cart (auto-context + error handling)
   * Usage: CartService.getCartServerSide({ userId: "1032", pos: 0 })
   */
  async getCartServerSide(params: CartParams): Promise<Cart | null> {
    const { userId, pos = 0 } = params;

    return (await this.callSafe(
      `/carts?userId=${userId}&find=ByUserId&pos=${pos}`,
      {},
      "GET"
    )) as Cart | null;
  }

  /**
   * 🗑️ SIMPLIFIED: Delete user's cart (auto-context)
   * Usage: CartService.deleteCart({ userId: "1032", pos: 0 })
   */
  async deleteCart(params: CartParams): Promise<unknown> {
    const { userId, pos = 0 } = params;

    return await this.call(
      `/carts?userId=${userId}&find=ByUserId&pos=${pos}`,
      {},
      "DELETE"
    );
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side delete cart (auto-context + error handling)
   * Usage: CartService.deleteCartServerSide({ userId: "1032", pos: 0 })
   */
  async deleteCartServerSide(params: CartParams): Promise<unknown | null> {
    const { userId, pos = 0 } = params;

    return await this.callSafe(
      `/carts?userId=${userId}&find=ByUserId&pos=${pos}`,
      {},
      "DELETE"
    );
  }

  /**
   * 🧹 SIMPLIFIED: Clear cart by seller (auto-context)
   * Usage: CartService.clearCartBySeller({ userId: "1032", sellerId: "456" })
   */
  async clearCartBySeller(params: ClearCartBySellerParams): Promise<unknown> {
    const { userId, sellerId } = params;

    return await this.call(
      `/carts/clearCartBySeller?userId=${userId}&sellerId=${sellerId}`,
      {},
      "DELETE"
    );
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side clear cart by seller (auto-context + error handling)
   * Usage: CartService.clearCartBySellerServerSide({ userId: "1032", sellerId: "456" })
   */
  async clearCartBySellerServerSide(
    params: ClearCartBySellerParams
  ): Promise<unknown | null> {
    const { userId, sellerId } = params;

    return await this.callSafe(
      `/carts/clearCartBySeller?userId=${userId}&sellerId=${sellerId}`,
      {},
      "DELETE"
    );
  }
}

export default CartService.getInstance();
