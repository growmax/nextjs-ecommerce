import { discountClient, RequestContext } from "../client";
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
  success?: boolean;
  data: DiscountItem[];
  message?: string;
  status?: string;
}

export interface DiscountRequest {
  Productid: number[];
  CurrencyId: number;
  BaseCurrencyId: number;
  sellerId: string;
}

export interface DiscountRequestBody {
  Productid: number[];
  CurrencyId: number;
  BaseCurrencyId: number;
  companyId: number;
  currencyCode?: string;
}

export interface DiscountRequestWithContext {
  userId: number;
  tenantId: string;
  body: DiscountRequestBody;
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
  protected defaultClient = discountClient;

  /**
   * Get discount with context (userId, tenantId)
   * Payload format: { userId, tenantId, body: { Productid, CurrencyId, BaseCurrencyId, companyId, currencyCode } }
   *
   * Matches the old API route handler pattern:
   * - Sends full payload with userId, tenantId, and body to backend
   * - Backend expects: { userId, tenantId, body: {...} }
   * - Returns: { success: true, data: [...] }
   */
  async getDiscount(
    request: DiscountRequestWithContext
  ): Promise<DiscountApiResponse> {
    // Use callWith to pass context with tenantCode for x-tenant header
    const context: RequestContext = {
      userId: request.userId,
      companyId: request.body.companyId,
      tenantCode: request.tenantId,
    };

    return (await this.callWith(
      `/discount/getDiscount`,
      {
        userId: request.userId,
        tenantId: request.tenantId,
        body: request.body,
      },
      {
        method: "POST",
        context,
      }
    )) as DiscountApiResponse;
  }

  /**
   * Legacy method - maintains backward compatibility
   * @deprecated Use getDiscount with DiscountRequestWithContext instead
   */
  async getDiscountLegacy(body: DiscountRequest): Promise<DiscountApiResponse> {
    return (await this.call(
      `/discount/getDiscount`,
      body,
      "POST"
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
