"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  TenantContextData,
  Company,
  Currency,
  Tenant,
  TenantApiResponse,
} from "@/types/tenant";

const TenantContext = createContext<TenantContextData | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  initialData?: TenantApiResponse | null;
}

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

export function useTenant(): TenantContextData {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

// Helper hooks for specific tenant data
export function useTenantCompany(): Company | null {
  const { company } = useTenant();
  return company;
}

export function useTenantCurrency(): Currency | null {
  const { currency } = useTenant();
  return currency;
}

export function useTenantInfo(): Tenant | null {
  const { tenant } = useTenant();
  return tenant;
}

// Hook to get tenant ID for testing purposes
export function useTenantId(): number | null {
  const { tenant } = useTenant();
  return tenant?.id || null;
}
