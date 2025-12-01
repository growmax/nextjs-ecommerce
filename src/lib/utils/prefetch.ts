"use client";

import { useRouter } from "@/i18n/navigation";

/**
 * Prefetch utility functions for programmatic route prefetching
 */

/**
 * Prefetch a route programmatically
 * Useful for prefetching related routes (e.g., next page in pagination)
 */
export function prefetchRoute(href: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Note: useRouter is a hook, so it can only be used in components
    // For programmatic prefetching outside components, we'll use a different approach
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        // Prefetch using link prefetching
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    }
  } catch (error) {
    // Silently fail - prefetching is optional
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to prefetch route:", href, error);
    }
  }
}

/**
 * Hook to prefetch routes programmatically
 * Use this in components to prefetch related routes
 */
export function usePrefetchRoutes() {
  const router = useRouter();

  const prefetch = (href: string) => {
    try {
      router.prefetch(href);
    } catch (error) {
      // Silently fail - prefetching is optional
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to prefetch route:", href, error);
      }
    }
  };

  /**
   * Prefetch next page in pagination
   */
  const prefetchNextPage = (currentPage: number, baseUrl: string) => {
    const nextPage = currentPage + 1;
    const nextUrl = `${baseUrl}?page=${nextPage}`;
    prefetch(nextUrl);
  };

  /**
   * Prefetch related product when viewing a product
   */
  const prefetchRelatedProduct = (productSlug: string) => {
    const productUrl = `/products/${productSlug}`;
    prefetch(productUrl);
  };

  /**
   * Prefetch category page when viewing products
   */
  const prefetchCategory = (categorySlug: string) => {
    const categoryUrl = `/${categorySlug}`;
    prefetch(categoryUrl);
  };

  return {
    prefetch,
    prefetchNextPage,
    prefetchRelatedProduct,
    prefetchCategory,
  };
}
