import { AuthStorage } from "../../auth";
import { JWTService } from "../../services/JWTService";
import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Branch Address Interface
export interface BranchAddress {
  id: number;
  addressLine: string;
  billToCode: string | null;
  branchName: string;
  city: string;
  country: string;
  countryCode: string;
  district: string;
  email: string | null;
  gst: string;
  isBilling: boolean;
  isCustAddress: boolean;
  isShipping: boolean;
  lattitude: string;
  locality: string;
  locationUrl: string | null;
  longitude: string;
  mobileNo: string;
  nationalMobileNum: string;
  phone: string;
  pinCodeId: string;
  primaryContact: string;
  regAddress: boolean;
  shipToCode: string | null;
  soldToCode: string | null;
  state: string;
  tenantId: number;
  vendorID: string | null;
  vendorId: string | null;
  wareHouse: boolean;
}

// Zone Interface
export interface Zone {
  id: number;
  zoneId: {
    id: number;
    tenantId: number;
    vendorId: string | null;
    zoneName: string;
  };
}

// Branch Interface
export interface Branch {
  id: number;
  addressId: BranchAddress;
  branchSequenceNumber: string | null;
  businessUnits: BusinessUnit[];
  code: string | null;
  inSequenceNumber: string | null;
  name: string;
  poSequenceNumber: string | null;
  removeBranchWareHouseId: string | null;
  removeBusinessUnits: string | null;
  salesBranchCode: string | null;
  salesOrgId: string | null;
  soSequenceNumber: string | null;
  toSequenceNumber: string | null;
  wareHouses: Warehouse[];
  zoneId: Zone | null;
}

// Main Response Interface
export interface BranchApiResponse {
  data: {
    branchResponse: Branch[];
    totalCount: number;
  };
  message: string;
  status: string;
}

// Delete Response Interface
export interface DeleteAddressResponse {
  data: number;
  message: string;
  status: string;
}
export interface CompanyApiResponse {
  data: {
    id: number;
    accountTypeId: {
      id: number;
      name: string;
    };
    activated: boolean;
    addressId: {
      id: number;
      addressLine: string;
      billToCode: string;
      branchName: string;
      city: string;
      country: string;
      countryCode: string;
      district: string;
      email: string | null;
      gst: string;
      isBilling: boolean;
      isCustAddress: boolean;
      isShipping: boolean;
      lattitude: string;
      locality: string;
      locationUrl: string;
      longitude: string;
      mobileNo: string;
      nationalMobileNum: string;
      phone: string;
      pinCodeId: string;
      primaryContact: string;
      regAddress: boolean;
      shipToCode: string;
      soldToCode: string;
      state: string;
      tenantId: number;
      vendorID: string | null;
      vendorId: string | null;
      wareHouse: boolean;
    };
    bnplCustomerId: string | null;
    bnplEnabled: boolean;
    bnplPhone: string | null;
    businessTypeId: {
      id: number;
      name: string;
      tenantId: number;
    };
    companyIdentifier: string | null;
    currencyId: {
      id: number;
      currencyCode: string;
      decimal: string;
      description: string;
      precision: number;
      symbol: string;
      tenantId: number;
      thousand: string;
    };
    defaultEmail: string;
    finEndDate: string | null;
    finStartDate: string | null;
    finStartMonth: string | null;
    financialYear: string | null;
    inviteAccess: number;
    logo: string;
    name: string;
    profileAccess: boolean;
    reportEmail: string | null;
    subIndustryId: {
      id: number;
      description: string;
      industryId: {
        id: number;
        name: string;
        tenantId: number;
      };
      name: string;
      tenantId: number;
    };
    taxDetailsId: {
      id: number;
      pan: string;
      panImage: string | null;
      tenantId: number;
    };
    taxExempted: boolean;
    taxExemptionId: string | null;
    tenantId: number;
    vendorId: string | null;
    verified: boolean;
    website: string | null;
  };
  message: string | null;
  status: string;
}
// Industry Interface
export interface Industry {
  id: number;
  name: string;
  tenantId: number;
}
// SubIndustry Interface
export interface getSubIndustrysbyid {
  id: number;
  name: string;
  description: string;
  industryId: Industry;
  tenantId: number;
}
// Response type - array of SubIndustry items
export type SubIndustryApiResponse = getSubIndustrysbyid[];

