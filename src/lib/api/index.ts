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
} from "@/lib/api/client";

// Import services
import AuthService from "@/lib/api/services/AuthService";
import CartService from "@/lib/api/services/CartService/CartService";
import CatalogService from "@/lib/api/services/CatalogService";
import CompanyService from "@/lib/api/services/CompanyService";
import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import OpenSearchService from "@/lib/api/services/OpenSearchService/OpenSearchService";
import StoreFrontService from "@/lib/api/services/StoreFrontService";
import TenantService from "@/lib/api/services/TenantService";
import UserService from "@/lib/api/services/UserService";

// Import SubIndustry service
import SubIndustryService from "@/lib/api/services/SubIndustryService/SubIndustryService";

// Import Location service
import LocationService from "@/lib/api/services/LocationService/LocationService";

// Import token management services
import { AuthTokenService } from "@/lib/services/AuthTokenService";
import RequestQueueService from "@/lib/services/RequestQueueService";
import TokenRefreshService from "@/lib/services/TokenRefreshService";

// Import dashboard services from the new location
import DashboardService from "@/lib/api/services/DashboardService/DashboardService";
import OrdersService from "@/lib/api/services/OrdersService/OrdersService";
import OrderStatusService from "@/lib/api/services/OrderStatusService/OrderStatusService";
import PreferenceService from "@/lib/api/services/PreferenceService/PreferenceService";
import QuotesService from "@/lib/api/services/QuotesService/QuotesService";
import QuoteStatusService from "@/lib/api/services/StatusService/StatusService";

// Import additional services
import AccountOwnerService from "@/lib/api/services/AccountOwnerService/AccountOwnerService";
import BillingBranchService from "@/lib/api/services/BillingBranchService/BillingBranchService";
import CurrencyService from "@/lib/api/services/CurrencyService/CurrencyService";
import ManufacturerCompetitorService from "@/lib/api/services/ManufacturerCompetitorService/ManufacturerCompetitorService";
import OrderDetailsService from "@/lib/api/services/OrderDetailsService/OrderDetailsService";
import OrderNameService from "@/lib/api/services/OrderNameService/OrderNameService";
import OrdersFilterService from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
import OrderVersionService from "@/lib/api/services/OrderVersionService/OrderVersionService";
import PaymentService from "@/lib/api/services/PaymentService/PaymentService";
import ProductAssetsService from "@/lib/api/services/ProductAssetsService/ProductAssetsService";
import { ProductPageService } from "@/lib/api/services/ProductPageService";
import QuotationDetailsService from "@/lib/api/services/QuotationDetailsService/QuotationDetailsService";
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";
import QuotationVersionService from "@/lib/api/services/QuotationVersionService/QuotationVersionService";
import QuoteSubmissionService from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";
import RequestEditService from "@/lib/api/services/RequestEditService/RequestEditService";
import SalesService from "@/lib/api/services/SalesService/SalesService";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import SellerWarehouseService from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";
import UploadService from "@/lib/api/services/UploadService/UploadService";

// Export services
export {
  AccountOwnerService,
  AuthService,
  AuthTokenService,
  BillingBranchService,
  CartService,
  CatalogService,
  CompanyService,
  CurrencyService,
  DashboardService,
  DiscountService,
  LocationService,
  ManufacturerCompetitorService,
  OpenSearchService,
  OrderDetailsService,
  OrderNameService,
  OrdersFilterService,
  OrdersService,
  OrderStatusService,
  OrderVersionService,
  PaymentService,
  PreferenceService,
  ProductAssetsService,
  ProductPageService,
  QuotationDetailsService,
  QuotationNameService,
  QuotationVersionService,
  QuotesService,
  QuoteStatusService,
  QuoteSubmissionService,
  RequestEditService,
  RequestQueueService,
  SalesService,
  SearchService,
  SellerWarehouseService,
  StoreFrontService,
  SubIndustryService,
  TenantService,
  TokenRefreshService,
  UploadService,
  UserService,
};

// Export service types
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/lib/api/services/AuthService";

export type { TenantInfo } from "@/lib/api/services/TenantService";

export type {
  CompanyDetails,
  UserDetails,
  UserProfile,
} from "@/lib/api/services/UserService";

export type {
  CatalogSettings,
  Category,
  ProductSearchOptions,
} from "@/lib/api/services/CatalogService";

export type {
  GraphQLQuery,
  GraphQLResponse,
  StoreFrontConfig,
} from "@/lib/api/services/StoreFrontService";

export type {
  Cart,
  CartCount,
  CartParams,
} from "@/lib/api/services/CartService/CartService";

// Export dashboard service types
export type {
  DashboardApiResponse,
  DashboardFilterParams,
  TopPerformerItem,
} from "@/types/dashboard";

export type {
  FilterColumn,
  OrderFilter,
  OrdersFilterParams,
} from "@/lib/api/services/OrdersFilterService/OrdersFilterService";
export type { OrdersParams } from "@/lib/api/services/OrdersService/OrdersService";
export type {
  ElasticSearchOptions,
  ElasticSearchQuery,
  FormattedProduct,
  SearchProductsResponse,
} from "@/lib/api/services/SearchService/SearchService";

export type {
  OrderStatusResponse,
  StatusOption,
} from "@/lib/api/services/OrderStatusService/OrderStatusService";

export type {
  PreferenceModule,
  UserPreference,
} from "@/lib/api/services/PreferenceService/PreferenceService";

