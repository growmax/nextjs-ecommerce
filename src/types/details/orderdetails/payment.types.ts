export interface PaymentDueBreakup {
  dueDate?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface PaymentDueDataItem {
  invoiceIdentifier?: string;
  orderIdentifier?: string;
  invoiceDueBreakup?: PaymentDueBreakup[];
  orderDueBreakup?: PaymentDueBreakup[];
  [key: string]: unknown;
}
