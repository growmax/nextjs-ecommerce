export const sampleProfile = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "9876543210",
  altPhone: "",
  altEmail: "",
  avatar: null,
};

export const samplePreferences = {
  timeZone: "UTC",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24h",
};

export const samplePreferenceOptions = {
  timeZoneOptions: [{ value: "UTC", label: "UTC" }],
  dateFormatOptions: [{ value: "YYYY-MM-DD", label: "YYYY-MM-DD" }],
  timeFormatOptions: [{ value: "24h", label: "24h" }],
};

export function createUseProfileDataMock(overrides: Partial<any> = {}) {
  const setProfile = jest.fn();
  const setPreferences = jest.fn();
  const saveProfile = jest.fn().mockResolvedValue(true);
  const savePreferences = jest.fn().mockResolvedValue(true);
  const loadProfile = jest.fn();
  const loadPreferences = jest.fn();

  return {
    profile: sampleProfile,
    preferences: samplePreferences,
    preferenceOptions: samplePreferenceOptions,
    profileDatas: { id: "1", email: "jane@example.com", phoneNumber: "+19876543210" },
    isLoading: false,
    setProfile,
    setPreferences,
    saveProfile,
    savePreferences,
    loadProfile,
    loadPreferences,
    ...overrides,
  };
}

export default createUseProfileDataMock;
