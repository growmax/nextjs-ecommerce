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

export interface CheckVolumeDiscountEnabledResponse {
  data?: boolean | unknown;
  message?: string;
  status?: string;
}

export class DiscountService extends BaseService<DiscountService> {
  protected defaultClient = discountClient;

  /**
   * Get discount with context (userId, tenantId)
   * Payload format: { Productid, CurrencyId, BaseCurrencyId }
   * CompanyId is sent as a query parameter in the URL
   *
   * Note: tenantId is sent via x-tenant header (from context), not in request body
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

    // Extract only required fields (exclude companyId and currencyCode from body)
    const { companyId, currencyCode: _currencyCode, ...payload } = request.body;

    // Build endpoint URL with CompanyId as query parameter
    const endpoint = `/discount/getDiscount?CompanyId=${companyId}`;

    // Send payload directly without wrapper: { Productid, CurrencyId, BaseCurrencyId }
    return (await this.callWith(
      endpoint,
      {
        Productid: payload.Productid,
        CurrencyId: payload.CurrencyId,
        BaseCurrencyId: payload.BaseCurrencyId,
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

  /**
   * Check if volume discount is enabled for a company
   * Usage: DiscountService.checkIsVDEnabledByCompanyId(companyId)
   * @param companyId - The company ID to check
   * @returns Promise<CheckVolumeDiscountEnabledResponse>
   */
  async checkIsVDEnabledByCompanyId(
    companyId: number | string
  ): Promise<CheckVolumeDiscountEnabledResponse> {
    const endpoint = `/discount/CheckorderDiscount?CompanyId=${companyId}`;
    return (await this.call(
      endpoint,
      {},
      "POST"
    )) as CheckVolumeDiscountEnabledResponse;
  }

  /**
   * Server-side version that returns null on error
   * Usage: DiscountService.checkIsVDEnabledByCompanyIdServerSide(companyId)
   * @param companyId - The company ID to check
   * @returns Promise<CheckVolumeDiscountEnabledResponse | null>
   */
  async checkIsVDEnabledByCompanyIdServerSide(
    companyId: number | string
  ): Promise<CheckVolumeDiscountEnabledResponse | null> {
    const endpoint = `/discount/CheckorderDiscount?CompanyId=${companyId}`;
    return (await this.callSafe(
      endpoint,
      {},
      "POST"
    )) as CheckVolumeDiscountEnabledResponse | null;
  }

  /**
   * Server-side version with context (for API routes)
   * Usage: DiscountService.checkIsVDEnabledByCompanyIdWithContext(companyId, context)
   * @param companyId - The company ID to check
   * @param context - Request context with accessToken and tenantCode
   * @returns Promise<CheckVolumeDiscountEnabledResponse | null>
   */
  async checkIsVDEnabledByCompanyIdWithContext(
    companyId: number | string,
    context: RequestContext
  ): Promise<CheckVolumeDiscountEnabledResponse | null> {
    const endpoint = `/discount/CheckorderDiscount?CompanyId=${companyId}`;
    return (await this.callWithSafe(
      endpoint,
      {},
      {
        context,
        method: "POST",
      }
    )) as CheckVolumeDiscountEnabledResponse | null;
  }
}
export default DiscountService.getInstance();
