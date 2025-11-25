// Mocks for ShippingBranchService
// These mocks are for testing the service in isolation.

import type { ShippingAddress } from "@/lib/api/services/ShippingBranchService/ShippingBranchService";

export const mockShippingAddress: ShippingAddress = {
  id: "1",
  name: "Main Shipping Branch",
  addressId: {
    id: 1,
    addressLine: "456 Shipping St",
    branchName: "Main Shipping Branch",
    city: "Los Angeles",
    country: "USA",
    countryCode: "US",
    district: "Downtown",
    gst: "GST456",
    isBilling: false,
    isCustAddress: false,
    isShipping: true,
    lattitude: "34.0522",
    locality: "Central",
    longitude: "-118.2437",
    mobileNo: "9876543210",
    nationalMobileNum: "+19876543210",
    phone: "9876543210",
    pinCodeId: "90001",
    primaryContact: "Jane Smith",
    regAddress: false,
    state: "CA",
    tenantId: 1,
    wareHouse: true,
  },
  companyId: {
    id: 1,
    name: "Test Company",
  },
};

export const mockShippingAddressesArray: ShippingAddress[] = [
  mockShippingAddress,
];

export const mockShippingAddressesResponseWithData = {
  data: mockShippingAddressesArray,
};

export const mockShippingAddressesResponseWithSuccess = {
  success: true,
  data: mockShippingAddressesArray,
  message: "Success",
};

export const mockUserId = "123";
export const mockCompanyId = "456";
