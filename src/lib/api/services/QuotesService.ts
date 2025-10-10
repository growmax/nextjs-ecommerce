import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Quotes Query Parameters Interface
export interface QuotesQueryParams {
  userId: number;
  companyId: number;
  offset?: number;
  limit?: number;
}

// Quotes Request Body Interface
export interface QuotesRequestBody {
  filter_index: number;
  filter_name: string;
  endCreatedDate: string;
  endDate: string;
  endValue: string;
  endTaxableAmount: string;
  endGrandTotal: string;
  identifier: string;
  limit: number;
  offset: number;
  name: string;
  pageNumber: number;
  startDate: string;
  startCreatedDate: string;
  startValue: string;
  startTaxableAmount: string;
  startGrandTotal: string;
  status: string[];
  selectedColumns: string[];
  columnWidth: number[];
  columnPosition: string;
  userDisplayName: string;
  userStatus: string[];
  accountId: number[];
  branchId: number[];
}

// Currency Symbol Interface
export interface CurrencySymbol {
  currencyCode: string;
  decimal: string;
  description: string;
  id: number;
  precision: number;
  symbol: string;
  tenantId: number;
  thousand: string;
}

// Approval Group Interface
export interface ApprovalGroup {
  approvalName: string;
  discount: boolean;
  id: number;
  tenantId: number;
}

// Quote User Interface
export interface QuoteUser {
  createdOn: string | null;
  department: string | null;
  displayName: string;
  dottedReportingTo: string | null;
  email: string;
  id: number;
  isActive: boolean | null;
  isDeleted: boolean | null;
  jobTitle: string | null;
  lastLoginAt: string | null;
  mobileNo: string | null;
  name: string | null;
  nationalMobileNum: string | null;
  ownerRole: string | null;
  password: string | null;
  picture: string;
  reportingTo: string | null;
  roleId: number | null;
  roleName: string | null;
  status: string;
  updatedOn: string | null;
  userBranchBUDTO: unknown | null;
  userCode: string | null;
  userTags: string | null;
  vendorId: number | null;
}

// Quote Item Interface
export interface QuoteItem {
  SPRRequested: boolean;
  approvalAwaiting: unknown | null;
  approvalGroupId: ApprovalGroup | null;
  approvalInitiated: boolean;
  buyerCompanyBranchName: string;
  buyerCompanyName: string;
  calculatedTotal: number;
  createdDate: string;
  curencySymbol: CurrencySymbol;
  customerRequiredDate: string | null;
  erpCode: string | null;
  grandTotal: number;
  itemCount: number;
  lastUpdatedDate: string;
  leadIdentifier: string | null;
  orderIdentifier: string[] | null;
  quotationIdentifier: string;
  quoteName: string;
  quoteUsers: QuoteUser[] | null;
  sellerCompanyBranchName: string;
  sellerCompanyName: string;
  subTotal: number;
  taxableAmount: number;
  updatedBuyerStatus: string;
  updatedSellerStatus: string;
  vendorId: number | null;
}

// Quotes Response Data Interface
export interface QuotesResponseData {
  quotesResponse: QuoteItem[];
  totalQuoteCount: number;
}

// Quotes Response Interface
export interface QuotesApiResponse {
  data: QuotesResponseData;
  message: string | null;
  status: string;
}

export class QuotesService extends BaseService<QuotesService> {
  static getQuotes(
    _queryParams: {
      userId: number;
      companyId: number;
      offset: number;
      limit: number;
    },
    _filterRequest: {
      filter_index: number;
      filter_name: string;
      endCreatedDate: string;
      endDate: string;
      endValue: string;
      endTaxableAmount: string;
      endGrandTotal: string;
      identifier: string;
      limit: number;
      offset: number;
      name: string;
      pageNumber: number;
      startDate: string;
      startCreatedDate: string;
      startValue: string;
      startTaxableAmount: string;
      startGrandTotal: string;
      status: string[];
      selectedColumns: never[];
      columnWidth: never[];
      columnPosition: string;
      userDisplayName: string;
      userStatus: never[];
      accountId: never[];
      branchId: never[];
    }
  ) {
    throw new Error("Method not implemented.");
  }
  protected defaultClient = coreCommerceClient;

  async getQuotes(
    params: QuotesQueryParams,
    requestBody: Partial<QuotesRequestBody>
  ): Promise<QuotesApiResponse> {
    const { userId, companyId, offset = 0, limit = 20 } = params;

    // Merge with default values for required fields
    const completeRequestBody: QuotesRequestBody = {
      filter_index: 0,
      filter_name: "",
      endCreatedDate: "",
      endDate: "",
      endValue: "",
      endTaxableAmount: "",
      endGrandTotal: "",
      identifier: "",
      limit,
      offset,
      name: "",
      pageNumber: 1,
      startDate: "",
      startCreatedDate: "",
      startValue: "",
      startTaxableAmount: "",
      startGrandTotal: "",
      status: [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
      userDisplayName: "",
      userStatus: [],
      accountId: [],
      branchId: [],
      ...requestBody, // Override with provided values
    };

    return (await this.call(
      `/quotes/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&limit=${limit}`,
      completeRequestBody,
      "POST"
    )) as QuotesApiResponse;
  }
}

export default QuotesService.getInstance();
