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

  // Show skeleton during loading with transition
  if (isLoading) {
    return (
      <div className="product-table-transition opacity-100">
        {viewMode === "list" && <ProductGridSkeleton viewMode="list" count={20} />}
        {viewMode === "table" && <ProductTableSkeleton count={20} />}
        {(viewMode === "grid" || !viewMode) && <ProductGridSkeleton viewMode="grid" count={20} />}
      </div>
    );
  }

  // Show actual products with transition
  return (
    <div className="product-table-transition opacity-100">
      {viewMode === "list" && <ProductListViewClient products={products} locale={locale} />}
      {viewMode === "table" && <ProductTableViewClient products={products} locale={locale} />}
      {(viewMode === "grid" || !viewMode) && <ProductGridServerClient products={products} locale={locale} />}
    </div>
  );
}


