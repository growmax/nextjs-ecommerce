"use client";

import { ProductGridSkeleton } from "@/components/ProductList/ProductGridSkeleton";
import { ProductTableSkeleton } from "@/components/ProductList/ProductTableSkeleton";
import { useProductLoading } from "@/contexts/ProductLoadingContext";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { useProductStore } from "@/store/useProductStore";
import { ProductGridServerClient } from "./ProductGridServerClient";
import { ProductListViewClient } from "./ProductListViewClient";
import { ProductTableViewClient } from "./ProductTableViewClient";

interface ProductViewSwitcherProps {
  products: FormattedProduct[];
  locale?: string;
  isLoading?: boolean;
}

/**
 * ProductViewSwitcher Component
 * Client component that switches between grid/list/table views
 * Uses viewMode from product store
 * Store initialization reads from window.__PRODUCT_VIEW_MODE__ (set by script tag)
 * to prevent hydration flash
 * Shows appropriate skeleton loader when isLoading is true
 */
export function ProductViewSwitcher({
  products,
  locale = "en",
  isLoading: isLoadingProp = false,
}: ProductViewSwitcherProps) {
  const { viewMode } = useProductStore();
  const { isLoading: isLoadingContext } = useProductLoading();
  
  // Use context loading state if available, fallback to prop
  const isLoading = isLoadingContext || isLoadingProp;

  // Show skeleton during loading
  if (isLoading) {
    switch (viewMode) {
      case "list":
        return <ProductGridSkeleton viewMode="list" count={20} />;
      case "table":
        return <ProductTableSkeleton count={20} />;
      case "grid":
      default:
        return <ProductGridSkeleton viewMode="grid" count={20} />;
    }
  }

  // Show actual products
  switch (viewMode) {
    case "list":
      return <ProductListViewClient products={products} locale={locale} />;
    case "table":
      return <ProductTableViewClient products={products} locale={locale} />;
    case "grid":
    default:
      return <ProductGridServerClient products={products} locale={locale} />;
  }
}

