// User-related TypeScript interfaces
export interface UserDetails {
  userId: number;
  userCode: string;
  email: string;
  displayName: string;
  picture: string;
  companyId: number;
  companyName: string;
  companyLogo: string;
  currency: {
    currencyCode: string;
    symbol: string;
    precision: number;
    decimal: string;
    thousand: string;
  };
  roleId: number;
  roleName: string;
  tenantId: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  isUserActive: number;
  verified: boolean;
  seller: boolean;
  lastLoginAt: string;
  listAccessElements: string[];
}

export interface UserApiResponse {
  data: UserDetails;
  message: string;
  status: "success" | "error";
}

export interface JWTPayload {
  sub: string; // User ID
  iss: string; // Tenant ID
  userId: number;
  tenantId: string;
  email: string;
  displayName: string;
  companyId: number;
  roleId: number;
  roleName: string;
  exp: number;
  iat: number;
}
