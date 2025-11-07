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
  openSearchClient,
  storefrontClient,
  type ApiClientConfig,
  type ApiError,
  type RequestContext,
} from "./client";

// Import services
import AuthService from "./services/AuthService";
import BillingBranchService from "./services/BillingBranchService";
import CartService from "./services/CartService";
import CatalogService from "./services/CatalogService";
import CompanyService from "./services/CompanyService";
import DiscountService from "./services/DiscountService";
import ManufacturerCompetitorService from "./services/ManufacturerCompetitorService";
import StoreFrontService from "./services/StoreFrontService";
import TenantService from "./services/TenantService";
import UserService from "./services/UserService";

// Import SubIndustry service

// Import token management services
import { AuthTokenService } from "../services/AuthTokenService";
import RequestQueueService from "../services/RequestQueueService";
import TokenRefreshService from "../services/TokenRefreshService";

// Import dashboard services from the new location
import DashboardService from "./services/DashboardService";
import OpenSearchService from "./services/OpenSearchService";
import OrderDetailsService from "./services/OrderDetailsService";
import OrderNameService from "./services/OrderNameService";
import OrdersService from "./services/OrdersService";
import OrderStatusService from "./services/OrderStatusService";
import OrderVersionService from "./services/OrderVersionService";
import PaymentService from "./services/PaymentService";
import PreferenceService from "./services/PreferenceService";
import ProductAssetsService from "./services/ProductAssetsService";
import QuotationDetailsService from "./services/QuotationDetailsService";
import QuotationVersionService from "./services/QuotationVersionService";
import QuotesService from "./services/QuotesService";
import QuoteSubmissionService from "./services/QuoteSubmissionService";
import RequestEditService from "./services/RequestEditService";
import SearchService from "./services/SearchService";
import QuoteStatusService from "./services/StatusService";

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
  QuotationVersionService,
  QuotesService,
  QuoteStatusService,
  QuoteSubmissionService,
  RequestEditService,
  RequestQueueService,
  SearchService,
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

export type {
  BillingAddress,
  BillingBranchResponse,
} from "./services/BillingBranchService";
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
  DbProductDetail,
  FetchOrderDetailsParams,
  OrderDetailItem,
  OrderDetailsData,
  OrderDetailsResponse,
} from "./services/OrderDetailsService";

export type {
  UpdateOrderNameRequest,
  UpdateOrderNameResponse,
} from "./services/OrderNameService";

export type {
  RequestEditParams,
  RequestEditResponse,
} from "./services/RequestEditService";

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

export type {
  PreferenceModule,
  UserPreference,
} from "./services/PreferenceService";

export type {
  ProductAsset,
  ProductAssetsResponse,
} from "./services/ProductAssetsService";

export type {
  ElasticSearchOptions,
  ElasticSearchQuery,
  FormattedProduct,
  SearchProductsResponse,
} from "./services/SearchService";

export type {
  CheckVolumeDiscountEnabledResponse,
  Discount,
  DiscountApiResponse,
  DiscountItem,
  DiscountRequest,
} from "./services/DiscountService";

export type {
  CompetitorDetail,
  FetchCompetitorsRequest,
  FetchCompetitorsResponse,
} from "./services/ManufacturerCompetitorService";

// Update product detail types export
export type {
  CatalogCode,
  HsnTaxBreakup,
  InventoryInfo,
  PriceListCode,
  ProductAccessory,
  // Remove duplicate: ProductAsset (already from ProductAssetsService)
  ProductAttribute,
  ProductCategory,
  ProductDetail,
  ProductDetailResponse,
  ProductSpecification,
  TaxGroup,
  TaxRequirement,
} from "@/types/product/product-detail";

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
  FetchQuotationDetailsRequest,
  QuotationData,
  QuotationDetail,
  QuotationDetailsResponse,
  QuotationProductDetail,
} from "./services/QuotationDetailsService";

export type {
  CreateQuotationVersionRequest,
  CreateQuotationVersionResponse,
} from "./services/QuotationVersionService";

export type {
  QuoteStatusApiResponse,
  QuoteStatusParams,
  QuoteStatusResponse,
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

export type {
  QuoteSubmissionPayload,
  QuoteSubmissionRequest,
  QuoteSubmissionResponse,
} from "./services/QuoteSubmissionService";

// Convenience re-exports for common patterns
export const API = {
  Auth: AuthService,
  Cart: CartService,
  Catalog: CatalogService,
  Company: CompanyService,
  Dashboard: DashboardService,
  Discount: DiscountService,
  OrderDetails: OrderDetailsService,
  OrderName: OrderNameService,
  Orders: OrdersService,
  OrderStatus: OrderStatusService,
  OrderVersion: OrderVersionService,
  Payment: PaymentService,
  Preference: PreferenceService,
  ProductAssets: ProductAssetsService,
  Quotes: QuotesService,
  QuoteStatus: QuoteStatusService,
  QuoteSubmission: QuoteSubmissionService,
  RequestEdit: RequestEditService,
  Search: SearchService,
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
