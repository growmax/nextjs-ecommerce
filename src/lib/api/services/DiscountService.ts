import { discountClient } from "../client";
import { BaseService } from "./BaseService";

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
export class DiscountService extends BaseService<DiscountService> {
  protected defaultClient = discountClient;

  async getDiscount(body: DiscountRequest): Promise<DiscountApiResponse> {
    return (await this.call(
      `/discount/getDiscount`,
      body,
      "POST" // Your curl shows it's actually a POST with body
    )) as DiscountApiResponse;
  }
}
export default DiscountService.getInstance();
