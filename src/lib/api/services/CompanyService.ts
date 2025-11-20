import { AuthStorage } from "../../auth";
import { JWTService } from "../../services/JWTService";
import { authClient, coreCommerceClient } from "../client";
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
export interface UserProfile {
  id: string;
  tenantId: string;

  displayName: string;
  email: string;
  secondaryEmail: string;

  emailVerified: boolean;
  hasPassword: boolean;
  status: string;
  isSeller: boolean;

  callingCodes: string;
  callingCodesSecondary: string;

  countryCallingCode: string;
  countryCallingCodeSecondary: string;

  iso2: string;
  iso2Secondary: string;

  phoneNumber: string;                 // e.g. +919159153985
  phoneNumberVerified: boolean;

  nationalMobileNum: string;           // e.g. 919159153985
  nationalMobileNumSecondary: string;  // can be empty

  secondaryPhoneNumber: string;
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
  // The API returns the updated branch payload. Use UpdateBranchRequest shape
  // (nullable) so callers can read the returned object directly.
  data: UpdateBranchRequest | null;
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
export interface OtpReq {
  Otp: string | number;
  UserName: string | number;
  isEmail: boolean;
  userId: string | number;
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
export interface VerifyRequest {
  phoneNumber: string | number;

}

export class CompanyService extends BaseService<CompanyService> {
  protected defaultClient = coreCommerceClient;


  /**
   * Resolve userId and companyId from params or from stored JWT token.
   * Throws an Error when ids cannot be resolved.
   */
  private async resolveUserAndCompany(params: {
    userId?: unknown;
    companyId?: unknown;
  }): Promise<{ userId: number; companyId: number }> {
    // prefer provided values, fall back to token
    let userId = params.userId as unknown;
    let companyId = params.companyId as unknown;

    if (!userId || !companyId) {
      // try to get a valid access token (refresh if needed)
      const accessToken = await AuthStorage.getValidAccessToken();
      if (accessToken) {
        try {
          const payload: any =
            JWTService.getInstance().decodeToken(accessToken);
          userId = userId ?? payload?.userId ?? payload?.id ?? payload?.sub;
          companyId = companyId ?? payload?.companyId;
        } catch { }
      }
    }

    if (
      userId === undefined ||
      userId === null ||
      companyId === undefined ||
      companyId === null
    ) {
      throw new Error(
        "Missing userId or companyId. Ensure user is authenticated."
      );
    }

    return {
      userId: Number(userId as unknown as string | number),
      companyId: Number(companyId as unknown as string | number),
    };
  }

  async getAllBranchesWithPagination(
    params: BranchPaginationParams
  ): Promise<BranchApiResponse> {
    const { offset, limit, searchString = "" } = params;

    const { userId, companyId } = await this.resolveUserAndCompany(params);

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
        const payload: any = jwtService.decodeToken(accessToken);
        companyId = payload?.companyId;
        if (!companyId) return null;
      } catch {
        return null;
      }
    }

    return (await this.call(
      `/companys/${companyId}`,
      undefined,
      "GET"
    )) as CompanyApiResponse;
  }

  async updateCompanyProfile(
    companyId: number,
    payload: Partial<CompanyApiResponse["data"]>
  ): Promise<CompanyApiResponse> {
    return (await this.call(
      `/companys/${companyId}`,
      payload,
      "PUT"
    )) as CompanyApiResponse;
  }
  async verfiy(params: { body: VerifyRequest }): Promise<unknown> {

    return this.callWith(
      `/user/sendVerificationPhoneNumber`,
      {
        phoneNumber: params?.body?.phoneNumber,

      },
      {
        method: "POST",
        client: authClient,
      }
    );
  }
  async verfiyOTp(params: { body: OtpReq }): Promise<unknown> {

    return this.callWith(
      `user/VerifyOtp`,
      {
        Otp: params?.body?.Otp,
        UserName: params?.body?.UserName,
        isEmail: params?.body?.isEmail,
        userId: params?.body?.userId

      },
      {
        method: "POST",
        client: authClient,
      }
    );
  }
  async getProfile(params?: {
    tenantId?: string;
    domain?: string;
  }): Promise<unknown> {
    const payload: {
      tenantId?: string;
      domain?: string;
    } = {};

    if (params?.tenantId) {
      payload.tenantId = params.tenantId;
    }

    if (params?.domain) {
      payload.domain = params.domain;
    }

    return this.callWith(
      `/user/me`,
      Object.keys(payload).length > 0 ? payload : undefined,
      {
        method: "GET",
        client: authClient,
      }
    );
  }
  async getUserPreference(params?: {
    userId?: string;
  }): Promise<unknown> {
    if (!params?.userId) {
      throw new Error("userId is required");
    }

    return this.callWith(
      `/userpreferences/findAllUserPreferences?userId=${params.userId}`,
      undefined,
      {
        method: "GET",
        client: coreCommerceClient,
      }
    );
  }

  async saveUserPreferences(params: {
    id?: number;
    tenantId?: number;
    userId: { id: number };
    vendorId?: number | null;
    dateFormat: string;
    timeFormat: string;
    timeZone: string;
  }): Promise<unknown> {
    return this.callWith(
      `/userpreferences/saveUserPreferences`,
      params,
      {
        method: "POST",
        client: coreCommerceClient,
      }
    );
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
    const { userId, companyId } = await this.resolveUserAndCompany(params);

    return (await this.call(
      `/branches/createBranch/${userId}?companyId=${companyId}`,
      params,
      "POST"
    )) as CreateBranchResponse;
  }
  async updateProfile(
    sub: number | string,
    params: UserProfile
  ): Promise<unknown> {
    return await this.callWith(
      `/user/UpdateUsers/${sub}`,
      params,
      {
        method: "PUT",
        client: authClient,
      }
    );
  }



  async updateBranchAddress(
    params: UpdateBranchRequest
  ): Promise<UpdateBranchResponse> {
    const { userId, companyId } = await this.resolveUserAndCompany(params);
    const addressId = params.addressId;

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
