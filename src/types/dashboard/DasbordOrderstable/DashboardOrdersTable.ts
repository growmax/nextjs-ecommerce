interface CurrencySymbol {
  currencyCode: string;
  decimal: string;
  description: string;
  id: number;
  precision: number;
  symbol: string;
  tenantId: number;
  thousand: string;
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  SPRRequested: boolean;
  buyerBranchName: string;
  buyerCompanyName: string;
  createdDate: string;
  currencySymbol: CurrencySymbol;
  erpError: string | null;
  erpId: string;
  grandTotal: number;
  itemcount: number;
  lastUpdatedDate: string;
  orderIdentifier: string;
  orderName: string;
  orderUsers: OrderUser[] | null;
  quotationIdentifier: string | null;
  requiredDate: string | null;
  sellerBranchName: string;
  sellerCompanyName: string;
  soldToCode: string;
  subTotal: number;
  taxableAmount: number;
  updatedBuyerStatus: string;
  updatedSellerStatus: string;
  vendorId: string | null | number;
}

export type { CurrencySymbol, OrderUser };
