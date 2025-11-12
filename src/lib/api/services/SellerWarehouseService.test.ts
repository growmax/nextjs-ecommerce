import { BaseService } from "./BaseService";
import { SellerWarehouseService } from "./SellerWarehouseService";

describe("SellerWarehouseService", () => {
  let service: SellerWarehouseService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new SellerWarehouseService();
     
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("should return seller branches from findSellerBranch", async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          branchId: {
            id: 1,
            name: "Branch 1",
            companyId: { id: 10 },
          },
        },
      ],
    };

    callApiSpy.mockResolvedValueOnce(mockResponse);

    const result = await service.findSellerBranch("1", "10", {
      userId: 1,
      buyerBranchId: 2,
      buyerCompanyId: 10,
      productIds: [100],
      sellerCompanyId: 20,
    });

    expect(result).toEqual([
      { id: 1, name: "Branch 1", branchId: 1, companyId: 10 },
    ]);
  });

  it("should return warehouse from findWarehouseByBranchId", async () => {
    const mockResponse = {
      success: true,
      data: {
        wareHouseName: "Warehouse 1",
        id: 5,
        wareHousecode: "WH1",
      },
    };

    callApiSpy.mockResolvedValueOnce(mockResponse);

    const result = await service.findWarehouseByBranchId(5);

    expect(result).toEqual({
      id: 5,
      name: "Warehouse 1",
      wareHouseName: "Warehouse 1",
      wareHousecode: "WH1",
    });
  });

  it("should return null if warehouse not found", async () => {
    const mockResponse = { success: true, data: null };
    callApiSpy.mockResolvedValueOnce(mockResponse);
    const result = await service.findWarehouseByBranchId(99);
    expect(result).toBeNull();
  });

  it("should return both sellerBranch and warehouse from getSellerBranchAndWarehouse", async () => {
    const sellerBranchMock = [
      { id: 1, name: "Branch 1", branchId: 1, companyId: 10 },
    ];
    const warehouseMock = {
      id: 5,
      name: "Warehouse 1",
      wareHouseName: "Warehouse 1",
      wareHousecode: "WH1",
    };

    // Mock internal methods to control behavior
    service.findSellerBranch = jest
      .fn()
      .mockResolvedValueOnce(sellerBranchMock);
    service.findWarehouseByBranchId = jest
      .fn()
      .mockResolvedValueOnce(warehouseMock);

    const result = await service.getSellerBranchAndWarehouse("1", "10", {
      userId: 1,
      buyerBranchId: 2,
      buyerCompanyId: 10,
      productIds: [100],
      sellerCompanyId: 20,
    });

    expect(result).toEqual({
      sellerBranch: sellerBranchMock[0],
      warehouse: warehouseMock,
    });
  });
});
