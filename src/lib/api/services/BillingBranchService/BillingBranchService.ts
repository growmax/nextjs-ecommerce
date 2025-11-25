import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Define billing address data types
export interface BillingAddress {
  id: string;
  name: string; // This is the branch name from the API response
  addressId: {
    addressLine: string;
    billToCode?: string | null;
    branchName: string;
    city: string;
    country: string;
    countryCode: string;
    district: string;
    email?: string | null;
    gst: string;
    id: number;
    isBilling: boolean;
    isCustAddress: boolean;
    isShipping: boolean;
    lattitude: string;
    locality: string;
    locationUrl?: string | null;
    longitude: string;
    mobileNo: string;
    nationalMobileNum: string;
    phone: string;
    pinCodeId: string;
    primaryContact: string;
    regAddress: boolean;
    shipToCode?: string | null;
    soldToCode?: string | null;
    state: string;
    tenantId: number;
    vendorID?: number | null;
    vendorId?: number | null;
    wareHouse: boolean;
  };
  companyId: {
    id: number;
    name: string;
    // ... other company fields (not needed for display)
  };
}

export interface BillingBranchResponse {
  success: boolean;
  data: BillingAddress[];
  message?: string;
}

export class BillingBranchService extends BaseService<BillingBranchService> {
  protected defaultClient = coreCommerceClient;

  // Get billing addresses for a company
  async getBillingAddresses(
    userId: string,
    companyId: string
  ): Promise<BillingAddress[]> {
    const url = `/branches/readBillingBranch/${userId}?companyId=${companyId}`;

    const response = await this.call(url, {}, "GET");

    // Handle different response structures
    if (Array.isArray(response)) {
      return response as BillingAddress[];
    }
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as Record<string, unknown>).data;
      if (Array.isArray(data)) {
        return data as BillingAddress[];
      }
    }
    if (response && typeof response === "object" && "success" in response) {
      const data = (response as Record<string, unknown>).data;
      if (Array.isArray(data)) {
        return data as BillingAddress[];
      }
    }

    return [];
  }

  // Server-safe version for server-side usage
  async getBillingAddressesServerSide(
    userId: string,
    companyId: string
  ): Promise<BillingAddress[] | null> {
    const response = await this.callSafe(
      `/branches/readBillingBranch/${userId}?companyId=${companyId}`,
      {},
      "GET"
    );

    if (Array.isArray(response)) {
      return response as BillingAddress[];
    }
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as Record<string, unknown>).data;
      if (Array.isArray(data)) {
        return data as BillingAddress[];
      }
    }

    return null;
  }

  // Update billing address selection (if needed)
  async updateBillingAddress(
    companyId: string,
    addressId: string
  ): Promise<BillingAddress> {
    return this.call(
      `/branches/updateBillingAddress/${companyId}`,
      { addressId },
      "PUT"
    ) as Promise<BillingAddress>;
  }
}

export default BillingBranchService.getInstance();
