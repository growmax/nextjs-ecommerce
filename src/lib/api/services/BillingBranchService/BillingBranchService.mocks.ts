// Mocks for BillingBranchService
// These mocks are for testing the service in isolation.

import type { BillingAddress } from "@/lib/api/services/BillingBranchService/BillingBranchService";

export const mockBillingAddress: BillingAddress = {
  id: "1",
  name: "Main Branch",
  addressId: {
    id: 1,
    addressLine: "123 Main St",
    branchName: "Main Branch",
    city: "New York",
    country: "USA",
    countryCode: "US",
    district: "Manhattan",
    gst: "GST123",
    isBilling: true,
    isCustAddress: false,
    isShipping: false,
    lattitude: "40.7128",
    locality: "Downtown",
    longitude: "-74.0060",
    mobileNo: "1234567890",
    nationalMobileNum: "+11234567890",
    phone: "1234567890",
    pinCodeId: "10001",
    primaryContact: "John Doe",
    regAddress: true,
    state: "NY",
    tenantId: 1,
    wareHouse: false,
  },
  companyId: {
    id: 1,
    name: "Test Company",
  },
};

export const mockBillingAddressesArray: BillingAddress[] = [mockBillingAddress];

export const mockBillingAddressesResponseWithData = {
  data: mockBillingAddressesArray,
};

export const mockBillingAddressesResponseWithSuccess = {
  success: true,
  data: mockBillingAddressesArray,
  message: "Success",
};

export const mockUserId = "123";
export const mockCompanyId = "456";
