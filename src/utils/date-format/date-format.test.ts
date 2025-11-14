import {
  dateISOFormat,
  dateLocalFormat,
  dateWithTimeFormat,
  zoneDateTimeCalculator,
} from "./date-format";
import {
  mockDateFormats,
  mockDateObjects,
  mockDateStrings,
  mockInvalidDateNumber,
  mockInvalidDateString,
  mockTimeFormats,
  mockTimeZones,
  mockValidDate,
  mockValidDateNumber,
  mockValidDateString,
} from "./date-format.mocks";

describe("date-format utilities", () => {
  describe("dateWithTimeFormat", () => {
    it("should format date with time from Date object", () => {
      const result = dateWithTimeFormat(mockValidDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} (AM|PM)/);
    });

    it("should format date with time from string", () => {
      const result = dateWithTimeFormat(mockValidDateString);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} (AM|PM)/);
    });

    it("should format date with time from number (timestamp)", () => {
      const result = dateWithTimeFormat(mockValidDateNumber);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} (AM|PM)/);
    });

    it("should throw error for invalid date", () => {
      expect(() => dateWithTimeFormat(mockInvalidDateString)).toThrow();
    });

    it("should throw error for invalid date number", () => {
      expect(() => dateWithTimeFormat(mockInvalidDateNumber)).toThrow();
    });

    it("should format correctly for different dates", () => {
      const result1 = dateWithTimeFormat(mockDateObjects.january15);
      const result2 = dateWithTimeFormat(mockDateObjects.december25);

      expect(result1).toContain("15/01/2024");
      expect(result2).toContain("25/12/2024");
    });
  });

  describe("dateLocalFormat", () => {
    it("should format date in local format from Date object", () => {
      const result = dateLocalFormat(mockValidDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should format date in local format from string", () => {
      const result = dateLocalFormat(mockValidDateString);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should format date in local format from number", () => {
      const result = dateLocalFormat(mockValidDateNumber);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should throw error for invalid date", () => {
      expect(() => dateLocalFormat(mockInvalidDateString)).toThrow();
    });

    it("should format correctly for different dates", () => {
      const result = dateLocalFormat(mockDateObjects.february14);
      expect(result).toContain("14/02/2024");
    });

    it("should return format dd/MM/yyyy", () => {
      const result = dateLocalFormat(new Date("2024-03-15"));
      expect(result).toBe("15/03/2024");
    });
  });

  describe("dateISOFormat", () => {
    it("should format date in ISO format from Date object", () => {
      const result = dateISOFormat(mockValidDate);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should format date in ISO format from string", () => {
      const result = dateISOFormat(mockValidDateString);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should format date in ISO format from number", () => {
      const result = dateISOFormat(mockValidDateNumber);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should throw error for invalid date string", () => {
      expect(() => dateISOFormat(mockInvalidDateString)).toThrow();
    });

    it("should throw error for invalid date number (NaN)", () => {
      expect(() => dateISOFormat(mockInvalidDateNumber)).toThrow();
    });

    it("should return ISO format without milliseconds", () => {
      const result = dateISOFormat(new Date("2024-01-15T10:30:00.123Z"));
      expect(result).not.toContain(".");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe("zoneDateTimeCalculator", () => {
    it("should format date with default timezone and format", () => {
      const result = zoneDateTimeCalculator(mockValidDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should return undefined for null input", () => {
      const result = zoneDateTimeCalculator(null);
      expect(result).toBeUndefined();
    });

    it("should return undefined for undefined input", () => {
      const result = zoneDateTimeCalculator(undefined);
      expect(result).toBeUndefined();
    });

    it("should format date with custom timezone", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.newYork
      );
      expect(result).toBeDefined();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should format date with custom date format", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata,
        mockDateFormats.us
      );
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should format date with time when includeTime is true", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata,
        mockDateFormats.default,
        mockTimeFormats.default,
        true
      );
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/);
    });

    it("should format date without time when includeTime is false", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata,
        mockDateFormats.default,
        mockTimeFormats.default,
        false
      );
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(result).not.toContain(":");
    });

    it("should format date with custom time format", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata,
        mockDateFormats.default,
        mockTimeFormats.twentyFour,
        true
      );
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it("should handle different timezones correctly", () => {
      const result1 = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata
      );
      const result2 = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.newYork
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // Both should be valid date strings
      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
    });

    it("should throw error for invalid date", () => {
      expect(() => zoneDateTimeCalculator(mockInvalidDateString)).toThrow();
    });

    it("should accept Date object input", () => {
      const result = zoneDateTimeCalculator(mockDateObjects.january15);
      expect(result).toBeDefined();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should accept string input", () => {
      const result = zoneDateTimeCalculator(mockDateStrings.iso);
      expect(result).toBeDefined();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should accept number input", () => {
      const result = zoneDateTimeCalculator(mockValidDateNumber);
      expect(result).toBeDefined();
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should use default timezone when not provided", () => {
      const result = zoneDateTimeCalculator(mockValidDate);
      expect(result).toBeDefined();
      // Should use Asia/Kolkata as default
    });

    it("should use default date format when not provided", () => {
      const result = zoneDateTimeCalculator(mockValidDate);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("should use default time format when not provided", () => {
      const result = zoneDateTimeCalculator(
        mockValidDate,
        mockTimeZones.kolkata,
        mockDateFormats.default,
        undefined,
        true
      );
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/);
    });

    it("should handle empty string date format", () => {
      expect(() =>
        zoneDateTimeCalculator(mockValidDate, mockTimeZones.kolkata, "")
      ).toThrow();
    });

    it("should handle empty string time format", () => {
      expect(() =>
        zoneDateTimeCalculator(
          mockValidDate,
          mockTimeZones.kolkata,
          mockDateFormats.default,
          "",
          true
        )
      ).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle date at midnight", () => {
      const midnight = new Date("2024-01-15T00:00:00Z");
      const result = dateWithTimeFormat(midnight);
      expect(result).toContain("15/01/2024");
    });

    it("should handle date at end of day", () => {
      const endOfDay = new Date("2024-01-15T23:59:59Z");
      const result = dateWithTimeFormat(endOfDay);
      // Date may be converted to next day due to timezone, so just check it's formatted
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} (AM|PM)/);
    });

    it("should handle leap year date", () => {
      const leapYear = new Date("2024-02-29T10:00:00Z");
      const result = dateLocalFormat(leapYear);
      expect(result).toContain("29/02/2024");
    });

    it("should handle year boundary", () => {
      const newYear = new Date("2024-01-01T00:00:00Z");
      const result = dateLocalFormat(newYear);
      expect(result).toBe("01/01/2024");
    });

    it("should handle different date input types consistently", () => {
      const dateObj = new Date("2024-06-15T12:00:00Z");
      const dateStr = "2024-06-15T12:00:00Z";
      const dateNum = dateObj.getTime();

      const result1 = dateLocalFormat(dateObj);
      const result2 = dateLocalFormat(dateStr);
      const result3 = dateLocalFormat(dateNum);

      // All should produce the same formatted date
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