// Parameter interfaces for better type safety and clarity
export interface BranchPaginationParams {
  userId?: string | number;
  companyId?: number;
  offset: number;
  limit: number;
  searchString?: string;
}

export interface DeleteBranchParams {
  addressId: number;
}

// Country Data Interface
export interface CountryData {
  callingCodes: number;
  flag: string;
  id: number;
  iso2: string;
  iso3: string;
  name: string;
  numericCode: number;
  region: string;
  subregion: string;
  countryCode: string;
}

// State Data Interface
export interface StateData {
  countryCode: string;
  countryId: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  stateCode: string;
}

// District Data Interface
export interface DistrictData {
  name: string;
}

// Address Data Interface
export interface AddressData {
  id?: number;
  gst: string;
  branchName: string;
  addressLine: string;
  locality: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  lattitude?: string;
  pinCodeId: string;
  state: string;
  country: string;
  countryCode: string;
  isShipping: boolean;
  isBilling: boolean;
  wareHouse: boolean;
  primaryContact: string;
  mobileNo: string;
  phone: string;
  nationalMobileNum: string;
  email?: string | null;
  billToCode?: string | null;
  shipToCode?: string | null;
  soldToCode?: string | null;
  isCustAddress?: boolean;
  regAddress?: boolean;
  locationUrl?: string | null;
  tenantId?: number;
  vendorID?: string | null;
  vendorId?: string | null;
}

// Warehouse Interface
export interface Warehouse {
  id?: number;
  name?: string;
  code?: string;
}

// Business Unit Interface
export interface BusinessUnit {
  id?: number;
  name?: string;
  code?: string;
}

// Zone Interface (updated)
export interface ZoneInfo {
  id?: number;
  zoneName?: string;
  zoneCode?: string;
}

// Create Branch Request Interface
export interface CreateBranchRequest {
  addressId: AddressData;
  removeBranchWareHouseId: number[];
  removeBusinessUnits: number[];
  wareHouses: Warehouse[];
  businessUnits: BusinessUnit[];
  zoneId: ZoneInfo | null;
  branch: {
    addressId: AddressData;
  };
  removeWareHouse: number[];
  companyId: number;
  userId: number;
  isUpdate: boolean;
}

// Create Branch Response Interface
export interface CreateBranchResponse {
  data: null;
  message: string;
  status: string;
}

// Update Branch Request Interface (extends create but with additional fields)
export interface UpdateBranchRequest extends CreateBranchRequest {
  id: number;
  branchSequenceNumber: string | null;
  code: string | null;
  inSequenceNumber: string | null;
  name: string;
  poSequenceNumber: string | null;
  salesBranchCode: string | null;
  salesOrgId: string | null;
  soSequenceNumber: string | null;
  toSequenceNumber: string | null;
}

// Update Branch Response Interface
export interface UpdateBranchResponse {
  data: null;
  message: string;
  status: string;
}

// Dashboard Request Interface
export interface DashboardRequest {
  accountId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string[];
  searchString?: string;
}

// Dashboard Query Parameters Interface
export interface DashboardQueryParams {
  userId: number;
  companyId: number;
  offset?: number;
  limit?: number;
  currencyId: number;
}

// Order Graph Data Interface
export interface OrderGraphItem {
  amountValue: number;
  avgScore: number | null;
  count: number;
  dateValue: string;
  status: string;
}

// Quote Graph Data Interface
export interface QuoteGraphItem {
  amountValue: number;
  avgScore: number | null;
  count: number;
  dateValue: string;
  status: string;
}

// Quote Status Graph Data Interface
export interface QuoteStatusGraphItem {
  amountValue: number;
  count: number;
  quoteStatus: string;
}

// Top Order/Quote Data Interface
export interface TopDataItem {
  amountVale: number;
  name: string;
}

// Dashboard Data Interface
export interface DashboardData {
  activeAccounts: number;
  avgNpsGraphType: string | null;
  buyerorderGraphType: string | null;
  invoiceGraphType: string | null;
  lsAvgNpsGraphDto: unknown[] | null;
  lsBuyerorderGraphDto: unknown[] | null;
  lsInvoiceGraphDto: unknown[] | null;
  lsOrderGraphDto: OrderGraphItem[];
  lsQuoteGraphDto: QuoteGraphItem[];
  lsQuoteStatusGraphDto: QuoteStatusGraphItem[];
  lsSprGraphDto: unknown[] | null;
  orderGraphType: string;
  quoteGraphType: string;
  topOrderDto: TopDataItem[];
  topQuoteDto: TopDataItem[];
  totalAccounts: number;
  totalActiveUsers: number | null;
  totalBillingValues: number | null;
  totalCustomerLs: number | null;
}

