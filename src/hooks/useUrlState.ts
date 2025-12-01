"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useTransition } from "react";

export interface UrlStateOptions {
  page?: number;
  sort?: number;
  [key: string]: string | number | undefined;
}

export interface UseUrlStateReturn {
  page: number;
  sort: number;
  params: URLSearchParams;
  updateUrl: (updates: Partial<UrlStateOptions>) => void;
  isPending: boolean;
}

/**
 * useUrlState Hook
 * Type-safe URL parameter management with debouncing support
 */
export function useUrlState(
  defaults: UrlStateOptions = {}
): UseUrlStateReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current URL params
  const page = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : (defaults.page || 1);
  }, [searchParams, defaults.page]);

  const sort = useMemo(() => {
    const sortParam = searchParams.get("sort");
    return sortParam ? parseInt(sortParam, 10) : (defaults.sort || 1);
  }, [searchParams, defaults.sort]);

  // Update URL without reload
  const updateUrl = useCallback(
    (updates: Partial<UrlStateOptions>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update page
      if (updates.page !== undefined) {
        if (updates.page > 1) {
          params.set("page", updates.page.toString());
        } else {
          params.delete("page");
        }
      }

      // Update sort
      if (updates.sort !== undefined) {
        if (updates.sort !== 1) {
          params.set("sort", updates.sort.toString());
        } else {
          params.delete("sort");
        }
      }

      // Update any other params
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== "page" && key !== "sort" && value !== undefined) {
          if (value) {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }
        }
      });

      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [searchParams, router]
  );

  return {
    page,
    sort,
    params: searchParams,
    updateUrl,
    isPending,
  };
}



