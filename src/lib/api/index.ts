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
import OpenSearchService from "./services/OpenSearchService";
import StoreFrontService from "./services/StoreFrontService";
import TenantService from "./services/TenantService";
import UserService from "./services/UserService";

// Import SubIndustry service
import SubIndustryService from "./services/SubIndustryService";

// Import Location service
import LocationService from "./services/LocationService";

// Import token management services
import { AuthTokenService } from "../services/AuthTokenService";
import RequestQueueService from "../services/RequestQueueService";
import TokenRefreshService from "../services/TokenRefreshService";

// Import dashboard services from the new location
import DashboardService from "./services/DashboardService";
import OrdersService from "./services/OrdersService";
import OrderStatusService from "./services/OrderStatusService";
import PreferenceService from "./services/PreferenceService";
import QuotesService from "./services/QuotesService";
import QuoteStatusService from "./services/StatusService";

// Import additional services
import BillingBranchService from "./services/BillingBranchService";
import ManufacturerCompetitorService from "./services/ManufacturerCompetitorService";
import OrderDetailsService from "./services/OrderDetailsService";
import OrderNameService from "./services/OrderNameService";
import OrderVersionService from "./services/OrderVersionService";
import PaymentService from "./services/PaymentService";
import ProductAssetsService from "./services/ProductAssetsService";
import QuotationDetailsService from "./services/QuotationDetailsService";
import QuotationNameService from "./services/QuotationNameService";
import QuotationVersionService from "./services/QuotationVersionService";
import QuoteSubmissionService from "./services/QuoteSubmissionService";
import RequestEditService from "./services/RequestEditService";
import SellerWarehouseService from "./services/SellerWarehouseService";

// Export services
export {
  AuthService,
  AuthTokenService,
  BillingBranchService,
  CartService,
  CatalogService,
  CompanyService,
  DashboardService,
  DiscountService,
  LocationService,
  ManufacturerCompetitorService,
  OpenSearchService,
  OrderDetailsService,
  OrderNameService,
  OrdersService,
  OrderStatusService,
  OrderVersionService,
  PaymentService,
  PreferenceService,
  ProductAssetsService,
  QuotationDetailsService,
  QuotationNameService,
  QuotationVersionService,
  QuotesService,
  QuoteStatusService,
  QuoteSubmissionService,
  RequestEditService,
  RequestQueueService,
  SellerWarehouseService,
  StoreFrontService,
  SubIndustryService,
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
  getSubIndustrysbyid,
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
} from "./services/CompanyService";

// Export LocationService types
export type {
  CountryData as LocationCountryData,
  DistrictData as LocationDistrictData,
  LocationResponse,
  StateData as LocationStateData,
} from "./services/LocationService";

export type {
  ApprovalGroup,
  CurrencySymbol,
  QuoteItem,
  QuotesApiResponse,
  QuotesQueryParams,
  QuotesRequestBody,
  QuotesResponseData,
  QuoteUser,
} from "./services/QuotesService";

export type {
  QuoteStatusApiResponse,
  QuoteStatusParams,
  QuoteStatusResponse,
} from "./services/StatusService";

// Export BillingBranchService types
export type {
  BillingAddress,
  BillingBranchResponse,
} from "./services/BillingBranchService";

// Export ProductAssetsService types
export type {
  ProductAsset,
  ProductAssetsResponse,
} from "./services/ProductAssetsService";

// Export OrderDetailsService types
export type {
  DbProductDetail,
  FetchOrderDetailsParams,
  OrderDetailItem,
  OrderDetailsData,
  OrderDetailsResponse,
} from "./services/OrderDetailsService";

// Export ManufacturerCompetitorService types
export type {
  CompetitorDetail,
  FetchCompetitorsRequest,
  FetchCompetitorsResponse,
} from "./services/ManufacturerCompetitorService";

// Export PaymentService types
export type {
  OverallPaymentsResponse,
  PaymentDueBreakup,
  PaymentDueDataItem,
  PaymentDueOrderData,
  PaymentDueResponse,
  PaymentHistoryItem,
  PaymentTerm,
  PaymentTermsResponse,
} from "./services/PaymentService";

// Export OrderNameService types
export type {
  UpdateOrderNameRequest,
  UpdateOrderNameResponse,
} from "./services/OrderNameService";

// Export OrderVersionService types
export type {
  CreateOrderVersionRequest,
  CreateOrderVersionResponse,
} from "./services/OrderVersionService";

// Export RequestEditService types
export type {
  RequestEditParams,
  RequestEditResponse,
} from "./services/RequestEditService";

// Export QuotationDetailsService types
export type {
  FetchQuotationDetailsRequest,
  QuotationData,
  QuotationDetail,
  QuotationDetailsResponse,
  QuotationProductDetail,
} from "./services/QuotationDetailsService";

// Export QuotationNameService types
export type {
  UpdateQuotationNameRequest,
  UpdateQuotationNameResponse,
} from "./services/QuotationNameService";

// Export QuotationVersionService types
export type {
  CreateQuotationVersionRequest,
  CreateQuotationVersionResponse,
} from "./services/QuotationVersionService";

// Export QuoteSubmissionService types
export type {
  QuoteSubmissionPayload,
  QuoteSubmissionRequest,
  QuoteSubmissionResponse,
} from "./services/QuoteSubmissionService";

// Export SellerWarehouseService types
export type {
  FindSellerBranchRequest,
  FindWarehouseRequest,
  SellerBranch,
  Warehouse as SellerWarehouse,
} from "./services/SellerWarehouseService";

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
  OrderStatus: OrderStatusService,
  OpenSearch: OpenSearchService,
  Preference: PreferenceService,
  Quotes: QuotesService,
  QuoteStatus: QuoteStatusService,
  StoreFront: StoreFrontService,
  Tenant: TenantService,
  User: UserService,
  SubIndustry: SubIndustryService,
  // Token management services
  TokenRefresh: TokenRefreshService,
  RequestQueue: RequestQueueService,
  AuthToken: AuthTokenService.getInstance(),
} as const;

// Default export for easy importing
export default API;
