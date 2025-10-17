// Main API export file - provides easy access to all services and clients

// Export clients
export {
  ApiClientError,
  apiClient,
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
import OrderDetailsService from "./services/OrderDetailsService";
import OrdersService from "./services/OrdersService";
import OrderStatusService from "./services/OrderStatusService";
import PreferenceService from "./services/PreferenceService";
import QuotesService from "./services/QuotesService";
import QuoteStatusService from "./services/StatusService";

// Export services
export {
  AuthService,
  AuthTokenService,
  CartService,
  CatalogService,
  CompanyService,
  DashboardService,
  DiscountService,
  OrderDetailsService,
  OrdersService,
  OrderStatusService,
  PreferenceService,
  QuoteStatusService,
  QuotesService,
  RequestQueueService,
  StoreFrontService,
  TenantService,
  TokenRefreshService,
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
  OrderStatusResponse,
  StatusOption,
} from "./services/OrderStatusService";

export type {
  FetchOrderDetailsParams,
  OrderDetailItem,
  OrderDetailsData,
  OrderDetailsResponse,
} from "./services/OrderDetailsService";

export type {
  PreferenceModule,
  UserPreference,
} from "./services/PreferenceService";

export type {
  Discount,
  DiscountApiResponse,
  DiscountItem,
  DiscountRequest,
} from "./services/DiscountService";

// Export CompanyService types
export type {
  AddressData,
  Branch,
  BranchAddress,
  BranchApiResponse,
  BranchPaginationParams,
  BusinessUnit,
  CompanyApiResponse,
  CountryData,
  CreateBranchRequest,
  CreateBranchResponse,
  DashboardData,
  DashboardQueryParams,
  DashboardRequest,
  DashboardResponse,
  DeleteAddressResponse,
  DeleteBranchParams,
  DistrictData,
  Industry,
  OrderGraphItem,
  QuoteGraphItem,
  QuoteStatusGraphItem,
  StateData,
  SubIndustryApiResponse,
  TopDataItem,
  UpdateBranchRequest,
  UpdateBranchResponse,
  Warehouse,
  Zone,
  ZoneInfo,
  getSubIndustrysbyid,
} from "./services/CompanyService";

export type {
  ApprovalGroup,
  CurrencySymbol,
  QuoteItem,
  QuoteUser,
  QuotesApiResponse,
  QuotesQueryParams,
  QuotesRequestBody,
  QuotesResponseData,
} from "./services/QuotesService";

export type {
  QuoteStatusApiResponse,
  QuoteStatusResponse,
  QuoteStatusParams,
} from "./services/StatusService";

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
  OrderDetails: OrderDetailsService,
  Orders: OrdersService,
  OrderStatus: OrderStatusService,
  Preference: PreferenceService,
  Quotes: QuotesService,
  QuoteStatus: QuoteStatusService,
  StoreFront: StoreFrontService,
  Tenant: TenantService,
  User: UserService,
  // Token management services
  TokenRefresh: TokenRefreshService,
  RequestQueue: RequestQueueService,
  AuthToken: AuthTokenService.getInstance(),
} as const;

// Default export for easy importing
export default API;
