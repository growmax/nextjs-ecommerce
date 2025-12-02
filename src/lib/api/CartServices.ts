import { coreCommerceClient, discountClient } from "./client";
import { BaseService } from "./services/BaseService";
export interface cartBilling {
  userId: string | number;
  companyId: string | number;
}
export interface SellerPrice {
  userId: number;
  tenantId: string;
  body: {
    Productid: number[]; // array of product IDs
    CurrencyId: number;
    BaseCurrencyId: number;
    CompanyId: number;
  };
}
export interface emptyCart {
  userId: string | number;
}
export interface AddToCartRequest {
  userId: number;
  tenantId: string;
  useMultiSellerCart: boolean;
  body: {
    productsId: number;
    productId: number;
    quantity: number;
    itemNo?: number;
    pos: number;
    sellerId?: number;
    sellerName?: string;
    sellerLocation?: string;
    price?: number;
  };
}

export interface DiscountRequest {
  userId: number;
  tenantId: string;
  body: {
    Productid: number[];
    ProductData: {
      ProductVariantId: number;
      quantity: number;
    }[];
    CurrencyId: number;
    BaseCurrencyId: number;
    companyId: number;
    sellerId: string;
  };
}
export interface DeleteCartRequest {
  itemNo: number;
  pos: number;
  productId: number;
  sellerId?: number;
  tenantId: string | number;
  userId: number;
}

export interface AddMultipleItemsRequest {
  userId: number;
  tenantId: string;
  body: Array<{
    productsId: number;
    productId: number;
    quantity: number;
    sellerId?: number;
    sellerName?: string;
    sellerLocation?: string;
    price?: number;
    itemNo?: number;
    pos?: number;
  }>;
}

export interface ClearCartBySellerRequest {
  userId: number;
  sellerId: number;
  tenantId: string;
}

export interface GetCartRequest {
  userId: number;
  tenantId?: string;
  useMultiSellerCart?: boolean;
}

