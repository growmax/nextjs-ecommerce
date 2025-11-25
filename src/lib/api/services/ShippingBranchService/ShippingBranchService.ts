import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Define shipping address data types (same shape as billing)
export interface ShippingAddress {
  id: string;
  name: string;
  addressId: {
    addressLine: string;
    shipToCode?: string | null;
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
    billToCode?: string | null;
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
  };
}

export interface ShippingBranchResponse {
  success?: boolean;
  data: ShippingAddress[];
  message?: string;
}

export class ShippingBranchService extends BaseService<ShippingBranchService> {
  protected defaultClient = coreCommerceClient;

  // Get shipping addresses for a company
  async getShippingAddresses(
    userId: string,
    companyId: string
  ): Promise<ShippingAddress[]> {
    const url = `/branches/readShippingBranch/${userId}?companyId=${companyId}`;

    const response = await this.call(url, {}, "GET");

    // Normalize possible API responses
    if (Array.isArray(response)) {
      return response as ShippingAddress[];
    }
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as Record<string, unknown>).data;
      if (Array.isArray(data)) {
        return data as ShippingAddress[];
      }
    }
    if (response && typeof response === "object" && "success" in response) {
      const data = (response as Record<string, unknown>).data;
      if (Array.isArray(data)) {
        return data as ShippingAddress[];
      }
    }

    return [];
  }
}

export default ShippingBranchService.getInstance();
