export interface Currency {
  id: number;
  currencyCode: string;
  symbol: string;
  decimal: string;
  thousand: string;
  precision: number;
  description: string;
  tenantId: number;
}

export interface BusinessType {
  id: number;
  name: string;
  tenantId: number;
}

export interface AccountType {
  id: number;
  name: string;
}

export interface Industry {
  id: number;
  name: string;
  tenantId: number;
}

export interface SubIndustry {
  id: number;
  name: string;
  description: string;
  tenantId: number;
  industryId: Industry;
}

export interface TaxDetails {
  id: number;
  pan: string;
  panImage: string | null;
  tenantId: number;
}

export interface AddressInfo {
  id: number;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  pinCodeId: string;
  district: string;
  locality: string;
  branchName: string;
  gst: string;
  phone: string | null;
  mobileNo: string;
  email: string | null;
  lattitude: string | null;
  longitude: string | null;
  locationUrl: string | null;
  regAddress: boolean;
  isBilling: boolean;
  isShipping: boolean;
  wareHouse: boolean;
  isCustAddress: boolean;
  primaryContact: string | null;
  nationalMobileNum: string | null;
  billToCode: string | null;
  shipToCode: string | null;
  soldToCode: string | null;
  vendorID: string | null;
  vendorId: string | null;
  tenantId: number;
}

export interface Company {
  id: number;
  name: string;
  logo: string;
  companyIdentifier: string;
  defaultEmail: string;
  reportEmail: string;
  inventoryEmail: string;
  website: string;
  tenantId: number;
  vendorId: number | null;
  verified: boolean;
  activated: boolean;
  profileAccess: boolean;
  taxExempted: boolean;
  bnplEnabled: boolean;
  bnplPhone: string | null;
  bnplCustomerId: string | null;
  inviteAccess: string | null;
  addressId: AddressInfo | null;
  taxExemptionId: string | null;
  finStartDate: string | null;
  finEndDate: string | null;
  finStartMonth: string | null;
  financialYear: string | null;
  accountTypeId: AccountType;
  businessTypeId: BusinessType;
  currencyId: Currency;
  subIndustryId: SubIndustry;
  taxDetailsId: TaxDetails;
}

export interface Tenant {
  id: number;
  tenantCode: string;
  tenantDescription: string;
  tenantDomain: string;
  elasticCode: string;
  typeSenseCode: string;
  typeSenseKey: string | null;
  assertS3BucketName: string;
  apikey: string | null;
  enablePartnerToPartnerPurchase: boolean;
  plainId: string;
  SSLCreated: boolean;
  sslCreatedDate: string | null;
  checkSSL: boolean;
  domainNameVerified: boolean;
  demoRequired: boolean;
  finalCompleted: boolean;
  initCompleted: boolean;
  otherInitdataCompleted: boolean;
  tenantId: number;
}

export interface TenantApiResponse {
  data: {
    sellerCompanyId: Company;
    sellerCurrency: Currency;
    tenant: Tenant;
  };
  message: string | null;
  status: string;
}

export interface TenantContextData {
  company: Company | null;
  currency: Currency | null;
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}
