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
    type RequestContext
} from "./client";

// Import services
import AuthService from "./services/AuthService";
import CartService from "./services/CartService/CartService";
import CatalogService from "./services/CatalogService";
import CompanyService from "./services/CompanyService";
import DiscountService from "./services/DiscountService/DiscountService";
import OpenSearchService from "./services/OpenSearchService/OpenSearchService";
import StoreFrontService from "./services/StoreFrontService";
import TenantService from "./services/TenantService";
import UserService from "./services/UserService";

// Import SubIndustry service
import SubIndustryService from "./services/SubIndustryService/SubIndustryService";

// Import Location service
import LocationService from "./services/LocationService/LocationService";

// Import token management services
import { AuthTokenService } from "../services/AuthTokenService";
import RequestQueueService from "../services/RequestQueueService";
import TokenRefreshService from "../services/TokenRefreshService";

// Import dashboard services from the new location
import DashboardService from "./services/DashboardService/DashboardService";
import OrdersService from "./services/OrdersService/OrdersService";
import OrderStatusService from "./services/OrderStatusService/OrderStatusService";
import PreferenceService from "./services/PreferenceService/PreferenceService";
import QuotesService from "./services/QuotesService/QuotesService";
import QuoteStatusService from "./services/StatusService/StatusService";

// Import additional services
import AccountOwnerService from "./services/AccountOwnerService/AccountOwnerService";
import BillingBranchService from "./services/BillingBranchService/BillingBranchService";
import CurrencyService from "./services/CurrencyService/CurrencyService";
import ManufacturerCompetitorService from "./services/ManufacturerCompetitorService/ManufacturerCompetitorService";
import OrderDetailsService from "./services/OrderDetailsService/OrderDetailsService";
import OrderNameService from "./services/OrderNameService/OrderNameService";
import OrdersFilterService from "./services/OrdersFilterService/OrdersFilterService";
import OrderVersionService from "./services/OrderVersionService/OrderVersionService";
import PaymentService from "./services/PaymentService/PaymentService";
import ProductAssetsService from "./services/ProductAssetsService/ProductAssetsService";
import ProductListService from "./services/ProductListService/ProductListService";
import { ProductPageService } from "./services/ProductPageService";
import QuotationDetailsService from "./services/QuotationDetailsService/QuotationDetailsService";
import QuotationNameService from "./services/QuotationNameService/QuotationNameService";
import QuotationVersionService from "./services/QuotationVersionService/QuotationVersionService";
import QuoteSubmissionService from "./services/QuoteSubmissionService/QuoteSubmissionService";
import RequestEditService from "./services/RequestEditService/RequestEditService";
import SalesService from "./services/SalesService/SalesService";
import SearchService from "./services/SearchService/SearchService";
import SellerWarehouseService from "./services/SellerWarehouseService/SellerWarehouseService";
import UploadService from "./services/UploadService/UploadService";

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
    ProductListService,
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
    UserService
};

// Export service types
    export type {
        LoginRequest,
        LoginResponse,
        RefreshTokenResponse
    } from "./services/AuthService";

export type { TenantInfo } from "./services/TenantService";

export type {
    CompanyDetails,
    UserDetails,
    UserProfile
} from "./services/UserService";

export type {
    CatalogSettings,
    Category,
    ProductSearchOptions
} from "./services/CatalogService";

export type {
    GraphQLQuery,
    GraphQLResponse,
    StoreFrontConfig
} from "./services/StoreFrontService";

export type {
    Cart,
    CartCount,
    CartParams
} from "./services/CartService/CartService";

// Export dashboard service types
export type {
    DashboardApiResponse,
    DashboardFilterParams,
    TopPerformerItem
} from "@/types/dashboard";

export type {
    FilterColumn,
    OrderFilter,
    OrdersFilterParams
} from "./services/OrdersFilterService/OrdersFilterService";
export type { OrdersParams } from "./services/OrdersService/OrdersService";
export type {
    ElasticSearchOptions,
    ElasticSearchQuery,
    FormattedProduct,
    SearchProductsResponse
} from "./services/SearchService/SearchService";

export type {
    OrderStatusResponse,
    StatusOption
} from "./services/OrderStatusService/OrderStatusService";

export type {
    PreferenceModule,
    UserPreference
} from "./services/PreferenceService/PreferenceService";