export class CartService extends BaseService<CartService> {
  protected defaultClient = coreCommerceClient;
  async getCart(params: number | GetCartRequest): Promise<unknown> {
    // Support both legacy (number) and new (object) format
    if (typeof params === "number") {
      return this.call(
        `/carts?userId=${params}&find=ByUserId&pos=0`,
        {},
        "GET"
      );
    }

    const { userId } = params;
    // Note: useMultiSellerCart flag is handled by backend automatically based on cart data structure
    // The backend returns multi-seller cart when items have sellerId fields
    return this.call(`/carts?userId=${userId}&find=ByUserId&pos=0`, {}, "GET");
  }
  async geBilling(params: cartBilling): Promise<unknown> {
    return this.call(
      `/branches/readBillingBranch/${params?.userId}?companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getModule(params: cartBilling): Promise<unknown> {
    return this.call(
      `/module_setting/getAllModuleSettings?userId=${params?.userId}&companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getShipping(params: cartBilling): Promise<unknown> {
    return this.call(
      `/branches/readShippingBranch/${params?.userId}?companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getCurrencyModuleSettings(params: cartBilling): Promise<unknown> {
    return this.call(
      `/module_setting/getAllCurrencyModuleSettings?userId=${params?.userId}&companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  /**
   * @deprecated Use DiscountService.getDiscount() instead. This method will be removed in a future version.
   * getAllSellerPrice is no longer needed as discount service returns all sellers' pricing when sellerId is not provided.
   */
  async getAllSellerPrice(
    params: SellerPrice & { body: unknown }
  ): Promise<unknown> {
    return this.callWith(
      `/discount/getAllSellerPrices`,
      params.body, // Pass the actual body data here instead of {}
      {
        method: "POST",
        client: discountClient,
      }
    );
  }
  async getDiscount(
    params: DiscountRequest & { body: unknown }
  ): Promise<unknown> {
    return this.callWith(
      `/discount/getDiscount`,
      params.body, // Pass the actual body data here instead of {}
      {
        method: "POST",
        client: discountClient,
      }
    );
  }
  async postCart(
    params: AddToCartRequest & { body: unknown; method?: string }
  ): Promise<unknown> {
    const { userId, method = "PUT" } = params;

    console.log("🔷 [CartServices.postCart] Called with:", {
      userId,
      method,
      tenantId: params.tenantId,
      useMultiSellerCart: params.useMultiSellerCart,
      body: params.body,
    });

    // For DELETE method, use the specific delete endpoint pattern
    if (method === "DELETE" && params.body && typeof params.body === "object") {
      const body = params.body as {
        productsId?: number;
        productId?: number;
        itemNo?: number;
      };
      if (body.productsId && body.itemNo) {
        console.log("🗑️ [CartServices.postCart] Using DELETE endpoint");
        return this.call(
          `/carts/${userId}?productsId=${body.productsId}&itemNo=${body.itemNo}&pos=0`,
          {},
          "DELETE"
        );
      }
    }

    const endpoint = `/carts?userId=${userId}&pos=0`;
    console.log("📡 [CartServices.postCart] Making API call:", {
      endpoint,
      method,
      body: params.body,
    });

    const result = await this.callWith(endpoint, params.body, {
      method: method as "POST" | "PUT", // POST and PUT use same endpoint
      client: coreCommerceClient,
    });

    console.log("✅ [CartServices.postCart] API call completed:", result);
    return result;
  }
  async deleteCart(params: DeleteCartRequest): Promise<unknown> {
    const { userId, tenantId, productId, itemNo, sellerId, pos } = params;

    return this.call(
      `/carts/${userId}?productsId=${productId}&itemNo=${itemNo}&pos=0`,
      {
        userId,
        productId,
        itemNo,
        sellerId,
        tenantId,
        pos,
      },
      "DELETE"
    );
  }
  async emptyCart(params: emptyCart): Promise<unknown> {
    return this.call(
      `/carts?userId=${params?.userId}&find=ByUserId&pos=0`,
      {},
      "DELETE"
    );
  }

  /**
   * Add multiple items to cart at once
   * Endpoint: POST /carts/addMultipleProducts?userId={userId}&pos=0
   */
  async addMultipleItems(params: AddMultipleItemsRequest): Promise<unknown> {
    const { userId, body } = params;
    return this.callWith(
      `/carts/addMultipleProducts?userId=${userId}&pos=0`,
      body,
      {
        method: "POST",
        client: coreCommerceClient,
      }
    );
  }

  /**
   * Clear cart items for a specific seller
   * Endpoint: DELETE /carts/clearCartBySeller?userId={userId}&sellerId={sellerId}
   */
  async clearCartBySeller(params: ClearCartBySellerRequest): Promise<unknown> {
    const { userId, sellerId } = params;
    return this.call(
      `/carts/clearCartBySeller?userId=${userId}&sellerId=${sellerId}`,
      {},
      "DELETE"
    );
  }
}

// Lazy getter pattern to ensure instance is always available
// This handles cases where the module might be reloaded after page refresh
let cartServiceInstance: CartService | null = null;

const getCartServiceInstance = (): CartService => {
  if (!cartServiceInstance) {
    try {
      cartServiceInstance = CartService.getInstance();
    } catch (error) {
      console.error("Error initializing CartService:", error);
      // Fallback: create a new instance if getInstance fails
      cartServiceInstance = new CartService();
    }
  }
  
  // Verify the instance has the required methods
  if (!cartServiceInstance || typeof cartServiceInstance.postCart !== "function") {
    console.error("CartService instance is not properly initialized, recreating...");
    // Force recreation
    cartServiceInstance = new CartService();
  }
  
  return cartServiceInstance;
};

// Create a proxy object that always returns a valid instance
const cartServiceProxy = new Proxy({} as CartService, {
  get(_target, prop) {
    const instance = getCartServiceInstance();
    const value = (instance as any)[prop];
    // If it's a function, bind it to the instance
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    const instance = getCartServiceInstance();
    (instance as any)[prop] = value;
    return true;
  },
});

export default cartServiceProxy;
