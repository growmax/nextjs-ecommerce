import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "../client";

export interface Cart {
  id: string;
  userId: string;
}

export class CartService {
  private static instance: CartService;

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Get user's cart - matches your example URL pattern
   */
  async getCart(userId: string, context: RequestContext): Promise<Cart> {
    const client = createClientWithContext(coreCommerceClient, context);

    // This matches your URL pattern: ${Base_url}carts?userId=${userId}&find=ByUserId&pos=0
    const response = await client.get(`/carts`, {
      params: {
        userId,
        find: "ByUserId",
        pos: 0,
      },
    });

    return response.data;
  }

  /**
   * Get cart for server-side rendering
   */
  async getCartServerSide(
    userId: string,
    context: RequestContext
  ): Promise<Cart | null> {
    try {
      return await this.getCart(userId, context);
    } catch {
      return null;
    }
  }
}

export default CartService.getInstance();
