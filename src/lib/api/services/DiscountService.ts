import { BaseService } from "./BaseService";
import { coreCommerceClient } from "../client";

export interface Discount {
  Value: number;
  startDate: string | null;
  min_qty: number;
  max_qty: number;
  discountId: string;
  minAmount: number;
  maxAmount: number;
  CantCombineWithOtherDisCounts?: boolean;
}

export interface DiscountItem {
  MasterPrice: number;
  BasePrice: number;
  isProductAvailableInPriceList: boolean;
  discounts: Discount[];
  ProductVariantId: number;
  isApprovalRequired: boolean;
  PricelistCode: string;
  plnErpCode: string;
  isOveridePricelist: boolean;
  sellerId: string;
  sellerName: string;
}

export interface DiscountApiResponse {
  data: DiscountItem[];
}

export interface DiscountRequest {
  Productid: number[];
  CurrencyId: number;
  BaseCurrencyId: number;
  sellerId: string;
}

export interface GetAllSellerPricesRequest {
  Productid: number[];
  CurrencyId: number;
  BaseCurrencyId: number;
  CompanyId: number;
}

export interface SellerPrice {
  productId: number;
  sellerId: number;
  sellerName: string;
  price: number;
  currency: string;
  availability: boolean;
  leadTime: number;
  minimumOrderQuantity: number;
}

export interface GetAllSellerPricesResponse {
  data: SellerPrice[];
  status: string;
  message: string;
}
export class DiscountService extends BaseService<DiscountService> {
  protected defaultClient = coreCommerceClient;

  async getDiscount(body: DiscountRequest): Promise<DiscountApiResponse> {
    return (await this.call(
      `/discount/getDiscount`,
      body,
      "POST" // Your curl shows it's actually a POST with body
    )) as DiscountApiResponse;
  }

  async getAllSellerPrices(
    request: GetAllSellerPricesRequest
  ): Promise<GetAllSellerPricesResponse> {
    return (await this.callWith(
      "/discounts/discount/getAllSellerPrices",
      request,
      {
        method: "POST",
      }
    )) as GetAllSellerPricesResponse;
  }

  async getAllSellerPricesServerSide(
    request: GetAllSellerPricesRequest
  ): Promise<GetAllSellerPricesResponse | null> {
    return (await this.callWithSafe(
      "/discounts/discount/getAllSellerPrices",
      request,
      {
        method: "POST",
      }
    )) as GetAllSellerPricesResponse | null;
  }
}
export default DiscountService.getInstance();
