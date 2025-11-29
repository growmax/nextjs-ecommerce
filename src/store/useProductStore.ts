import {
    ProductListItem,
    ViewMode,
} from "@/types/product-listing";
import { create } from "zustand";

/**
 * Product Store State Interface
 */
export interface ProductStoreState {
  // Product Data
  products: ProductListItem[];
  filteredProducts: ProductListItem[];

  // Filter States
  selectedCategory: string;
  selectedBrands: string[];
  selectedColors: string[];
  priceRange: [number, number];
  searchQuery: string;
  viewMode: ViewMode;
  currentPage: number;
  itemsPerPage: number;

  // Loading & Error
  loading: boolean;
  error: string | null;

  // Actions - Category
  setSelectedCategory: (category: string) => void;

  // Actions - Brands
  toggleBrand: (brandId: string) => void;
  clearBrands: () => void;

  // Actions - Colors
  toggleColor: (colorId: string) => void;
  clearColors: () => void;

  // Actions - Price
  setPriceRange: (range: [number, number]) => void;

  // Actions - Search
  setSearchQuery: (query: string) => void;

  // Actions - View
  setViewMode: (mode: ViewMode) => void;

  // Actions - Pagination
  setCurrentPage: (page: number) => void;

  // Actions - Products
  setProducts: (products: ProductListItem[]) => void;
  applyFilters: () => void;
  resetFilters: () => void;

  // Actions - Loading/Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Filter utility function
 * Applies all active filters to the product list
 */
function filterProducts(
  products: ProductListItem[],
  filters: {
    category: string;
    brands: string[];
    colors: string[];
    priceRange: [number, number];
    searchQuery: string;
  }
): ProductListItem[] {
  let result = products;

  // Filter by category
  if (filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  // Filter by brands
  if (filters.brands.length > 0) {
    result = result.filter((p) =>
      filters.brands.includes(p.brand.toLowerCase().replace(/\s+/g, "-"))
    );
  }

  // Filter by colors
  if (filters.colors.length > 0) {
    result = result.filter(
      (p) => p.color && filters.colors.includes(p.color.toLowerCase())
    );
  }

  // Filter by price range
  result = result.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
  );

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }

  return result;
}

/**
 * Load viewMode from localStorage or global variable (set by script tag)
 */
function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  
  // Check if script tag has already set the viewMode
  if ((window as any).__PRODUCT_VIEW_MODE__) {
    const saved = (window as any).__PRODUCT_VIEW_MODE__;
    if (saved === "grid" || saved === "list" || saved === "table") {
      return saved;
    }
  }
  
  // Fallback to localStorage
  try {
    const saved = localStorage.getItem("product-view-mode");
    if (saved === "grid" || saved === "list" || saved === "table") {
      return saved;
    }
  } catch {
    // localStorage might not be available
  }
  
  return "grid";
}

/**
 * Zustand Store for Product Listing
 * Follows the same pattern as useTenantStore
 */
export const useProductStore = create<ProductStoreState>((set, get) => ({
  // Initial State
  products: [],
  filteredProducts: [],
  selectedCategory: "all",
  selectedBrands: [],
  selectedColors: [],
  priceRange: [0, 5000000], // ₹0 to ₹50,000 (in paise)
  searchQuery: "",
  viewMode: getInitialViewMode(),
  loading: false,
  error: null,

  // Pagination State
  currentPage: 1,
  itemsPerPage: 12,

  // Category Actions
  setSelectedCategory: (category) => {
    set({ selectedCategory: category, currentPage: 1 });
    get().applyFilters();
  },

  // Brand Actions
  toggleBrand: (brandId) => {
    set((state) => ({
      selectedBrands: state.selectedBrands.includes(brandId)
        ? state.selectedBrands.filter((id) => id !== brandId)
        : [...state.selectedBrands, brandId],
      currentPage: 1,
    }));
    get().applyFilters();
  },

  clearBrands: () => {
    set({ selectedBrands: [], currentPage: 1 });
    get().applyFilters();
  },

  // Color Actions
  toggleColor: (colorId) => {
    set((state) => ({
      selectedColors: state.selectedColors.includes(colorId)
        ? state.selectedColors.filter((id) => id !== colorId)
        : [...state.selectedColors, colorId],
      currentPage: 1,
    }));
    get().applyFilters();
  },

  clearColors: () => {
    set({ selectedColors: [], currentPage: 1 });
    get().applyFilters();
  },

  // Price Actions
  setPriceRange: (range) => {
    set({ priceRange: range, currentPage: 1 });
    get().applyFilters();
  },

  // Search Actions
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().applyFilters();
  },

  // View Actions
  setViewMode: (mode) => {
    set({ viewMode: mode });
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("product-view-mode", mode);
    }
  },

  // Pagination Actions
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  // Product Actions
  setProducts: (products) => {
    set({ products, loading: false, error: null, currentPage: 1 });
    get().applyFilters();
  },

  applyFilters: () => {
    const state = get();
    const filtered = filterProducts(state.products, {
      category: state.selectedCategory,
      brands: state.selectedBrands,
      colors: state.selectedColors,
      priceRange: state.priceRange,
      searchQuery: state.searchQuery,
    });
    set({ filteredProducts: filtered });
  },

  resetFilters: () => {
    set({
      selectedCategory: "all",
      selectedBrands: [],
      selectedColors: [],
      priceRange: [0, 5000000],
      searchQuery: "",
      currentPage: 1,
    });
    get().applyFilters();
  },

  // Loading/Error Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
