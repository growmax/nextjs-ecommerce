"use client";

import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { useProductStore } from "@/store/useProductStore";
import { ProductGridServerClient } from "./ProductGridServerClient";
import { ProductListViewClient } from "./ProductListViewClient";
import { ProductTableViewClient } from "./ProductTableViewClient";

interface ProductViewSwitcherProps {
  products: FormattedProduct[];
  locale?: string;
}

/**
 * ProductViewSwitcher Component
 * Client component that switches between grid/list/table views
 * Uses viewMode from product store
 * Store initialization reads from window.__PRODUCT_VIEW_MODE__ (set by script tag)
 * to prevent hydration flash
 */
export function ProductViewSwitcher({
  products,
  locale = "en",
}: ProductViewSwitcherProps) {
  const { viewMode } = useProductStore();

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

