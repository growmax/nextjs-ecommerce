import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Division Interface
export interface Division {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  [key: string]: unknown;
}

// Channel Interface
export interface Channel {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  [key: string]: unknown;
}

// Manufacturer Competitor Interface
export interface ManufacturerCompetitor {
  id: number;
  name?: string;
  companyId?: number;
  [key: string]: unknown;
}

// Division Response
export interface DivisionResponse {
  success?: boolean;
  data: Division[];
  message?: string;
}

// Channel Response
export interface ChannelResponse {
  success?: boolean;
  data: Channel[];
  message?: string;
}

// Manufacturer Competitor Response
export interface ManufacturerCompetitorResponse {
  success?: boolean;
  data: ManufacturerCompetitor[];
  message?: string;
}

export class SalesService extends BaseService<SalesService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Get all divisions
   * Endpoint: GET /division
   *
   * @returns Division list
   */
  async getDivision(): Promise<Division[]> {
    const endpoint = `/division`;

    const response = (await this.call(endpoint, {}, "GET")) as
      | DivisionResponse
      | Division[];

    // Normalize response format
    if (Array.isArray(response)) {
      return response as Division[];
    }

    if (response && typeof response === "object" && "data" in response) {
      const data = (response as DivisionResponse).data;
      if (Array.isArray(data)) {
        return data;
      }
    }

    return [];
  }

  /**
   * Server-side version that returns null on error
   * @returns Division list or null if error
   */
  async getDivisionServerSide(): Promise<Division[] | null> {
    try {
      const result = await this.getDivision();
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Get all channels
   * Endpoint: GET /channel
   *
   * @returns Channel list
   */
  async getChannel(): Promise<Channel[]> {
    const endpoint = `/channel`;

    const response = (await this.call(endpoint, {}, "GET")) as
      | ChannelResponse
      | Channel[];

    // Normalize response format
    if (Array.isArray(response)) {
      return response as Channel[];
    }

    if (response && typeof response === "object" && "data" in response) {
      const data = (response as ChannelResponse).data;
      if (Array.isArray(data)) {
        return data;
      }
    }

    return [];
  }

  /**
   * Server-side version that returns null on error
   * @returns Channel list or null if error
   */
  async getChannelServerSide(): Promise<Channel[] | null> {
    try {
      const result = await this.getChannel();
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Get manufacturer competitors (for SPR - Special Price Request)
   * Endpoint: POST /api/sales/getManufacturerCompetitor
   *
   * @param params - Request parameters
   * @returns Manufacturer competitor list
   */
  async getManufacturerCompetitor(
    params?: Record<string, unknown>
  ): Promise<ManufacturerCompetitor[]> {
    // Note: Need to find the actual backend endpoint for this
    // For now, using a placeholder endpoint
    const endpoint = `/sales/getManufacturerCompetitor`;

    const response = (await this.call(endpoint, params || {}, "POST")) as
      | ManufacturerCompetitorResponse
      | ManufacturerCompetitor[];

    // Normalize response format
    if (Array.isArray(response)) {
      return response as ManufacturerCompetitor[];
    }

    if (response && typeof response === "object" && "data" in response) {
      const data = (response as ManufacturerCompetitorResponse).data;
      if (Array.isArray(data)) {
        return data;
      }
    }

    return [];
  }

  /**
   * Server-side version that returns null on error
   * @param params - Request parameters
   * @returns Manufacturer competitor list or null if error
   */
  async getManufacturerCompetitorServerSide(
    params?: Record<string, unknown>
  ): Promise<ManufacturerCompetitor[] | null> {
    try {
      const result = await this.getManufacturerCompetitor(params);
      return result;
    } catch {
      return null;
    }
  }
}

export default SalesService.getInstance();
