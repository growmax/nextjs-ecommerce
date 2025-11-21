import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

// Account Owner Interface
export interface AccountOwner {
  id: number;
  userId?: number;
  displayName?: string;
  email?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

// Account Owner Response Interface
export interface AccountOwnerResponse {
  accountOwner: AccountOwner[];
  supportOwner?: AccountOwner[];
  company?: {
    id: number;
    name: string;
    [key: string]: unknown;
  };
}

// API Response wrapper
export interface AccountOwnerApiResponse {
  success?: boolean;
  data: AccountOwnerResponse;
  message?: string;
  status?: string;
}

export class AccountOwnerService extends BaseService<AccountOwnerService> {
  protected defaultClient = coreCommerceClient;

  /**
   * Get account and support owners for a company
   * Endpoint: GET /accountses/getAccountAndSupportOwner?companyId={companyId}
   *
   * @param companyId - The company ID
   * @returns Account owner response with accountOwner and supportOwner arrays
   */
  async getAccountOwners(
    companyId: number | string
  ): Promise<AccountOwnerResponse> {
    const endpoint = `/accountses/getAccountAndSupportOwner?companyId=${companyId}`;

    const response = (await this.call(
      endpoint,
      {},
      "GET"
    )) as AccountOwnerApiResponse;

    // Normalize response format
    if (response && typeof response === "object" && "data" in response) {
      return response.data as AccountOwnerResponse;
    }

    // If response is already in the correct format
    if (response && "accountOwner" in response) {
      return response as AccountOwnerResponse;
    }

    // Return empty structure if response format is unexpected
    return {
      accountOwner: [],
      supportOwner: [],
    };
  }
}

export default AccountOwnerService.getInstance();
