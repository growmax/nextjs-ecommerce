import { render, waitFor } from "@testing-library/react";
import React from "react";

// Mocks
jest.mock("@/lib/api", () => ({
  SellerWarehouseService: {
    getSellerBranchAndWarehouse: jest.fn(),
  },
}));

jest.mock("./useCurrentUser", () => ({
  useCurrentUser: () => ({ user: { userId: "123", companyId: "456" } }),
}));

import { SellerWarehouseService } from "@/lib/api";
import { useUpdateSellerAndWarehouse } from "./useUpdateSellerAndWarehouse";

describe("useUpdateSellerAndWarehouse", () => {
  type HookParams = Parameters<typeof useUpdateSellerAndWarehouse>;
  type SetValueFn = HookParams[0];
  type WatchFn = HookParams[1];
  type ApiType = ReturnType<typeof useUpdateSellerAndWarehouse>;

  // setValue/watch mocks typed to match react-hook-form generics
  const rawSetValueMock = jest.fn();
  const setValueMock = rawSetValueMock as unknown as SetValueFn;
  const rawWatchMock = jest.fn((path: string) => {
    if (path === "orderDetails.0.dbProductDetails") {
      return [
        {
          // minimal product entry
          wareHouse: null,
        },
      ];
    }
    return undefined;
  });
  const watchMock = rawWatchMock as unknown as WatchFn;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function TestHarness({ onReady }: { onReady: (api: ApiType) => void }) {
    const api = useUpdateSellerAndWarehouse(setValueMock, watchMock);
    React.useEffect(() => {
      // Call onReady but ensure we don't return its value (hooks expect a cleanup function or nothing)
      void onReady(api);
    }, [api, onReady]);
    return null;
  }

  it("handleBillingAddressChange updates form values and calls service", async () => {
    // Arrange: mock service response
    const mockedService = SellerWarehouseService as unknown as {
      getSellerBranchAndWarehouse: jest.Mock;
    };
    mockedService.getSellerBranchAndWarehouse.mockResolvedValue({
      sellerBranch: { id: 10, name: "Seller-1", companyId: 20 },
      warehouse: { id: 30, city: "TestCity" },
    });

    let api: ApiType | undefined;
    render(
      React.createElement(TestHarness, { onReady: (a: ApiType) => (api = a) })
    );

    await waitFor(() => expect(api).toBeDefined());
    const hookApi = api as ApiType;

    // Act
    await hookApi.handleBillingAddressChange({
      id: 5,
      branchName: "Branch-5",
      vendorID: 99,
    });

    // Assert: setValue called to update billing address and buyer branch
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.billingAddressDetails",
      { id: 5, branchName: "Branch-5", vendorID: 99 }
    );
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.buyerBranchId",
      5
    );
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.buyerBranchName",
      "Branch-5"
    );
    expect(setValueMock).toHaveBeenCalledWith("orderDetails.0.vendorID", 99);

    // Assert: seller/warehouse updates
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.sellerBranchId",
      10
    );
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.sellerBranchName",
      "Seller-1"
    );
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.sellerCompanyId",
      20
    );

    // dbProductDetails should be updated with warehouse
    expect(setValueMock).toHaveBeenCalledWith(
      "orderDetails.0.dbProductDetails",
      expect.any(Array)
    );

    // Service invoked with correct args
    expect(mockedService.getSellerBranchAndWarehouse).toHaveBeenCalledWith(
      "123",
      "456",
      expect.objectContaining({ buyerBranchId: 5 })
    );
  });

  it("updateSellerAndWarehouse returns values when service responds", async () => {
    const mockedService = SellerWarehouseService as unknown as {
      getSellerBranchAndWarehouse: jest.Mock;
    };
    mockedService.getSellerBranchAndWarehouse.mockResolvedValue({
      sellerBranch: { id: 99, name: "S-99", companyId: 100 },
      warehouse: null,
    });

    let api: ApiType | undefined;
    render(
      React.createElement(TestHarness, { onReady: (a: ApiType) => (api = a) })
    );
    await waitFor(() => expect(api).toBeDefined());
    const hookApi = api as ApiType;

    const result = await hookApi.updateSellerAndWarehouse({
      id: 11,
      branchName: "B11",
    });

    expect(result).toEqual({
      sellerBranch: { id: 99, name: "S-99", companyId: 100 },
      warehouse: null,
    });
    expect(mockedService.getSellerBranchAndWarehouse).toHaveBeenCalled();
  });
});
