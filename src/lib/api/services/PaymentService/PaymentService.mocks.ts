// Mocks for PaymentService
// These mocks are for testing the service in isolation.

import type {
  OverallPaymentsResponse,
  PaymentDueResponse,
  PaymentTermsResponse,
} from "@/lib/api/services/PaymentService/PaymentService";

export const mockOrderIdentifier = "ORD-001";

export const mockOverallPaymentsResponse: OverallPaymentsResponse = {
  data: [
    {
      amountReceived: 1000,
      gatewayName: "Stripe",
      invoiceIdentifier: "INV-001",
      orderIdentifier: "ORD-001",
      paymentDate: "2024-01-15",
      paymentMode: "Credit Card",
      referenceNumber: "REF-123",
    },
  ],
  message: "Success",
  status: "success",
};

export const mockPaymentDueResponse: PaymentDueResponse = {
  data: [
    {
      orderIdentifier: "ORD-001",
      adjustmentAmount: 0,
      invoicedAmount: 5000,
      currentDue: 3000,
      balanceAmount: 3000,
      orderDueBreakup: [
        {
          dueDate: "2024-12-31",
          dueAmount: 3000,
          balanceAmount: 3000,
          availableAmount: 0,
          paid: false,
          isDue: false,
          dueInDays: 30,
        },
      ],
    },
  ],
};

export const mockPaymentTermsResponse: PaymentTermsResponse = {
  data: [
    {
      id: 1,
      paymentTermsId: 1,
      paymentTerms: "Net 30",
      paymentTermsCode: "NET30",
      description: "Payment due in 30 days",
      cashdiscount: true,
      cashdiscountValue: 2,
      payOnDelivery: false,
      bnplEnabled: false,
      isMandatory: false,
    },
  ],
  message: "Success",
  status: "success",
};

export const mockPaymentTermsResponseEmpty: PaymentTermsResponse = {
  data: [],
  message: "No payment terms found",
  status: "success",
};