// Dashboard Response Interface
export interface DashboardResponse {
  data: DashboardData;
  message: string | null;
  status: string;
}

export class CompanyService extends BaseService<CompanyService> {
  protected defaultClient = coreCommerceClient;

  async getAllBranchesWithPagination(
    params: BranchPaginationParams
  ): Promise<BranchApiResponse> {
    const { offset, limit, searchString = "" } = params;

    let userId = params.userId;
    let companyId = params.companyId;

    // Auto-read from JWT if not provided
    if (!userId || !companyId) {
      const accessToken = AuthStorage.getAccessToken();
      if (accessToken) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload: any =
            JWTService.getInstance().decodeToken(accessToken);
          // common token field names - try a few fallbacks
          userId = userId ?? payload?.userId ?? payload?.id ?? payload?.sub;
          companyId = companyId ?? payload?.companyId;
        } catch (_e) {
          // decoding failed -> let the missing id check below handle it
        }
      }
    }

    if (
      userId === undefined ||
      userId === null ||
      companyId === undefined ||
      companyId === null
    ) {
      return Promise.reject(
        new Error("Missing userId or companyId. Ensure user is authenticated.")
      );
    }

    return (await this.call(
      `/branches/readBranchwithPagination/${userId}?companyId=${companyId}&offset=${offset}&limit=${limit}&searchString=${encodeURIComponent(
        searchString
      )}`,
      undefined,
      "GET"
    )) as BranchApiResponse;
  }
  async deleteRecordBranchesWithPagination(
    params: DeleteBranchParams
  ): Promise<DeleteAddressResponse> {
    const { addressId } = params;
    return (await this.call(
      `/addresses/deleteBrnAddress?addressId=${addressId}`,
      undefined,
      "DELETE"
    )) as DeleteAddressResponse;
  }

  // New helper: fetch company for the currently authenticated user (reads token, decodes companyId)
  async getBranch(id?: string | number): Promise<CompanyApiResponse | null> {
    let companyId: string | number | undefined = id;

    if (companyId === undefined || companyId === null) {
      const accessToken = AuthStorage.getAccessToken();
      if (!accessToken) {
        // no token -> caller can decide how to handle (null means not authenticated)
        return null;
      }

      const jwtService = JWTService.getInstance();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = jwtService.decodeToken(accessToken);
        companyId = payload?.companyId;
        if (!companyId) return null;
      } catch (_e) {
        // invalid token
        return null;
      }
    }

    return (await this.call(
      `/companys/${companyId}`,
      undefined,
      "GET"
    )) as CompanyApiResponse;
  }

  // Backwards-compatible alias (optional)
  async getCurrentCompany(): Promise<CompanyApiResponse | null> {
    return this.getBranch();
  }

  async getSubIndustrys(): Promise<SubIndustryApiResponse> {
    return (await this.call(
      `/subindustrys`,
      undefined,
      "GET"
    )) as SubIndustryApiResponse;
  }
  async createBranchAddress(
    params: CreateBranchRequest
  ): Promise<CreateBranchResponse> {
    const { userId, companyId } = params;

    return (await this.call(
      `/branches/createBranch/${userId}?companyId=${companyId}`,
      params,
      "POST"
    )) as CreateBranchResponse;
  }

  async updateBranchAddress(
    params: UpdateBranchRequest
  ): Promise<UpdateBranchResponse> {
    const { userId, companyId, addressId } = params;

    return (await this.call(
      `/addresses/updateBrnAddress/${userId}?companyId=${companyId}&addressId=${addressId.id}`,
      params,
      "PUT"
    )) as UpdateBranchResponse;
  }

  async getDashboard(
    queryParams: DashboardQueryParams,
    requestBody?: DashboardRequest
  ): Promise<DashboardResponse> {
    const {
      userId,
      companyId,
      offset = 0,
      limit = 99999999,
      currencyId,
    } = queryParams;

    return (await this.call(
      `/dashBoardService/findByDashBoardFilterNew?userId=${userId}&companyId=${companyId}&offset=${offset}&limit=${limit}&currencyId=${currencyId}`,
      requestBody || {},
      "POST"
    )) as DashboardResponse;
  }
}

export default CompanyService.getInstance();
