import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Define the competitor data types
export interface CompetitorDetail {
  id?: number;
  name?: string;
  competitorName?: string;
  manufacturerCompanyId?: number;
  createdDate?: string;
  lastUpdatedDate?: string;
  [key: string]: unknown;
}

export interface FetchCompetitorsRequest {
  companyId: number | string;
}

export interface FetchCompetitorsResponse {
  success: boolean;
  data: {
    competitorDetails: CompetitorDetail[];
  };
}

export class ManufacturerCompetitorService extends BaseService<ManufacturerCompetitorService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Fetch all competitors for a manufacturer company
   * @param companyId - The manufacturer company ID
   * @returns Promise with competitor details
   */
  async fetchCompetitors(
    companyId: number | string
  ): Promise<FetchCompetitorsResponse> {
    const endpoint = `manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId=${companyId}`;
    return this.call(endpoint, {}, "GET") as Promise<FetchCompetitorsResponse>;
  }

  /**
   * Server-safe version - Returns null on error instead of throwing
   * @param companyId - The manufacturer company ID
   * @returns Promise with competitor details or null
   */
  async fetchCompetitorsServerSide(
    companyId: number | string
  ): Promise<FetchCompetitorsResponse | null> {
    const endpoint = `manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId=${companyId}`;
    return this.callSafe(
      endpoint,
      {},
      "GET"
    ) as Promise<FetchCompetitorsResponse | null>;
  }

  /**
   * Get just the competitor details array
   * @param companyId - The manufacturer company ID
   * @returns Promise with array of competitors
   */
  async getCompetitorsList(
    companyId: number | string
  ): Promise<CompetitorDetail[]> {
    const response = await this.fetchCompetitors(companyId);
    return response?.data?.competitorDetails || [];
  }

  /**
   * Server-safe version - Get just the competitor details array
   * @param companyId - The manufacturer company ID
   * @returns Promise with array of competitors or empty array
   */
  async getCompetitorsListServerSide(
    companyId: number | string
  ): Promise<CompetitorDetail[]> {
    const response = await this.fetchCompetitorsServerSide(companyId);
    return response?.data?.competitorDetails || [];
  }
}

export default ManufacturerCompetitorService.getInstance();
