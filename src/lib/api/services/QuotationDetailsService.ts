import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Product Details Interface
export interface QuotationProductDetail {
  itemNo?: string | number;
  new?: boolean;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  taxAmount?: number;
  totalPrice?: number;
  isSprRequested?: boolean;
  sprRequested?: boolean;
  [key: string]: unknown;
}

// Quotation Detail Interface
export interface QuotationDetail {
  dbProductDetails?: QuotationProductDetail[];
  quoteName?: string;
  quotationIdentifier?: string;
  buyerCompanyName?: string;
  sellerCompanyName?: string;
  buyerBranchName?: string;
  sellerBranchName?: string;
  calculatedTotal?: number;
  subTotal?: number;
  taxableAmount?: number;
  grandTotal?: number;
  overallTax?: number;
  overallShipping?: number;
  createdDate?: string;
  lastUpdatedDate?: string;
  quoteTerms?: {
    paymentTerms?: string;
    paymentTermsCode?: string;
    deliveryTerms?: string;
    deliveryTermsCode?: string;
    freight?: string;
    insurance?: string;
    warranty?: string;
    cashdiscount?: boolean;
    cashdiscountValue?: number;
    [key: string]: unknown;
  };
  billingAddressDetails?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCodeId?: string;
    gst?: string;
    [key: string]: unknown;
  };
  shippingAddressDetails?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCodeId?: string;
    gst?: string;
    [key: string]: unknown;
  };
  registerAddressDetails?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: unknown;
  };
  sellerAddressDetail?: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    sellerBranchName?: string;
    sellerCompanyName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Main Quotation Data Interface
export interface QuotationData {
  quotationIdentifier: string;
  quoteName?: string;
  updatedSellerStatus?: string;
  updatedBuyerStatus?: string;
  saved?: boolean;
  createdDate?: string;
  lastUpdatedDate?: string;
  quotationDetails?: QuotationDetail[];
  buyerCompanyName?: string;
  sellerCompanyName?: string;
  buyerCompanyBranchName?: string;
  sellerCompanyBranchName?: string;
  grandTotal?: number;
  subTotal?: number;
  taxableAmount?: number;
  itemCount?: number;
  customerRequiredDate?: string | null;
  leadIdentifier?: string | null;
  orderIdentifier?: string[] | null;
  buyerCurrencySymbol?: {
    currencyCode: string;
    decimal: string;
    description: string;
    id: number;
    precision: number;
    symbol: string;
    tenantId: number;
    thousand: string;
  };
  curencySymbol?: {
    currencyCode: string;
    decimal: string;
    description: string;
    id: number;
    precision: number;
    symbol: string;
    tenantId: number;
    thousand: string;
  };
  quoteUsers?: Array<{
    id: number;
    displayName: string;
    email: string;
    picture: string;
    name?: string | null;
    status: string;
  }>;
  approvalGroupId?: {
    approvalName: string;
    discount: boolean;
    id: number;
    tenantId: number;
  } | null;
  approvalInitiated?: boolean;
  SPRRequested?: boolean;
  [key: string]: unknown;
}

// Quotation Details Response Interface
export interface QuotationDetailsResponse {
  success: boolean;
  data: QuotationData;
  message?: string;
}

// Fetch Quotation Details Request Interface
export interface FetchQuotationDetailsRequest {
  quotationIdentifier: string;
  userId: number;
  companyId: number;
}

export class QuotationDetailsService extends BaseService<QuotationDetailsService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Fetch quotation details by identifier
   * @param request - Object containing quotationIdentifier, userId, and companyId
   * @returns Promise with quotation details
   */
  async fetchQuotationDetails(
    request: FetchQuotationDetailsRequest
  ): Promise<QuotationDetailsResponse> {
    const { quotationIdentifier, userId, companyId } = request;

    const response = (await this.call(
      `/quotes/fetchQuotationDetails?quotationIdentifier=${quotationIdentifier}&userId=${userId}&companyId=${companyId}`,
      {},
      "GET"
    )) as { data: QuotationData };

    return {
      success: true,
      data: response.data,
    };
  }

  /**
   * Server-safe version of fetchQuotationDetails
   * @param request - Object containing quotationIdentifier, userId, and companyId
   * @returns Promise with quotation details or null on error
   */
  async fetchQuotationDetailsServerSide(
    request: FetchQuotationDetailsRequest
  ): Promise<QuotationDetailsResponse | null> {
    const { quotationIdentifier, userId, companyId } = request;

    const response = (await this.callSafe(
      `/quotes/fetchQuotationDetails?quotationIdentifier=${quotationIdentifier}&userId=${userId}&companyId=${companyId}`,
      {},
      "GET"
    )) as { data: QuotationData } | null;

    if (!response) {
      return null;
    }

    return {
      success: true,
      data: response.data,
    };
  }
}

export default QuotationDetailsService.getInstance();
