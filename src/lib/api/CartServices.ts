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
    itemNo: number;
    pos: number;
    addBundle: boolean;
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
  sellerId: number;
  tenantId: string | number;
  userId: number;
}

export class CartService extends BaseService<CartService> {
  protected defaultClient = coreCommerceClient;
  async getCart(params: number): Promise<unknown> {
    return this.call(
      `carts?userId=${params}&find=ByUserId&pos=0`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async geBilling(params: cartBilling): Promise<unknown> {
    return this.call(
      `branches/readBillingBranch/${params?.userId}?companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getModule(params: cartBilling): Promise<unknown> {
    return this.call(
      `module_setting/getAllModuleSettings?userId=${params?.userId}&companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getShipping(params: cartBilling): Promise<unknown> {
    return this.call(
      `branches/readShippingBranch/${params?.userId}?companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getCurrencyModuleSettings(params: cartBilling): Promise<unknown> {
    return this.call(
      `module_setting/getAllCurrencyModuleSettings?userId=${params?.userId}&companyId=${params?.companyId}`,
      {}, // Empty body as per the original API route
      "GET"
    );
  }
  async getAllSellerPrice(
    params: SellerPrice & { body: unknown }
  ): Promise<unknown> {
    return this.callWith(
      `discount/getAllSellerPrices`,
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
      `discount/getDiscount`,
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

    return this.callWith(`carts?userId=${userId}&pos=0`, params.body, {
      method: method as "POST" | "PUT" | "DELETE", // Support POST, PUT, and DELETE methods
      client: coreCommerceClient, // Use coreCommerceClient for cart operations
    });
  }
  async deleteCart(params: DeleteCartRequest): Promise<unknown> {
    const { userId, tenantId, productId, itemNo, sellerId, pos } = params;

    return this.call(
      `carts/${userId}?productsId=${productId}&itemNo=${itemNo}&pos=0`,
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
      `carts?userId=${params?.userId}&find=ByUserId&pos=0`,
      {},
      "DELETE"
    );
  }
}
export default CartService.getInstance();
