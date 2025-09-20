// Anonymous Token Types
export interface AnonymousTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Tenant Configuration Types
export interface TenantInfo {
  tenantCode: string;
  elasticCode: string;
  tenantId: string;
  typeSenseKey: string;
  typeSenseCode: string;
}

export interface SellerCompany {
  id: string;
  name: string;
  // Add other company fields as needed
}

export interface SellerCurrency {
  id: string;
  code: string;
  symbol: string;
  name: string;
  // Add other currency fields as needed
}

export interface TenantConfigResponse {
  data: {
    tenant: TenantInfo;
    sellerCompanyId: SellerCompany;
    sellerCurrency: SellerCurrency;
  };
}

// StoreFront Configuration Types
export interface StoreFrontProperty {
  storeFrontProperty:
    | "HEADER"
    | "PRODUCTCARD"
    | "LOGIN"
    | "FOOTER"
    | "BANNER"
    | string;
  dataJson: string; // Stringified JSON
}

export interface StoreFrontResponse {
  data: {
    getAllByDomain: StoreFrontProperty[];
  };
}

export interface StoreFrontGraphQLRequest {
  query: string;
  variables: Record<string, unknown>;
}

// Category Types
export interface Category {
  sc_id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

export interface CategoriesResponse {
  data: Category[];
}

// Catalog Settings Types
export interface CatalogAssignment {
  _id: string;
  isCatalog: boolean;
  name?: string;
  description?: string;
}

export interface CatalogSettings {
  LimitCatalog: boolean;
  LimitEquipment: boolean;
  CatalogAssigned: CatalogAssignment[];
  EquipmentName: string;
}

export interface CatalogSettingsResponse {
  data: CatalogSettings;
}

// Config Cache Types
export interface ConfigCacheGetResponse {
  success: boolean;
  data: string; // Cached config as string
}

export interface ConfigCachePostResponse {
  success: boolean;
  message?: string;
}

export interface ConfigCacheRequest {
  domain: string;
  config: unknown; // The configuration data to cache
}

// Domain Configuration (combined from all APIs)
export interface DomainConfiguration {
  domain: string;
  accessToken: string;
  anonymousTokens?: AnonymousTokenResponse;
  tenantConfig: TenantConfigResponse["data"];
  storeFrontConfig: StoreFrontProperty[];
  categories: Category[];
  catalogSettings?: CatalogSettings;
  lastUpdated: string;
}

// Request Parameters
export interface GetTenantConfigParams {
  domainUrl: string;
}

export interface GetStoreFrontConfigParams {
  domain: string;
}

export interface GetCatalogSettingsParams {
  companyId: string;
}

// Error Types
export interface AppConfigError extends Error {
  code?: string;
  status?: number;
  domain?: string;
}
