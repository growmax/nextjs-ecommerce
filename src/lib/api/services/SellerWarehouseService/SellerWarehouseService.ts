import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

// Define data types for seller branch and warehouse based on actual API responses
export interface SellerBranch {
  id: number;
  name: string;
  branchId: number;
  companyId: number;
}

// Warehouse interface - matches the full structure returned by the API
// Reference: buyer-fe returns full warehouse object with addressId, companyId, etc.
export interface Warehouse {
  id: number;
  name?: string;
  wareHouseName: string;
  wareHousecode?: string;
  addressId?: {
    addressLine?: string;
    billToCode?: string | null;
    branchName?: string;
    city?: string;
    country?: string;
    countryCode?: string | null;
    district?: string;
    email?: string | null;
    gst?: string | null;
    id?: number;
    isBilling?: boolean;
    isCustAddress?: boolean;
    isShipping?: boolean;
    lattitude?: string;
    locality?: string;
    locationUrl?: string;
    longitude?: string;
    mobileNo?: string | null;
    nationalMobileNum?: string | null;
    phone?: string;
    pinCodeId?: string;
    primaryContact?: string | null;
    regAddress?: boolean;
    shipToCode?: string | null;
    soldToCode?: string | null;
    state?: string;
    tenantId?: number;
    vendorID?: number | null;
    vendorId?: number | null;
    wareHouse?: boolean;
  };
  companyId?: any; // Full company object structure
  contactNumber?: string;
  contactPerson?: string;
  isDefault?: boolean;
  nationalMobileNum?: string;
  salesOrgCode?: {
    code?: string;
    id?: number;
    name?: string;
    tenantId?: number;
  };
  tenantId?: number;
  vendorId?: number | null;
  wareHouseIdentifier?: string;
  zoneId?: number | null;
  [key: string]: any; // Allow additional properties from API
}

// API Response types
interface SellerBranchResponseItem {
  branchId: {
    id: number;
    name: string;
    companyId: {
      id: number;
    };
  };
}

// WarehouseResponse is now the full warehouse object from API
type WarehouseResponse = Warehouse;

export interface FindSellerBranchRequest {
  userId: number;
  buyerBranchId: number;
  buyerCompanyId: number;
  productIds: number[];
  sellerCompanyId: number;
}

export interface FindWarehouseRequest {
  sellerBranchId: number;
}

export class SellerWarehouseService extends BaseService<SellerWarehouseService> {
  protected defaultClient = coreCommerceClient;

  // Find seller branch based on buyer details and products (POST method)
  async findSellerBranch(
    userId: string,
    _companyId: string,
    request: FindSellerBranchRequest
  ): Promise<SellerBranch[]> {
    const url = `/branches/findsellerBranch/${userId}?companyId=${request.sellerCompanyId}`;

    const response = await this.call(url, request, "POST");

    // Normalize API response - response format: { success: true, data: [{ branchId: {...} }] }
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as { success?: boolean; data: unknown }).data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: SellerBranchResponseItem) => ({
          id: item.branchId.id,
          name: item.branchId.name,
          branchId: item.branchId.id,
          companyId: item.branchId.companyId.id,
        }));
      }
    }

    return [];
  }

  // Find warehouse by branch ID (GET method)
  // Reference: buyer-fe returns full warehouse object with addressId, companyId, etc.
  // This matches the structure returned by /api/address/warehouse.js in buyer-fe
  async findWarehouseByBranchId(branchId: number): Promise<Warehouse | null> {
    const url = `/branches/findWareHouseByBranchId/2?branchId=${branchId}`;

    try {
      const response = await this.call(url, undefined, "GET");

      // Normalize API response - response format: { success: true, data: { ...full warehouse object... } }
      // Reference: buyer-fe pages/api/address/warehouse.js returns data.data (full warehouse object)
      if (response && typeof response === "object" && "data" in response) {
        const data = (response as { success?: boolean; data: unknown }).data;
        if (data && typeof data === "object") {
          const warehouseData = data as WarehouseResponse;
          // Return the full warehouse object as-is from the API
          // This includes addressId, companyId, and all other fields
          return {
            ...warehouseData,
            // Ensure name is set for backward compatibility
            name: warehouseData.name || warehouseData.wareHouseName,
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Find warehouse (wrapper method for buyer-fe compatibility)
   * Accepts POST format: { sellerBranchId }
   * Used by: useDefaultWarehouse hook
   *
   * @param params - Parameters with sellerBranchId
   * @returns Warehouse or null
   */
  async findWarehouse(params: {
    sellerBranchId: number;
  }): Promise<Warehouse | null> {
    return this.findWarehouseByBranchId(params.sellerBranchId);
  }

  /**
   * Server-side version
   * @param params - Parameters with sellerBranchId
   * @returns Warehouse or null
   */
  async findWarehouseServerSide(params: {
    sellerBranchId: number;
  }): Promise<Warehouse | null> {
    try {
      return await this.findWarehouse(params);
    } catch {
      return null;
    }
  }

  // Combined method to get seller branch and warehouse
  async getSellerBranchAndWarehouse(
    userId: string,
    companyId: string,
    request: FindSellerBranchRequest
  ): Promise<{
    sellerBranch: SellerBranch | null;
    warehouse: Warehouse | null;
  }> {
    let sellerBranch: SellerBranch | null = null;
    let warehouse: Warehouse | null = null;

    // Step 1: Call seller branch API
    try {
      const sellerBranches = await this.findSellerBranch(
        userId,
        companyId,
        request
      );
      sellerBranch =
        sellerBranches.length > 0 ? (sellerBranches[0] ?? null) : null;
    } catch {
      // Seller branch API failed, but continue to try warehouse API
      sellerBranch = null;
    }

    // Step 2: Call warehouse API using seller branch ID or buyer branch ID
    // The warehouse API should be called with the sellerBranchId from the seller branch response
    const sellerBranchId = sellerBranch?.branchId || request.buyerBranchId;

    // Only call warehouse API if we have a valid branch ID
    if (sellerBranchId) {
      try {
        // Explicitly call warehouse API
        warehouse = await this.findWarehouseByBranchId(sellerBranchId);
      } catch {
        // Warehouse API failed, but still return seller branch if available
        warehouse = null;
      }
    }

    return { sellerBranch, warehouse };
  }
}

export default SellerWarehouseService.getInstance();
