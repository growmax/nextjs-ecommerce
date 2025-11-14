// Mocks for ProfileService
// These mocks are for testing the service in isolation.

import type { Profile, ProfileResponse } from "./ProfileService";

export const mockProfile: Profile = {
  id: "user-123",
  email: "user@example.com",
  emailVerified: true,
  status: "CONFIRMED",
  tenantId: "tenant-1",
  displayName: "John Doe",
  isSeller: false,
  phoneNumber: "+1234567890",
  phoneNumberVerified: true,
  secondaryEmail: "secondary@example.com",
  secondaryPhoneNumber: "+0987654321",
  hasPassword: true,
};

export const mockProfileResponse: ProfileResponse = {
  success: true,
  data: mockProfile,
};

export const mockProfileUpdateData: Partial<Profile> = {
  displayName: "Jane Doe",
  phoneNumber: "+1111111111",
};

export const mockUpdatedProfile: Profile = {
  ...mockProfile,
  ...mockProfileUpdateData,
};

export const mockUpdatedProfileResponse: ProfileResponse = {
  success: true,
  data: mockUpdatedProfile,
};
