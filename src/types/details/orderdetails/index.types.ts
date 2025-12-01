// Re-export types from other files
export * from "./version.types";
// Note: PaymentDueDataItem is exported from @/lib/api instead of here
// export * from "./payment.types"; // Commented out - use PaymentDueDataItem from @/lib/api instead

// Import types for proper typing
import type { OrderDetailsResponse } from "@/lib/api";

// Re-export for convenience
export type { OrderDetailsResponse };
export interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCodeId?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  sellerCompanyName?: string;
  sellerBranchName?: string;
}

export interface OrderTerms {
  paymentTerms?: string;
  paymentTermsCode?: string;
  deliveryTerms?: string;
  deliveryTermsCode?: string;
  deliveryTermsCode2?: string;
  freight?: string;
  insurance?: string;
  packageForwarding?: string;
  packageForwardingCode?: string;
  dispatchInstructions?: string;
  dispatchInstructionsCode?: string;
  additionalTerms?: string;
}

export interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
    locale: string;
  }>;
}

export interface OrderDetailsClientProps {
  params: Promise<{
    orderId: string;
    locale: string;
  }>;
  initialOrderDetails?: OrderDetailsResponse | null;
}
