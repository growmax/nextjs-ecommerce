export const samplePreferences = {
  timeZone: "UTC",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "12hr",
};

export const timeZoneOptions = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
];

export const dateFormatOptions = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
];

export const timeFormatOptions = [
  { value: "12hr", label: "12hr" },
  { value: "24hr", label: "24hr" },
];

export const defaultProps = {
  preferences: samplePreferences,
  onChange: () => {},
  timeZoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  isLoading: false,
  dataLoading: false,
};
