// Mocks for useGetLatestPaymentTerms
// These mocks are for testing the hook in isolation.

import type { PaymentTerm } from "@/lib/api";
import axios from "axios";

export const mockUser = {
  userId: 123,
  companyId: 456,
};

export const mockPaymentTerms: PaymentTerm[] = [
  {
    id: 1,
    paymentTerms: "Net 30",
    paymentTermsCode: "NET30",
    cashdiscount: false,
    cashdiscountValue: 0,
  },
  {
    id: 2,
    paymentTerms: "2/10 Net 30",
    paymentTermsCode: "2/10NET30",
    cashdiscount: true,
    cashdiscountValue: 2,
  },
  {
    id: 3,
    paymentTerms: "Net 60",
    paymentTermsCode: "NET60",
    cashdiscount: false,
    cashdiscountValue: 0,
  },
];

export const mockCashDiscountTerm: PaymentTerm = mockPaymentTerms[1]!;

export const mockAxiosResponse = {
  data: {
    success: true,
    data: mockPaymentTerms,
    isLoggedIn: true,
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
};

export const mockAxiosResponseNoCashDiscount = {
  data: {
    success: true,
    data: [mockPaymentTerms[0], mockPaymentTerms[2]], // No cash discount terms
    isLoggedIn: true,
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
};

export const mockAxiosError = {
  message: "Network Error",
  response: {
    status: 500,
    data: {
      error: "Internal Server Error",
    },
  },
  isAxiosError: true,
};

export const mockAxios = axios as jest.Mocked<typeof axios>;
