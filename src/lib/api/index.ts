// Main API export file - provides easy access to all services and clients

// Export clients
export {
  apiClient,
  authClient,
  homePageClient,
  storefrontClient,
  catalogClient,
  coreCommerceClient,
  createClientWithContext,
  ApiClientError,
  type ApiClientConfig,
  type ApiError,
  type RequestContext,
} from "./client";

// Import services
import AuthService from "./services/AuthService";
import TenantService from "./services/TenantService";
import UserService from "./services/UserService";
import CatalogService from "./services/CatalogService";
import StoreFrontService from "./services/StoreFrontService";
import CartService from "./services/CartService";
import DashboardOrdersTableService from "./services/Dasboard/DashboardOrdersTable";

// Export services
export {
  AuthService,
  TenantService,
  UserService,
  CatalogService,
  StoreFrontService,
  CartService,
  DashboardOrdersTableService,
};

// Export service types
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "./services/AuthService";

export type { TenantInfo } from "./services/TenantService";

export type {
  UserDetails,
  CompanyDetails,
  UserProfile,
} from "./services/UserService";

export type {
  Category,
  CatalogSettings,
  ProductSearchOptions,
} from "./services/CatalogService";

export type {
  StoreFrontConfig,
  GraphQLQuery,
  GraphQLResponse,
} from "./services/StoreFrontService";

export type { Cart } from "./services/CartService";

export type {
  OrdersResponse,
  OrdersApiResponse,
  OrdersRequestParams,
} from "./services/Dasboard/DashboardOrdersTable";

// Convenience re-exports for common patterns
export const API = {
  Auth: AuthService,
  Tenant: TenantService,
  User: UserService,
  Catalog: CatalogService,
  StoreFront: StoreFrontService,
  Cart: CartService,
  DashboardOrders: DashboardOrdersTableService,
} as const;

// Default export for easy importing
export default API;
