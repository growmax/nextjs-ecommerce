import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Define the request parameters for updating quotation name
export interface UpdateQuotationNameRequest {
  userId: number;
  companyId: number;
  quotationIdentifier: string;
  quotationName: string;
}

// Define the response type
export interface UpdateQuotationNameResponse {
  success: boolean;
  message: string;
  quotationName?: string;
}

export class QuotationNameService extends BaseService<QuotationNameService> {
  // Use coreCommerceClient for quotation-related operations
  protected defaultClient = coreCommerceClient;

  /**
   * Update the quotation name
   * @param params - The parameters for updating quotation name
   * @returns Promise<UpdateQuotationNameResponse>
   */
  async updateQuotationName(
    params: UpdateQuotationNameRequest
  ): Promise<UpdateQuotationNameResponse> {
    const { userId, companyId, quotationIdentifier, quotationName } = params;

    // Backend expects the payload as { newName: "..." }
    const query = `userId=${encodeURIComponent(String(userId))}&companyId=${encodeURIComponent(String(companyId))}&quotationIdentifier=${encodeURIComponent(quotationIdentifier)}`;

    return this.call(
      `/quotes/changeQuotationName?${query}`,
      { newName: quotationName },
      "PUT"
    ) as Promise<UpdateQuotationNameResponse>;
  }

  /**
   * Server-side version that returns null on error
   * @param params - The parameters for updating quotation name
   * @returns Promise<UpdateQuotationNameResponse | null>
   */
  async updateQuotationNameServerSide(
    params: UpdateQuotationNameRequest
  ): Promise<UpdateQuotationNameResponse | null> {
    try {
      return await this.updateQuotationName(params);
    } catch {
      return null;
    }
  }
}

const quotationNameService = new QuotationNameService();
export default quotationNameService;
