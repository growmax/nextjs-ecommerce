// Mocks for date-format utilities
// These mocks are for testing the utilities in isolation.

export const mockValidDate = new Date("2024-01-15T10:30:00Z");
export const mockValidDateString = "2024-01-15T10:30:00Z";
export const mockValidDateNumber = mockValidDate.getTime();

export const mockInvalidDate = new Date("invalid");
export const mockInvalidDateString = "not-a-date";
export const mockInvalidDateNumber = NaN;

export const mockDateObjects = {
  january15: new Date("2024-01-15T10:30:00Z"),
  december25: new Date("2024-12-25T15:45:00Z"),
  february14: new Date("2024-02-14T08:00:00Z"),
};

export const mockDateStrings = {
  iso: "2024-01-15T10:30:00Z",
  dateOnly: "2024-01-15",
  timestamp: "1705315800000",
};

export const mockTimeZones = {
  kolkata: "Asia/Kolkata",
  newYork: "America/New_York",
  london: "Europe/London",
  tokyo: "Asia/Tokyo",
};

export const mockDateFormats = {
  default: "dd/MM/yyyy",
  us: "MM/dd/yyyy",
  iso: "yyyy-MM-dd",
  long: "dd MMMM yyyy",
};

export const mockTimeFormats = {
  default: "hh:mm a",
  twentyFour: "HH:mm",
  withSeconds: "hh:mm:ss a",
};
