import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

// Currency Factor Response Interface
export interface CurrencyFactorResponse {
  data: {
    currencyFactor: number;
  };
  success?: boolean;
  message?: string;
  status?: string;
}

// API Response wrapper
export interface CurrencyFactorApiResponse {
  success?: boolean;
  data: number | CurrencyFactorResponse;
  message?: string;
  status?: string;
}

export class CurrencyService extends BaseService<CurrencyService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Get currency factor for a company
   * Endpoint: GET /companys/currencyFactor?companyId={companyId}
   * 
   * @param companyId - The company ID
   * @returns Currency factor response
   */
  async getCurrencyFactor(
    companyId: number | string
  ): Promise<CurrencyFactorResponse> {
    const endpoint = `/companys/currencyFactor?companyId=${companyId}`;
    
    const response = await this.call(
      endpoint,
      {},
      "GET"
    ) as CurrencyFactorApiResponse;

    // Normalize response format
    // Backend returns: { success: "success", data: <number> }
    // We need to wrap it in our expected format
    if (response && typeof response === "object") {
      if ("data" in response) {
        const factor = typeof response.data === "number" 
          ? response.data 
          : (response.data as CurrencyFactorResponse)?.data?.currencyFactor || 1;
        
        return {
          data: {
            currencyFactor: factor,
          },
          success: response.success ?? true,
          ...(response.message && { message: response.message }),
          ...(response.status && { status: response.status }),
        };
      }
    }

    // Return default if response format is unexpected
    return {
      data: {
        currencyFactor: 1,
      },
    };
  }

  /**
   * Server-side version that returns null on error
   * @param companyId - The company ID
   * @returns Currency factor response or null if error
   */
  async getCurrencyFactorServerSide(
    companyId: number | string
  ): Promise<CurrencyFactorResponse | null> {
    return this.callSafe(
      `/companys/currencyFactor?companyId=${companyId}`,
      {},
      "GET"
    ) as Promise<CurrencyFactorResponse | null>;
  }

  /**
   * Server-side version with custom context (for API routes)
   * @param companyId - The company ID
   * @param context - Request context with accessToken and tenantCode
   * @returns Currency factor response or null if error
   */
  async getCurrencyFactorWithContext(
    companyId: number | string,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<CurrencyFactorResponse | null> {
    return this.callWithSafe(
      `/companys/currencyFactor?companyId=${companyId}`,
      {},
      {
        context,
        method: "GET",
      }
    ) as Promise<CurrencyFactorResponse | null>;
  }
}

export default CurrencyService.getInstance();

