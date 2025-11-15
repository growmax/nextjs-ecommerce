// Mocks for useCurrentShippingAddress
// These mocks are for testing the hook in isolation.

export interface ShippingAddress {
  id?: string | number;
  [key: string]: unknown;
}

export const mockUserData = {
  userId: 123,
  companyId: 456,
};

export const mockShippingAddresses: ShippingAddress[] = [
  {
    id: "addr-1",
    addressLine: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  {
    id: "addr-2",
    addressLine: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
  },
];

export const mockStoredAddress: ShippingAddress = {
  id: "addr-stored",
  addressLine: "789 Stored St",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
};

export const mockUseShipping = {
  ShippingAddressData: mockShippingAddresses,
  ShippingAddressDataLoading: false,
  ShippingAddressDataError: null,
};

export const mockUseUserDetails = {
  isAuthenticated: true,
  isLoading: false,
  user: null,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(() => true),
};
