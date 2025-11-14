// Mocks for SellerWarehouseService
// These mocks are for testing the service in isolation.

import type {
  FindSellerBranchRequest,
  SellerBranch,
  Warehouse,
} from "./SellerWarehouseService";

export const mockUserId = "123";
export const mockCompanyId = "456";

export const mockFindSellerBranchRequest: FindSellerBranchRequest = {
  userId: 123,
  buyerBranchId: 1,
  buyerCompanyId: 456,
  productIds: [1, 2, 3],
  sellerCompanyId: 789,
};

export const mockSellerBranchResponse = {
  success: true,
  data: [
    {
      branchId: {
        id: 1,
        name: "Seller Branch 1",
        companyId: {
          id: 789,
        },
      },
    },
  ],
};

export const mockSellerBranches: SellerBranch[] = [
  {
    id: 1,
    name: "Seller Branch 1",
    branchId: 1,
    companyId: 789,
  },
];

export const mockWarehouseResponse = {
  success: true,
  data: {
    id: 1,
    wareHouseName: "Warehouse 1",
    wareHousecode: "WH-001",
  },
};

export const mockWarehouse: Warehouse = {
  id: 1,
  name: "Warehouse 1",
  wareHouseName: "Warehouse 1",
  wareHousecode: "WH-001",
};
