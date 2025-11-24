import { UserPreferenceProfile } from "./userPreferenceApiService";

export const samplePreference: UserPreferenceProfile = {
  id: 1,
  tenantId: 100,
  userId: { id: 42 },
  vendorId: null,
  dateFormat: "DD-MM-YYYY",
  timeFormat: "12hr",
  timeZone: "Asia/Kolkata",
};

export default samplePreference;
