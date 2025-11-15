// Mocks for payment utilities
// These mocks are for testing the utilities in isolation.

import type { PaymentDueDataItem } from "@/lib/api";
import type { UserPreferences } from "@/types/details/orderdetails/version.types";

export const mockUserPreferences: UserPreferences = {
  timeZone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
};

export const mockUserPreferences24h: UserPreferences = {
  timeZone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "24h",
};

export const mockPaymentDueDataWithOrderDue: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueDate: "2024-12-31T00:00:00Z",
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataWithInvoiceDue: PaymentDueDataItem[] = [
  {
    invoiceIdentifier: "INV-001",
    invoiceDueBreakup: [
      {
        dueDate: "2024-12-31T00:00:00Z",
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataOverdue: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueDate: "2024-01-01T00:00:00Z", // Past date
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataOverdueOneDay: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataOverdueMultipleDays: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataEmpty: PaymentDueDataItem[] = [];

export const mockPaymentDueDataNoBreakup: PaymentDueDataItem[] = [
  {} as PaymentDueDataItem,
];

export const mockPaymentDueDataEmptyBreakup: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataNoDueDate: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueAmount: 1000,
        balanceAmount: 1000,
      } as any,
    ],
  } as PaymentDueDataItem,
];

export const mockPaymentDueDataFutureDate: PaymentDueDataItem[] = [
  {
    orderDueBreakup: [
      {
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        dueAmount: 1000,
        balanceAmount: 1000,
      },
    ],
  } as PaymentDueDataItem,
];
