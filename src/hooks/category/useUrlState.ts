"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

export interface UrlStateOptions {
  page?: number;
  sort?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  brands?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface UseUrlStateReturn {
  state: UrlStateOptions;
  updateUrl: (updates: Partial<UrlStateOptions>) => void;
  isPending: boolean;
  clearFilters: () => void;
}

/**
 * useUrlState Hook
 * Manages URL state for category/brand pages with zero page reloads
 * 
 * @param defaults - Default values for URL parameters
 * @returns URL state and update functions
 */
export function useUrlState(
  defaults: UrlStateOptions = {}
): UseUrlStateReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current state from URL
  const state = useMemo<UrlStateOptions>(() => {
    const current: UrlStateOptions = { ...defaults };

    // Parse page
    const pageParam = searchParams.get("page");
    if (pageParam) {
      current.page = parseInt(pageParam, 10);
    }

    // Parse sort
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      current.sort = parseInt(sortParam, 10);
    }

    // Parse price range
    const minPriceParam = searchParams.get("minPrice");
    if (minPriceParam) {
      current.minPrice = parseInt(minPriceParam, 10);
    }

    const maxPriceParam = searchParams.get("maxPrice");
    if (maxPriceParam) {
      current.maxPrice = parseInt(maxPriceParam, 10);
    }

    // Parse inStock
    const inStockParam = searchParams.get("inStock");
    if (inStockParam !== null) {
      current.inStock = inStockParam === "true";
    }

    // Parse brands
    const brandsParam = searchParams.get("brands");
    if (brandsParam) {
      current.brands = brandsParam.split(",").filter(Boolean);
    }

    return current;
  }, [searchParams, defaults]);

  /**
   * Update URL with new state
   */
  const updateUrl = useCallback(
    (updates: Partial<UrlStateOptions>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Merge updates with current state
      const newState = { ...state, ...updates };

      // Update or remove parameters
      Object.entries(newState).forEach(([key, value]) => {
        // Skip default values to keep URLs clean
        const defaultValue = defaults[key];

        if (key === "page" && value === 1) {
          params.delete("page");
        } else if (key === "page" && typeof value === "number" && value > 1) {
          params.set(key, String(value));
        } else if (key === "sort" && value === 1) {
          params.delete("sort");
        } else if (key === "sort" && typeof value === "number" && value !== 1) {
          params.set(key, String(value));
        } else if (key === "brands" && Array.isArray(value)) {
          if (value.length === 0) {
            params.delete("brands");
          } else {
            params.set(key, value.join(","));
          }
        } else if (key === "inStock" && typeof value === "boolean") {
          if (value === false) {
            params.delete("inStock");
          } else {
            params.set(key, "true");
          }
        } else if (
          (key === "minPrice" || key === "maxPrice") &&
          typeof value === "number"
        ) {
          if (value === defaultValue) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        } else if (value !== undefined && value !== defaultValue) {
          params.set(key, String(value));
        } else if (value === defaultValue || value === undefined) {
          params.delete(key);
        }
      });

      // Build new URL
      const newURL = params.toString() ? `${pathname}?${params}` : pathname;

      // Update URL without reload
      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, searchParams, router, state, defaults]
  );

  /**
   * Clear all filters (reset to defaults)
   */
  const clearFilters = useCallback(() => {
    const newURL = pathname;

    startTransition(() => {
      router.replace(newURL, { scroll: false });
    });
  }, [pathname, router]);

  return {
    state,
    updateUrl,
    isPending,
    clearFilters,
  };
}

