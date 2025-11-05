import { coreCommerceClient, RequestContext } from "../client";
import { BaseService } from "./BaseService";

// Payment history item interface
export interface PaymentHistoryItem {
  amountReceived: number;
  gatewayName?: string | null;
  invoiceIdentifier?: string | null;
  orderIdentifier?: string | null;
  paymentDate?: string | null;
  paymentMode?: string | null;
  referenceNumber?: string | null;
}

// Response interface
export interface OverallPaymentsResponse {
  data?: PaymentHistoryItem[];
  message?: string | null;
  status?: string;
}

// Payment due breakup item interface
export interface PaymentDueBreakup {
  dueDate?: string | null;
  dueAmount: number;
  balanceAmount: number;
  availableAmount?: number;
  paid?: boolean;
  isDue?: boolean;
  dueInDays?: number;
}

// Payment due data item interface
export interface PaymentDueDataItem {
  invoiceIdentifier?: string | null;
  orderIdentifier?: string;
  adjustmentAmount?: number;
  paymentReferences?: unknown[];
  invoicedAmount?: number;
  invoiceDueBreakup?: PaymentDueBreakup[];
  orderDueBreakup?: PaymentDueBreakup[];
  currentDue?: number;
  balanceAmount?: number;
}

// Payment due order data interface
export interface PaymentDueOrderData {
  advancePayable: number;
  totalInvoiced: number;
  totalInvPaid: number;
  invoicePayable: number;
  OrderOutstanding: number;
}

// Payment due response interface (API may return nested structure)
export interface PaymentDueResponse {
  data?: PaymentDueDataItem[];
  // Handle nested response structure
  [key: string]: unknown;
}

// Payment terms item interface
export interface PaymentTerm {
  id?: number;
  paymentTermsId?: number;
  paymentTerms?: string;
  paymentTermsCode?: string;
  description?: string;
  cashdiscount?: boolean;
  cashdiscountValue?: number;
  payOnDelivery?: boolean;
  bnplEnabled?: boolean;
  isMandatory?: boolean;
}

// Payment terms response interface
export interface PaymentTermsResponse {
  data?: PaymentTerm[];
  message?: string | null;
  status?: string;
}

export class PaymentService extends BaseService<PaymentService> {
  // Configure default client for payment operations
  protected defaultClient = coreCommerceClient;

  /**
   * Fetch overall payments towards an order
   * Usage: PaymentService.fetchOverallPaymentsByOrder(orderIdentifier)
   */
  async fetchOverallPaymentsByOrder(
    orderIdentifier: string
  ): Promise<OverallPaymentsResponse> {
    return this.call(
      `payment/fetchOverallPaymentTowardsOrder?orderIdentifier=${orderIdentifier}`,
      {},
      "GET"
    ) as Promise<OverallPaymentsResponse>;
  }

  /**
   * Fetch payment due details by order identifier
   * Usage: PaymentService.fetchPaymentDueByOrder(orderIdentifier)
   * @param orderIdentifier - The order identifier
   * @returns Promise<PaymentDueResponse>
   */
  async fetchPaymentDueByOrder(
    orderIdentifier: string
  ): Promise<PaymentDueResponse> {
    return this.call(
      `paymentDueCalculation/fetchByOrder?orderIdentifier=${encodeURIComponent(orderIdentifier)}`,
      {},
      "GET"
    ) as Promise<PaymentDueResponse>;
  }

  /**
   * Server-side version that returns null on error
   * Usage: PaymentService.fetchPaymentDueByOrderServerSide(orderIdentifier)
   * @param orderIdentifier - The order identifier
   * @returns Promise<PaymentDueResponse | null>
   */
  async fetchPaymentDueByOrderServerSide(
    orderIdentifier: string
  ): Promise<PaymentDueResponse | null> {
    return this.callSafe(
      `paymentDueCalculation/fetchByOrder?orderIdentifier=${encodeURIComponent(orderIdentifier)}`,
      {},
      "GET"
    ) as Promise<PaymentDueResponse | null>;
  }

  /**
   * Fetch payment terms for a user
   * Usage: PaymentService.fetchPaymentTerms(userId)
   * @param userId - The user ID
   * @returns Promise<PaymentTermsResponse>
   */
  async fetchPaymentTerms(
    userId: number | string
  ): Promise<PaymentTermsResponse> {
    const endpoint = `PaymentTerms/fetchPaymentTerms?userId=${userId}&isB2C=false`;
    return (await this.call(endpoint, {}, "POST")) as PaymentTermsResponse;
  }

  /**
   * Server-side version that returns null on error
   * Usage: PaymentService.fetchPaymentTermsServerSide(userId)
   * @param userId - The user ID
   * @returns Promise<PaymentTermsResponse | null>
   */
  async fetchPaymentTermsServerSide(
    userId: number | string
  ): Promise<PaymentTermsResponse | null> {
    const endpoint = `PaymentTerms/fetchPaymentTerms?userId=${userId}&isB2C=false`;
    return (await this.callSafe(
      endpoint,
      {},
      "POST"
    )) as PaymentTermsResponse | null;
  }

  /**
   * Server-side version with context (for API routes)
   * Usage: PaymentService.fetchPaymentTermsWithContext(userId, context)
   * @param userId - The user ID
   * @param context - Request context with accessToken and tenantCode
   * @returns Promise<PaymentTermsResponse | null>
   */
  async fetchPaymentTermsWithContext(
    userId: number | string,
    context: RequestContext
  ): Promise<PaymentTermsResponse | null> {
    const endpoint = `PaymentTerms/fetchPaymentTerms?userId=${userId}&isB2C=false`;
    return (await this.callWithSafe(
      endpoint,
      {},
      {
        context,
        method: "POST",
      }
    )) as PaymentTermsResponse | null;
  }
}

export default PaymentService.getInstance();
