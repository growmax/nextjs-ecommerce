// Main API export file - provides easy access to all services and clients

// Export clients
export {
  apiClient,
  ApiClientError,
  authClient,
  catalogClient,
  coreCommerceClient,
  createClientWithContext,
  homePageClient,
  storefrontClient,
  type ApiClientConfig,
  type ApiError,
  type RequestContext,
} from "./client";

// Import services
import AuthService from "./services/AuthService";
import CartService from "./services/CartService";
import CatalogService from "./services/CatalogService";
import CompanyService from "./services/CompanyService";
import DiscountService from "./services/DiscountService";
import StoreFrontService from "./services/StoreFrontService";
import TenantService from "./services/TenantService";
import UserService from "./services/UserService";

// Import token management services
import { AuthTokenService } from "../services/AuthTokenService";
import RequestQueueService from "../services/RequestQueueService";
import TokenRefreshService from "../services/TokenRefreshService";

// Import dashboard services from the new location
import DashboardService from "./services/DashboardService";
import OrdersService from "./services/OrdersService";
import PreferenceService from "./services/PreferenceService";
import UserPreferenceService from "./services/UserPreferenceService";

// Export services
export {
  AuthService,
  AuthTokenService,
  CartService,
  CatalogService,
  CompanyService,
  DashboardService,
  DiscountService,
  OrdersService,
  PreferenceService,
  RequestQueueService,
  StoreFrontService,
  TenantService,
  TokenRefreshService,
  UserPreferenceService,
  UserService,
};

// Export service types
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "./services/AuthService";

export type { TenantInfo } from "./services/TenantService";

export type {
  CompanyDetails,
  UserDetails,
  UserProfile,
} from "./services/UserService";

export type {
  CatalogSettings,
  Category,
  ProductSearchOptions,
} from "./services/CatalogService";

export type {
  GraphQLQuery,
  GraphQLResponse,
  StoreFrontConfig,
} from "./services/StoreFrontService";

export type { Cart, CartCount, CartParams } from "./services/CartService";

// Export dashboard service types
export type {
  DashboardApiResponse,
  DashboardFilterParams,
  TopPerformerItem,
} from "@/types/dashboard";

export type { OrdersParams } from "./services/OrdersService";

export type {
  PreferenceModule,
  UserPreference,
} from "./services/PreferenceService";

export type {
  PreferenceApiResponse,
  PreferenceFilter,
  PreferenceQueryParams,
  UserPreference as UserPreferenceType,
} from "./services/UserPreferenceService";

export type {
  Discount,
  DiscountItem,
  DiscountApiResponse,
  DiscountRequest,
} from "./services/DiscountService";

// Export CompanyService types
export type {
  BranchAddress,
  Zone,
  Branch,
  BranchApiResponse,
  CompanyApiResponse,
  DeleteAddressResponse,
  Industry,
  getSubIndustrysbyid,
  SubIndustryApiResponse,
  BranchPaginationParams,
  DeleteBranchParams,
  CreateBranchRequest,
  CreateBranchResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  CountryData,
  StateData,
  DistrictData,
  AddressData,
  Warehouse,
  BusinessUnit,
  ZoneInfo,
  DashboardRequest,
  DashboardQueryParams,
  OrderGraphItem,
  QuoteGraphItem,
  QuoteStatusGraphItem,
  TopDataItem,
  DashboardData,
  DashboardResponse,
} from "./services/CompanyService";

// Export token management service types
export type {
  QueuedRequest,
  RefreshTokenResult,
} from "../services/TokenRefreshService";

export type {
  EnhancedQueuedRequest,
  QueuedRequestOptions,
} from "../services/RequestQueueService";

// Export utility functions
export {
  getCommonApiHeaders,
  getOriginHeader,
  getTenantApiHeaders,
} from "../utils/originUtils";

export type {
  OrdersApiResponse,
  OrdersRequestParams,
  OrdersResponse,
} from "./services/Dasboard/DashboardOrdersTable";

// Convenience re-exports for common patterns
export const API = {
  Auth: AuthService,
  Cart: CartService,
  Catalog: CatalogService,
  Company: CompanyService,
  Dashboard: DashboardService,
  Discount: DiscountService,
  Orders: OrdersService,
  Preference: PreferenceService,
  StoreFront: StoreFrontService,
  Tenant: TenantService,
  User: UserService,
  UserPreference: UserPreferenceService,
  // Token management services
  TokenRefresh: TokenRefreshService,
  RequestQueue: RequestQueueService,
  AuthToken: AuthTokenService.getInstance(),
} as const;

// Default export for easy importing
export default API;
