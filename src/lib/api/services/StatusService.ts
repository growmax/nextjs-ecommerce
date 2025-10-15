import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Quote Status API Response Interface (Raw API Response)
export interface QuoteStatusApiResponse {
  data: string[]; // Array of status strings, may include null values
  message: string | null;
  status: string;
}

// Processed Quote Status Response Interface (For UI Components)
export interface QuoteStatusResponse {
  data: Array<{ value: string; label: string }>;
  message: string | null;
  status: string;
}

// Quote Status Query Parameters
export interface QuoteStatusParams {
  userId?: number;
  companyId?: number;
  module?: "quotes" | "orders";
}

export class QuoteStatusService extends BaseService<QuoteStatusService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Transform raw status array to UI-friendly format
   * Filters out null values and converts to value/label objects
   * Creates API-safe values for different modules
   */
  private transformStatusData(
    statusArray: string[],
    module: string = "quotes"
  ): Array<{ value: string; label: string }> {
    return statusArray
      .filter(
        (status): status is string => status !== null && status !== undefined
      )
      .map(status => ({
        value: this.createApiSafeValue(status, module),
        label: status, // Keep original format for display
      }));
  }

  /**
   * Create API-safe value based on module requirements
   */
  private createApiSafeValue(status: string, module: string): string {
    if (module === "orders") {
      // Orders API only allows: alphanumeric, spaces, and basic punctuation (.-_,@)
      // Remove any characters that aren't allowed and normalize spaces
      return status
        .replace(/[^a-zA-Z0-9\s.\-_,@]/g, "") // Remove invalid characters
        .replace(/\s+/g, " ") // Normalize multiple spaces to single space
        .trim(); // Remove leading/trailing spaces
    } else {
      // Default behavior for quotes (lowercase with underscores)
      return status.toLowerCase().replace(/\s+/g, "_");
    }
  }

  /**
   * Get raw quote status options by company (returns API response as-is)
   * @param params - Optional parameters, if not provided will use current session data
   */
  async getQuoteStatusByCompanyRaw(
    params?: QuoteStatusParams
  ): Promise<QuoteStatusApiResponse> {
    if (!params?.userId || !params?.companyId) {
      throw new Error("userId and companyId are required parameters");
    }

    const { userId, companyId, module = "quotes" } = params;
    const endpoint = `/${module}/findStatusByCompany?userId=${userId}&companyId=${companyId}`;

    try {
      // Try module-specific endpoint first
      return (await this.call(endpoint, {}, "GET")) as QuoteStatusApiResponse;
    } catch (error: unknown) {
      // If quotes module fails with 500 error, fallback to orders endpoint
      const hasStatus = error && typeof error === "object" && "status" in error;
      const errorWithStatus = hasStatus ? (error as { status: unknown }) : null;
      const statusCode =
        errorWithStatus && typeof errorWithStatus.status === "number"
          ? errorWithStatus.status
          : 0;

      if (module === "quotes" && statusCode >= 500) {
        const fallbackEndpoint = `/orders/findStatusByCompany?userId=${userId}&companyId=${companyId}`;
        return (await this.call(
          fallbackEndpoint,
          {},
          "GET"
        )) as QuoteStatusApiResponse;
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get quote status options by company (transformed for UI use)
   * @param params - Optional parameters, if not provided will use current session data
   */
  async getQuoteStatusByCompany(
    params?: QuoteStatusParams
  ): Promise<QuoteStatusResponse> {
    const rawResponse = await this.getQuoteStatusByCompanyRaw(params);
    const { module = "quotes" } = params || {};

    return {
      data: this.transformStatusData(rawResponse.data, module),
      message: rawResponse.message,
      status: rawResponse.status,
    };
  }

  /**
   * Server-side safe version for quote status (raw response)
   */
  async getQuoteStatusByCompanyRawServerSide(
    params?: QuoteStatusParams
  ): Promise<QuoteStatusApiResponse | null> {
    if (!params?.userId || !params?.companyId) {
      return null;
    }

    const { userId, companyId, module = "quotes" } = params;
    const endpoint = `/${module}/findStatusByCompany?userId=${userId}&companyId=${companyId}`;

    // Try module-specific endpoint first
    const result = (await this.callSafe(
      endpoint,
      {},
      "GET"
    )) as QuoteStatusApiResponse | null;

    // If quotes module failed, fallback to orders endpoint
    if (!result && module === "quotes") {
      const fallbackEndpoint = `/orders/findStatusByCompany?userId=${userId}&companyId=${companyId}`;
      return (await this.callSafe(
        fallbackEndpoint,
        {},
        "GET"
      )) as QuoteStatusApiResponse | null;
    }

    return result;
  }

  /**
   * Server-side safe version for quote status (transformed for UI)
   */
  async getQuoteStatusByCompanyServerSide(
    params?: QuoteStatusParams
  ): Promise<QuoteStatusResponse | null> {
    const rawResponse = await this.getQuoteStatusByCompanyRawServerSide(params);

    if (!rawResponse) {
      return null;
    }

    const { module = "quotes" } = params || {};

    return {
      data: this.transformStatusData(rawResponse.data, module),
      message: rawResponse.message,
      status: rawResponse.status,
    };
  }
}

export default QuoteStatusService.getInstance();