export type {
  CheckVolumeDiscountEnabledResponse,
  Discount,
  DiscountApiResponse,
  DiscountItem,
  DiscountRequest,
  VolumeDiscountRequest,
  VolumeDiscountRequestItem,
  VolumeDiscountResponse,
} from "@/lib/api/services/DiscountService/DiscountService";

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
} from "@/lib/api/services/CompanyService";

// Export LocationService types
export type {
  CountryData as LocationCountryData,
  DistrictData as LocationDistrictData,
  LocationResponse,
  StateData as LocationStateData,
} from "@/lib/api/services/LocationService/LocationService";

export type {
  ApprovalGroup,
  CurrencySymbol,
  QuoteItem,
  QuotesApiResponse,
  QuotesQueryParams,
  QuotesRequestBody,
  QuotesResponseData,
  QuoteUser,
} from "@/lib/api/services/QuotesService/QuotesService";

export type {
  QuoteStatusApiResponse,
  QuoteStatusParams,
  QuoteStatusResponse,
} from "@/lib/api/services/StatusService/StatusService";

// Export BillingBranchService types
export type {
  BillingAddress,
  BillingBranchResponse,
} from "@/lib/api/services/BillingBranchService/BillingBranchService";

// Export ProductAssetsService types
export type {
  ProductAsset,
  ProductAssetsResponse,
} from "@/lib/api/services/ProductAssetsService/ProductAssetsService";

// Export OrderDetailsService types
export type {
  DbProductDetail,
  FetchOrderDetailsParams,
  OrderDetailItem,
  OrderDetailsData,
  OrderDetailsResponse,
} from "@/lib/api/services/OrderDetailsService/OrderDetailsService";

// Export ManufacturerCompetitorService types
export type {
  CompetitorDetail,
  FetchCompetitorsRequest,
  FetchCompetitorsResponse,
} from "@/lib/api/services/ManufacturerCompetitorService/ManufacturerCompetitorService";

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
} from "@/lib/api/services/PaymentService/PaymentService";

// Export OrderNameService types
export type {
  UpdateOrderNameRequest,
  UpdateOrderNameResponse,
} from "@/lib/api/services/OrderNameService/OrderNameService";

// Export OrderVersionService types
export type {
  CreateOrderVersionRequest,
  CreateOrderVersionResponse,
} from "@/lib/api/services/OrderVersionService/OrderVersionService";

// Export RequestEditService types
export type {
  RequestEditParams,
  RequestEditResponse,
} from "@/lib/api/services/RequestEditService/RequestEditService";

// Export QuotationDetailsService types
export type {
  FetchQuotationDetailsRequest,
  QuotationData,
  QuotationDetail,
  QuotationDetailsResponse,
  QuotationProductDetail,
} from "@/lib/api/services/QuotationDetailsService/QuotationDetailsService";

// Export QuotationNameService types
export type {
  UpdateQuotationNameRequest,
  UpdateQuotationNameResponse,
} from "@/lib/api/services/QuotationNameService/QuotationNameService";

// Export QuotationVersionService types
export type {
  CreateQuotationVersionRequest,
  CreateQuotationVersionResponse,
} from "@/lib/api/services/QuotationVersionService/QuotationVersionService";

// Export QuoteSubmissionService types
export type {
  QuoteSubmissionPayload,
  QuoteSubmissionRequest,
  QuoteSubmissionResponse,
} from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";

// Export SellerWarehouseService types
export type {
  FindSellerBranchRequest,
  FindWarehouseRequest,
  SellerBranch,
  Warehouse as SellerWarehouse,
} from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";

// Export token management service types
export type {
  QueuedRequest,
  RefreshTokenResult,
} from "@/lib/services/TokenRefreshService";

export type {
  EnhancedQueuedRequest,
  QueuedRequestOptions,
} from "@/lib/services/RequestQueueService";

// Export utility functions
export {
  getCommonApiHeaders,
  getOriginHeader,
  getTenantApiHeaders,
} from "@/lib/utils/originUtils";

export type {
  OrdersApiResponse,
  OrdersRequestParams,
  OrdersResponse,
} from "@/lib/api/services/Dasboard/DashboardOrdersTable";

// Export order utility functions and types
export {
  checkIsBundleProduct,
  formBundleProductsPayload,
  orderPaymentDTO,
  quoteSubmitDTO,
  validatePlaceOrder,
  type PlaceOrderValidation,
} from "@/utils/order/orderUtils/orderUtils";

// Convenience re-exports for common patterns
export const API = {
  AccountOwner: AccountOwnerService,
  Auth: AuthService,
  Cart: CartService,
  Catalog: CatalogService,
  Company: CompanyService,
  Currency: CurrencyService,
  Dashboard: DashboardService,
  Discount: DiscountService,
  Orders: OrdersService,
  OrderStatus: OrderStatusService,
  OpenSearch: OpenSearchService,
  Preference: PreferenceService,
  Quotes: QuotesService,
  QuoteStatus: QuoteStatusService,
  Sales: SalesService,
  StoreFront: StoreFrontService,
  Tenant: TenantService,
  Upload: UploadService,
  User: UserService,
  SubIndustry: SubIndustryService,
  // Token management services
  TokenRefresh: TokenRefreshService,
  RequestQueue: RequestQueueService,
  AuthToken: AuthTokenService.getInstance(),
} as const;

// Default export for easy importing
export default API;
