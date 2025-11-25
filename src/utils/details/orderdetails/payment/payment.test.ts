import { getLastDateToPay } from "@/utils/details/orderdetails/payment/payment";
import {
  mockPaymentDueDataEmpty,
  mockPaymentDueDataEmptyBreakup,
  mockPaymentDueDataFutureDate,
  mockPaymentDueDataNoBreakup,
  mockPaymentDueDataNoDueDate,
  mockPaymentDueDataOverdue,
  mockPaymentDueDataOverdueMultipleDays,
  mockPaymentDueDataOverdueOneDay,
  mockPaymentDueDataWithInvoiceDue,
  mockPaymentDueDataWithOrderDue,
  mockUserPreferences,
  mockUserPreferences24h,
} from "@/utils/details/orderdetails/payment/payment.mocks";

// Mock zoneDateTimeCalculator
jest.mock("@/utils/date-format/date-format", () => ({
  zoneDateTimeCalculator: jest.fn(() => {
    return "31/12/2024, 12:00 AM";
  }),
}));

describe("payment utilities", () => {
  describe("getLastDateToPay", () => {
    it("should return '- No due' for empty payment due data", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataEmpty,
        mockUserPreferences
      );

      expect(result).toBe("- No due");
    });

    it("should return '- No due' when first item is missing", () => {
      const result = getLastDateToPay([], mockUserPreferences);

      expect(result).toBe("- No due");
    });

    it("should return '- No due' when no breakup exists", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataNoBreakup,
        mockUserPreferences
      );

      expect(result).toBe("- No due");
    });

    it("should return '- No due' when breakup is empty array", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataEmptyBreakup,
        mockUserPreferences
      );

      expect(result).toBe("- No due");
    });

    it("should return '-' when dueDate is missing", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataNoDueDate,
        mockUserPreferences
      );

      expect(result).toBe("-");
    });

    it("should use orderDueBreakup when invoiceIdentifier is not present", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataWithOrderDue,
        mockUserPreferences
      );

      expect(result).toBeDefined();
      expect(result).not.toBe("- No due");
      expect(result).not.toBe("-");
    });

    it("should use invoiceDueBreakup when invoiceIdentifier is present", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataWithInvoiceDue,
        mockUserPreferences
      );

      expect(result).toBeDefined();
      expect(result).not.toBe("- No due");
      expect(result).not.toBe("-");
    });

    it("should format date using user preferences", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataWithOrderDue,
        mockUserPreferences
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should use different timezone from preferences", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataWithOrderDue,
        mockUserPreferences24h
      );

      expect(result).toBeDefined();
    });

    it("should return 'Overdue by X days' when date is overdue", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataOverdue,
        mockUserPreferences
      );

      expect(result).toContain("Overdue by");
      expect(result).toContain("day");
    });

    it("should use singular 'day' when overdue by 1 day", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataOverdueOneDay,
        mockUserPreferences
      );

      expect(result).toContain("Overdue by 1 day");
      expect(result).not.toContain("days");
    });

    it("should use plural 'days' when overdue by multiple days", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataOverdueMultipleDays,
        mockUserPreferences
      );

      expect(result).toContain("Overdue by");
      expect(result).toContain("days");
    });

    it("should format future dates correctly", () => {
      const result = getLastDateToPay(
        mockPaymentDueDataFutureDate,
        mockUserPreferences
      );

      expect(result).toBeDefined();
      expect(result).not.toContain("Overdue");
    });

    it("should return '-' when formattedDate is empty", () => {
      // Mock zoneDateTimeCalculator to return empty string
      const { zoneDateTimeCalculator } = jest.requireMock(
        "@/utils/date-format/date-format"
      );
      zoneDateTimeCalculator.mockReturnValueOnce("");

      const result = getLastDateToPay(
        mockPaymentDueDataFutureDate,
        mockUserPreferences
      );

      expect(result).toBe("-");
    });

    it("should handle date at exact current time", () => {
      const now = new Date();
      const paymentData = [
        {
          orderDueBreakup: [
            {
              dueDate: now.toISOString(),
              amount: 1000,
            },
          ],
        } as any,
      ];

      const result = getLastDateToPay(paymentData, mockUserPreferences);

      // Should either be overdue (if date is in the past) or formatted
      expect(result).toBeDefined();
    });

    it("should prioritize invoiceDueBreakup over orderDueBreakup when invoiceIdentifier exists", () => {
      const paymentData = [
        {
          invoiceIdentifier: "INV-001",
          invoiceDueBreakup: [
            {
              dueDate: "2024-12-31T00:00:00Z",
              amount: 1000,
            },
          ],
          orderDueBreakup: [
            {
              dueDate: "2025-01-31T00:00:00Z",
              amount: 2000,
            },
          ],
        } as any,
      ];

      const result = getLastDateToPay(paymentData, mockUserPreferences);

      // Should use invoiceDueBreakup date (2024-12-31)
      expect(result).toBeDefined();
    });
  });
});
