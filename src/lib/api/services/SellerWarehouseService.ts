import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

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

  // Find seller branch based on buyer details and products
  async findSellerBranch(
    userId: string,
    companyId: string,
    request: FindSellerBranchRequest
  ): Promise<SellerBranch[]> {
    const url = `/branches/findsellerBranch/${userId}?companyId=${companyId}`;

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

  // Find warehouse by branch ID
  async findWarehouseByBranchId(
    branchId: number,
    request: FindWarehouseRequest
  ): Promise<Warehouse | null> {
    const url = `/branches/findWareHouseByBranchId/2?branchId=${branchId}`;

    const response = await this.call(url, request, "POST");

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
    try {
      // First, find seller branch
      const sellerBranches = await this.findSellerBranch(
        userId,
        companyId,
        request
      );
      const sellerBranch = sellerBranches.length > 0 ? sellerBranches[0] : null;

      if (!sellerBranch) {
        return { sellerBranch: null, warehouse: null };
      }

      // Then, find warehouse by seller branch ID
      const warehouse = await this.findWarehouseByBranchId(
        sellerBranch.branchId,
        { sellerBranchId: sellerBranch.branchId }
      );

      return { sellerBranch, warehouse };
    } catch {
      return { sellerBranch: null, warehouse: null };
    }
  }
}

export default SellerWarehouseService.getInstance();
