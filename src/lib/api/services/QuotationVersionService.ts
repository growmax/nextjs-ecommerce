import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Request interface for creating a new quotation version
export interface CreateQuotationVersionRequest {
  quotationIdentifier: string;
  userId: number | string;
  companyId: number | string;
  versionData: unknown; // The quotation body data
}

// Response interface
export interface CreateQuotationVersionResponse {
  success?: boolean;
  result?: unknown;
  isLoggedIn?: boolean;
  data?: unknown;
  message?: string;
}

export class QuotationVersionService extends BaseService<QuotationVersionService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Create a new version of a quotation
   * Usage: QuotationVersionService.createNewVersion({ quotationIdentifier, userId, companyId, versionData })
   * @param request - Request object with quotationIdentifier, userId, companyId, and versionData
   * @returns Promise<CreateQuotationVersionResponse>
   */
  async createNewVersion(
    request: CreateQuotationVersionRequest
  ): Promise<CreateQuotationVersionResponse> {
    const { quotationIdentifier, userId, companyId, versionData } = request;
    const url = `quotes/createNewVersion?quotationIdentifier=${encodeURIComponent(quotationIdentifier)}&userId=${userId}&companyId=${companyId}`;

    return this.call(
      url,
      versionData,
      "POST"
    ) as Promise<CreateQuotationVersionResponse>;
  }

  /**
   * Server-side version that returns null on error
   * Usage: QuotationVersionService.createNewVersionServerSide(request)
   * @param request - Request object with quotationIdentifier, userId, companyId, and versionData
   * @returns Promise<CreateQuotationVersionResponse | null>
   */
  async createNewVersionServerSide(
    request: CreateQuotationVersionRequest
  ): Promise<CreateQuotationVersionResponse | null> {
    const { quotationIdentifier, userId, companyId, versionData } = request;
    const url = `quotes/createNewVersion?quotationIdentifier=${encodeURIComponent(quotationIdentifier)}&userId=${userId}&companyId=${companyId}`;

    return this.callSafe(
      url,
      versionData,
      "POST"
    ) as Promise<CreateQuotationVersionResponse | null>;
  }
}

export default QuotationVersionService.getInstance();
