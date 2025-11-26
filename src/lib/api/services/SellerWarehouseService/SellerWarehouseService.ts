import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

// Define data types for seller branch and warehouse based on actual API responses
export interface SellerBranch {
  id: number;
  name: string;
  branchId: number;
  companyId: number;
}

export interface Warehouse {
  id: number;
  name: string;
  wareHouseName: string;
  wareHousecode?: string;
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

interface WarehouseResponse {
  wareHouseName: string;
  id: number;
  wareHousecode?: string;
}

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
    companyId: string,
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
  async findWarehouseByBranchId(branchId: number): Promise<Warehouse | null> {
    const url = `/branches/findWareHouseByBranchId/2?branchId=${branchId}`;

    try {
      const response = await this.call(url, undefined, "GET");

      // Normalize API response - response format: { success: true, data: { wareHouseName: "...", id: ... } }
      if (response && typeof response === "object" && "data" in response) {
        const data = (response as { success?: boolean; data: unknown }).data;
        if (data && typeof data === "object" && "wareHouseName" in data) {
          const warehouseData = data as WarehouseResponse;
          return {
            id: warehouseData.id,
            name: warehouseData.wareHouseName,
            wareHouseName: warehouseData.wareHouseName,
            ...(warehouseData.wareHousecode && {
              wareHousecode: warehouseData.wareHousecode,
            }),
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
