import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

export interface QuoteSubmissionPayload {
  // Quote Basic Info
  quoteName: string;
  quoteIdentifier?: string;
  versionCreatedTimestamp: string;

  // Customer Information
  buyerReferenceNumber?: string | null;
  customerRequiredDate?: string | null;
  comment?: string | null;

  // SPR Details
  sprDetails?: {
    companyName?: string;
    projectName?: string;
    competitorNames?: string[];
    priceJustification?: string;
    spr?: boolean;
    targetPrice?: number;
    sprRequestedDiscount?: number;
  };
  isSPRRequested?: boolean;

  // Address Details
  billingAddressDetails?: Record<string, unknown>;
  buyerBranchId?: number;
  shippingAddressDetails?: Record<string, unknown>;
  registerAddressDetails?: Record<string, unknown>;

  // Product Details
  dbProductDetails: Array<Record<string, unknown>>;
  removedDbProductDetails?: Array<Record<string, unknown>>;

  // Cart Calculations
  cartValue?: Record<string, unknown>;
  subTotal: number;
  subTotalWithVD?: number;
  overallTax: number;
  overallShipping: number;
  taxableAmount: number;
  calculatedTotal: number;
  grandTotal: number;
  roundingAdjustment?: number;
  totalPfValue?: number;

  // Volume Discount
  VDapplied?: boolean;
  VDDetails?: Record<string, unknown>;
  versionLevelVolumeDisscount?: boolean;

  // Terms & Preferences
  quoteTerms?: Record<string, unknown>;

  // Users & Tags
  quoteUsers: number[];
  deletableQuoteUsers?: number[];
  tagsList?: number[];
  deletableTagsList?: number[];

  // Division & Type
  quoteDivisionId?: number | null;
  orderTypeId?: number | null;

  // Business Unit
  branchBusinessUnitId?: string | number;
  branchBusinessUnit?: string | number;

  // Currency
  buyerCurrency?: Record<string, unknown>;
  buyerCurrencyId?: number;

  // Metadata
  domainURL: string;
  modifiedByUsername: string;
  uploadedDocumentDetails?: Array<Record<string, unknown>>;

  // Other fields
  sellerBranchId?: number;
  sellerCompanyId?: number;
  buyerCompanyId?: number;
  isInter?: boolean;
  subtotal_bc?: string | null;
  payerCode?: string;
  payerBranchName?: string;
}

export interface QuoteSubmissionRequest {
  body: QuoteSubmissionPayload;
  quoteId: string;
  userId: number | string;
  companyId: number | string;
}

export interface QuoteSubmissionResponse {
  success: boolean;
  data: unknown;
}

export class QuoteSubmissionService extends BaseService<QuoteSubmissionService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Submit a quote as a new version
   * @param request - The quote submission request containing body, quoteId, userId, and companyId
   * @returns Promise with submission response
   */
  async submitQuoteAsNewVersion(
    request: QuoteSubmissionRequest
  ): Promise<QuoteSubmissionResponse> {
    const { body, quoteId, userId, companyId } = request;

    const url = `/quotes/submitAsNewVersion?userId=${userId}&quotationIdentifier=${encodeURIComponent(quoteId)}&companyId=${companyId}`;

    return this.call(url, body, "POST") as Promise<QuoteSubmissionResponse>;
  }

  /**
   * Server-side safe version of submitQuoteAsNewVersion
   * Returns null on error instead of throwing
   */
  async submitQuoteAsNewVersionServerSide(
    request: QuoteSubmissionRequest
  ): Promise<QuoteSubmissionResponse | null> {
    const { body, quoteId, userId, companyId } = request;

    const url = `/quotes/submitAsNewVersion?userId=${userId}&quotationIdentifier=${encodeURIComponent(quoteId)}&companyId=${companyId}`;

    return this.callSafe(
      url,
      body,
      "POST"
    ) as Promise<QuoteSubmissionResponse | null>;
  }

  /**
   * Create quote from summary page (new quote creation)
   * Endpoint: POST quotes/submitRFQToSingleDealer?userId={userId}&companyId={companyId}
   * Used by: useSummarySubmission hook
   * 
   * @param params - Parameters for quote creation
   * @param quoteData - Transformed quote data from summary (using summaryReqDTO)
   * @returns Quote creation response with quotationIdentifier
   */
  async createQuoteFromSummary(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    quoteData: any
  ): Promise<{ quotationIdentifier: string }> {
    const queryString = `userId=${params.userId}&companyId=${params.companyId}`;
    const response = await this.call(
      `quotes/submitRFQToSingleDealer?${queryString}`,
      quoteData,
      "POST"
    );
    
    // Normalize response format
    // Backend returns: { success: "success", data: { quotationIdentifier: "..." } }
    if (response && typeof response === "object") {
      if ("data" in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === "object" && "quotationIdentifier" in data) {
          return data as { quotationIdentifier: string };
        }
        // If data is directly the identifier string
        if (typeof data === "string") {
          return { quotationIdentifier: data };
        }
      }
      // If response itself has quotationIdentifier
      if ("quotationIdentifier" in response) {
        return response as { quotationIdentifier: string };
      }
    }

    throw new Error("Invalid response format from quote creation");
  }

  /**
   * Server-safe version of create quote from summary
   * @param params - Parameters for quote creation
   * @param quoteData - Transformed quote data from summary
   * @returns Quote creation response or null if error
   */
  async createQuoteFromSummaryServerSide(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    quoteData: any
  ): Promise<{ quotationIdentifier: string } | null> {
    try {
      return await this.createQuoteFromSummary(params, quoteData);
    } catch {
      return null;
    }
  }

  /**
   * Create quote from summary with custom context
   * @param params - Parameters for quote creation
   * @param quoteData - Transformed quote data from summary
   * @param context - Request context
   * @returns Quote creation response with quotationIdentifier
   */
  async createQuoteFromSummaryWithContext(
    params: {
      userId: string | number;
      companyId: string | number;
    },
    quoteData: any,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<{ quotationIdentifier: string }> {
    const queryString = `userId=${params.userId}&companyId=${params.companyId}`;
    const response = await this.callWith(
      `quotes/submitRFQToSingleDealer?${queryString}`,
      quoteData,
      {
        context,
        method: "POST",
      }
    );
    
    // Normalize response format (same as createQuoteFromSummary)
    if (response && typeof response === "object") {
      if ("data" in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === "object" && "quotationIdentifier" in data) {
          return data as { quotationIdentifier: string };
        }
        if (typeof data === "string") {
          return { quotationIdentifier: data };
        }
      }
      if ("quotationIdentifier" in response) {
        return response as { quotationIdentifier: string };
      }
    }

    throw new Error("Invalid response format from quote creation");
  }
}

export default QuoteSubmissionService.getInstance();
