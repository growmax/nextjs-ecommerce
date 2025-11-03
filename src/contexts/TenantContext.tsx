"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  TenantContextData,
  Company,
  Currency,
  Tenant,
  TenantApiResponse,
} from "@/types/tenant";

/**
 * # Tenant Context Architecture
 *
 * This context manages multi-tenant data throughout the application.
 * Data is fetched server-side in the layout and made available globally.
 *
 * ## Data Flow
 * 1. Middleware extracts domain → sets tenant headers
 * 2. Layout fetches tenant data server-side → passes to TenantProvider
 * 3. TenantProvider stores data → components access via hooks
 *
 * ## Current Structure
 * - `tenant`: Basic tenant information (id, code, name, etc.)
 * - `company`: Company details (name, logo, contact info)
 * - `currency`: Currency settings (code, symbol, precision)
 *
 * ## Available via API but not exposed:
 * - `accountType`: Company account type
 * - `businessType`: Company business type
 * - `subIndustry`: Company sub-industry with nested `industry`
 * - `taxDetails`: Company tax information
 * - `address`: Company address (from company.addressId)
 *
 * ## Extending Data Structure
 *
 * When you need access to nested relations, add them here:
 *
 * ```typescript
 * interface TenantContextData {
 *   // ... existing fields
 *
 *   // Add new extracted fields
 *   accountType: AccountType | null;
 *   businessType: BusinessType | null;
 *   // ... etc
 * }
 * ```
 *
 * Then update the initialization logic in TenantProvider.
 *
 * ## Usage Examples
 *
 * ```typescript
 * // Get all tenant data
 * const tenantData = useTenant();
 *
 * // Get specific fields
 * const company = useTenantCompany();
 * const currency = useTenantCurrency();
 * const tenant = useTenantInfo();
 *
 * // Add new helper hooks as needed
 * export function useTenantAccountType() {
 *   const { company } = useTenant();
 *   return company?.accountTypeId || null;
 * }
 * ```
 */

const TenantContext = createContext<TenantContextData | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  initialData?: TenantApiResponse | null;
}

/**
 * TenantProvider Component
 *
 * Provides tenant data to the entire application tree.
 * Data is initialized from server-side props (from layout.tsx).
 *
 * @param children - Child components that need tenant data
 * @param initialData - Tenant data fetched server-side (null if failed)
 */
export function TenantProvider({ children, initialData }: TenantProviderProps) {
  // Initialize tenant data from server-side props
  const [tenantData] = useState<TenantContextData>(() => {
    if (initialData?.status === "success" && initialData.data) {
      return {
        company: initialData.data.sellerCompanyId,
        currency: initialData.data.sellerCurrency,
        tenant: initialData.data.tenant,
        isLoading: false,
        error: null,
      };
    }

    // If no initial data or error, set appropriate state
    return {
      company: null,
      currency: null,
      tenant: null,
      isLoading: false,
      error: initialData
        ? "Failed to load tenant data"
        : "No tenant data available",
    };
  });

  return (
    <TenantContext.Provider value={tenantData}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * useTenant Hook
 *
 * Main hook for accessing tenant data throughout the application.
 * Must be used within a TenantProvider component tree.
 *
 * @returns TenantContextData - Complete tenant context including tenant, company, currency
 * @throws Error if used outside TenantProvider
 */
export function useTenant(): TenantContextData {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

/**
 * useTenantCompany Hook
 *
 * Convenience hook for accessing company data only.
 * Use this when you only need company information.
 *
 * @returns Company | null - Company details or null if not available
 */
export function useTenantCompany(): Company | null {
  const { company } = useTenant();
  return company;
}

/**
 * useTenantCurrency Hook
 *
 * Convenience hook for accessing currency data only.
 * Use this when you only need currency settings.
 *
 * @returns Currency | null - Currency settings or null if not available
 */
export function useTenantCurrency(): Currency | null {
  const { currency } = useTenant();
  return currency;
}

/**
 * useTenantInfo Hook
 *
 * Convenience hook for accessing tenant information only.
 * Use this when you only need basic tenant details.
 *
 * @returns Tenant | null - Tenant information or null if not available
 */
export function useTenantInfo(): Tenant | null {
  const { tenant } = useTenant();
  return tenant;
}

/**
 * useTenantId Hook
 *
 * Convenience hook for accessing tenant ID only.
 * Useful for logging, debugging, or API calls requiring tenant ID.
 *
 * @returns number | null - Tenant ID or null if not available
 */
export function useTenantId(): number | null {
  const { tenant } = useTenant();
  return tenant?.id || null;
}

/**
 * useTenantBusinessType Hook
 *
 * Convenience hook for accessing business type information.
 * Commonly used in company forms and displays.
 *
 * @returns BusinessType | null - Business type data or null if not available
 */
export function useTenantBusinessType(): BusinessType | null {
  const { company } = useTenant();
  return company?.businessTypeId || null;
}

/**
 * useTenantSubIndustry Hook
 *
 * Convenience hook for accessing sub-industry information.
 * Commonly used in company forms and industry selection.
 *
 * @returns SubIndustry | null - Sub-industry data or null if not available
 */
export function useTenantSubIndustry(): SubIndustry | null {
  const { company } = useTenant();
  return company?.subIndustryId || null;
}

/**
 * useTenantIndustry Hook
 *
 * Convenience hook for accessing industry information (nested from sub-industry).
 * Commonly used in industry selection and filtering.
 *
 * @returns Industry | null - Industry data or null if not available
 */
export function useTenantIndustry(): Industry | null {
  const { company } = useTenant();
  return company?.subIndustryId?.industryId || null;
}

/**
 * useTenantAccountType Hook
 *
 * Convenience hook for accessing account type information.
 * Used in company settings and account configuration.
 *
 * @returns AccountType | null - Account type data or null if not available
 */
export function useTenantAccountType(): AccountType | null {
  const { company } = useTenant();
  return company?.accountTypeId || null;
}

/**
 * useTenantTaxDetails Hook
 *
 * Convenience hook for accessing tax information.
 * Used in tax-related forms and calculations.
 *
 * @returns TaxDetails | null - Tax details or null if not available
 */
export function useTenantTaxDetails(): TaxDetails | null {
  const { company } = useTenant();
  return company?.taxDetailsId || null;
}

/**
 * useTenantAddress Hook
 *
 * Convenience hook for accessing company address information.
 * Used in address forms and location-based features.
 *
 * @returns AddressInfo | null - Address information or null if not available
 */
export function useTenantAddress(): AddressInfo | null {
  const { company } = useTenant();
  return company?.addressId || null;
}