export type {
    CheckVolumeDiscountEnabledResponse,
    Discount,
    DiscountApiResponse,
    DiscountItem,
    DiscountRequest,
    VolumeDiscountRequest,
    VolumeDiscountRequestItem,
    VolumeDiscountResponse
} from "./services/DiscountService/DiscountService";

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
    ZoneInfo
} from "./services/CompanyService";

// Export LocationService types
export type {
    CountryData as LocationCountryData,
    DistrictData as LocationDistrictData,
    LocationResponse,
    StateData as LocationStateData
} from "./services/LocationService/LocationService";

export type {
    ApprovalGroup,
    CurrencySymbol,
    QuoteItem,
    QuotesApiResponse,
    QuotesQueryParams,
    QuotesRequestBody,
    QuotesResponseData,
    QuoteUser
} from "./services/QuotesService/QuotesService";

export type {
    QuoteStatusApiResponse,
    QuoteStatusParams,
    QuoteStatusResponse
} from "./services/StatusService/StatusService";

// Export BillingBranchService types
export type {
    BillingAddress,
    BillingBranchResponse
} from "./services/BillingBranchService/BillingBranchService";

// Export ProductAssetsService types
export type {
    ProductAsset,
    ProductAssetsResponse
} from "./services/ProductAssetsService/ProductAssetsService";

// Export OrderDetailsService types
export type {
    DbProductDetail,
    FetchOrderDetailsParams,
    OrderDetailItem,
    OrderDetailsData,
    OrderDetailsResponse
} from "./services/OrderDetailsService/OrderDetailsService";

// Export ManufacturerCompetitorService types
export type {
    CompetitorDetail,
    FetchCompetitorsRequest,
    FetchCompetitorsResponse
} from "./services/ManufacturerCompetitorService/ManufacturerCompetitorService";

// Export PaymentService types
export type {
    OverallPaymentsResponse,
    PaymentDueBreakup,
    PaymentDueDataItem,
    PaymentDueOrderData,
    PaymentDueResponse,
    PaymentHistoryItem,
    PaymentTerm,
    PaymentTermsResponse
} from "./services/PaymentService/PaymentService";

// Export OrderNameService types
export type {
    UpdateOrderNameRequest,
    UpdateOrderNameResponse
} from "./services/OrderNameService/OrderNameService";

// Export OrderVersionService types
export type {
    CreateOrderVersionRequest,
    CreateOrderVersionResponse
} from "./services/OrderVersionService/OrderVersionService";

// Export RequestEditService types
export type {
    RequestEditParams,
    RequestEditResponse
} from "./services/RequestEditService/RequestEditService";

// Export QuotationDetailsService types
export type {
    FetchQuotationDetailsRequest,
    QuotationData,
    QuotationDetail,
    QuotationDetailsResponse,
    QuotationProductDetail
} from "./services/QuotationDetailsService/QuotationDetailsService";

// Export QuotationNameService types
export type {
    UpdateQuotationNameRequest,
    UpdateQuotationNameResponse
} from "./services/QuotationNameService/QuotationNameService";

// Export QuotationVersionService types
export type {
    CreateQuotationVersionRequest,
    CreateQuotationVersionResponse
} from "./services/QuotationVersionService/QuotationVersionService";

// Export QuoteSubmissionService types
export type {
    QuoteSubmissionPayload,
    QuoteSubmissionRequest,
    QuoteSubmissionResponse
} from "./services/QuoteSubmissionService/QuoteSubmissionService";

// Export SellerWarehouseService types
export type {
    FindSellerBranchRequest,
    FindWarehouseRequest,
    SellerBranch,
    Warehouse as SellerWarehouse
} from "./services/SellerWarehouseService/SellerWarehouseService";

// Export token management service types
export type {
    QueuedRequest,
    RefreshTokenResult
} from "../services/TokenRefreshService";

export type {
    EnhancedQueuedRequest,
    QueuedRequestOptions
} from "../services/RequestQueueService";

// Export utility functions
export {
    getCommonApiHeaders,
    getOriginHeader,
    getTenantApiHeaders
} from "../utils/originUtils";

export type {
    OrdersApiResponse,
    OrdersRequestParams,
    OrdersResponse
} from "./services/Dasboard/DashboardOrdersTable";

// Export order utility functions and types
export {
    checkIsBundleProduct,
    formBundleProductsPayload,
    orderPaymentDTO,
    quoteSubmitDTO,
    validatePlaceOrder,
    type PlaceOrderValidation
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
