import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TenantInfo, SellerCompany, SellerCurrency } from "@/types/appconfig";

// Tenant Data Interface - Stores complete API response structure
export interface TenantData {
  tenant: TenantInfo | null;
  sellerCompanyId: SellerCompany | null;
  sellerCurrency: SellerCurrency | null;
}

// Store State Interface
interface TenantStore {
  tenantData: TenantData | null;
  loading: boolean;
  error: string | null;
  setTenantData: (data: TenantData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTenantData: () => void;
}

// Create Zustand store with persistence
export const useTenantStore = create<TenantStore>()(
  persist(
    set => ({
      tenantData: null,
      loading: false,
      error: null,
      setTenantData: (data: TenantData) =>
        set({
          tenantData: data,
          loading: false,
          error: null,
        }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) =>
        set({
          error,
          loading: false,
        }),
      clearTenantData: () =>
        set({
          tenantData: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "tenant-storage", // localStorage key
      partialize: state => ({ tenantData: state.tenantData }), // Only persist tenantData
    }
  )
);
