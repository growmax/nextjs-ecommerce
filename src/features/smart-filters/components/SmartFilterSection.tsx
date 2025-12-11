/**
 * SmartFilterSection Component
 * 
 * Container component for ALL Smart Filters with collapsible sections.
 * Renders complete filter sidebar with all filter types.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CollapsibleSection } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { SmartFilterResponse } from "../types/smart-filter-response.types";

export interface SmartFilterSectionProps {
  /** Complete filter data from server */
  filterData: SmartFilterResponse;
  
  /** Current category ID for highlighting */
  currentCategoryId?: number;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom className for wrapper */
  className?: string;
  
  /** Brand removal path (for brand pages) */
  brandRemovalPath?: string;
}

/**
 * SmartFilterSection
 * 
 * Complete filter sidebar with all filter types:
 * - Smart Category Filter (siblings + children)
 * - Brand Filter
 * - Price Range Filter  
 * - Stock Filter
 * - Variant Attributes Filter
 * - Product Specifications Filter
 * - Catalog Codes Filter
 * - Equipment Codes Filter
 */
export function SmartFilterSection({
  filterData,
  currentCategoryId,
  isLoading = false,
  className,
  brandRemovalPath,
}: SmartFilterSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Price filter local state
  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || ""
  );

  const { filters } = filterData;
  const { categories, brands, priceRange, stock, variantAttributes, productSpecifications, catalogCodes, equipmentCodes } = filters;

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.get("brand")) count++;
    if (searchParams.get("min_price") || searchParams.get("max_price")) count++;
    if (searchParams.get("in_stock")) count++;
    // Count variant attributes
    searchParams.forEach((_, key) => {
      if (key.startsWith("va_")) count++;
    });
    // Count product specs
    searchParams.forEach((_, key) => {
      if (key.startsWith("ps_")) count++;
    });
    if (searchParams.get("catalog_code")) count++;
    if (searchParams.get("equipment_code")) count++;
    return count;
  }, [searchParams]);

  /**
   * Update URL with new filter params
   */
  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Always reset to page 1 when filters change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }

      const newURL = params.toString() ? `${pathname}?${params}` : pathname;
      
      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, searchParams, router]
  );

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  /**
   * Toggle a multi-value filter (variant attributes, specs, etc.)
   */
  const toggleMultiValueFilter = useCallback(
    (paramKey: string, value: string) => {
      const currentValues = searchParams.getAll(paramKey);
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      updateFilters({ [paramKey]: newValues });
    },
    [searchParams, updateFilters]
  );

  /**
   * Apply price filter
   */
  const applyPriceFilter = useCallback(() => {
    updateFilters({
      min_price: minPrice || null,
      max_price: maxPrice || null,
    });
  }, [minPrice, maxPrice, updateFilters]);

  const hasCategories = categories.siblings.length > 0 || categories.children.length > 0;
  const hasBrands = brands.items.length > 0;
  const hasVariantAttributes = variantAttributes.groups.length > 0;
  const hasProductSpecs = productSpecifications.groups.length > 0;
  const hasCatalogCodes = catalogCodes.items.length > 0;
  const hasEquipmentCodes = equipmentCodes.items.length > 0;
  const showStockFilter = stock.inStock > 0 || stock.outOfStock > 0;

  const loading = isLoading || isPending;

  return (
    <aside className={cn("hidden lg:block w-64 shrink-0", className)}>
      <div className="sticky top-4 flex flex-col bg-background border rounded-lg shadow-sm overflow-hidden max-h-[calc(100vh-2rem)]">
        {/* Filter Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 py-3 px-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-[20px]">
                {activeFilterCount}
              </span>
            )}
          </div>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs px-2"
              disabled={loading}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        {/* Filter Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Category Filter */}
          {hasCategories && (
            <CollapsibleSection
              title="Categories"
              defaultOpen={true}
              badge={categories.siblings.length + categories.children.length}
            >
              <div className="px-3 pb-3 space-y-1">
                {/* Siblings */}
                {categories.siblings.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.navigationPath || `/${cat.slug}`}
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 text-sm rounded-md transition-colors",
                      currentCategoryId === cat.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {cat.docCount}
                    </span>
                  </Link>
                ))}
                
                {/* Children header */}
                {categories.children.length > 0 && categories.siblings.length > 0 && (
                  <div className="pt-2 pb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subcategories
                    </span>
                  </div>
                )}
                
                {/* Children */}
                {categories.children.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.navigationPath || `/${cat.slug}`}
                    className="flex items-center justify-between py-1.5 px-2 pl-4 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-1 truncate">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {cat.docCount}
                    </span>
                  </Link>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Brand Filter */}
          {hasBrands && (
            <CollapsibleSection
              title="Brand"
              defaultOpen={true}
              badge={brands.items.length}
            >
              <div className="px-3 pb-3 space-y-1 max-h-48 overflow-y-auto">
                {brands.items.slice(0, 15).map((brand) => {
                  const isSelected = searchParams.get("brand") === brand.name;
                  return (
                    <button
                      key={brand.name}
                      onClick={() => updateFilters({ brand: isSelected ? null : brand.name })}
                      className={cn(
                        "flex items-center justify-between w-full py-1.5 px-2 text-sm rounded-md transition-colors text-left",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      )}
                      disabled={loading}
                    >
                      <span className="truncate">{brand.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {brand.count}
                      </span>
                    </button>
                  );
                })}
                {brandRemovalPath && searchParams.get("brand") && (
                  <Link
                    href={brandRemovalPath}
                    className="block text-xs text-primary hover:underline mt-2"
                  >
                    View all brands →
                  </Link>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Price Range Filter */}
          {priceRange.max > 0 && (
            <CollapsibleSection title="Price Range" defaultOpen={false}>
              <div className="px-3 pb-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={`Min ($${Math.floor(priceRange.min)})`}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-8 text-sm"
                    disabled={loading}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder={`Max ($${Math.ceil(priceRange.max)})`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-8 text-sm"
                    disabled={loading}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={applyPriceFilter}
                  className="w-full h-8"
                  disabled={loading}
                >
                  Apply Price
                </Button>
              </div>
            </CollapsibleSection>
          )}

          {/* Stock Filter */}
          {showStockFilter && (
            <CollapsibleSection title="Availability" defaultOpen={false}>
              <div className="px-3 pb-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={searchParams.get("in_stock") === "true"}
                    onCheckedChange={(checked) =>
                      updateFilters({ in_stock: checked ? "true" : null })
                    }
                    disabled={loading}
                  />
                  <span className="text-sm">In Stock ({stock.inStock})</span>
                </label>
              </div>
            </CollapsibleSection>
          )}

          {/* Variant Attributes */}
          {hasVariantAttributes && variantAttributes.groups.slice(0, 5).map((group) => (
            <CollapsibleSection
              key={group.name}
              title={group.name}
              defaultOpen={false}
              badge={group.values.length}
            >
              <div className="px-3 pb-3 space-y-1 max-h-40 overflow-y-auto">
                {group.values.slice(0, 10).map((val) => {
                  const paramKey = `va_${group.name}`;
                  const isSelected = searchParams.getAll(paramKey).includes(val.value);
                  return (
                    <label
                      key={val.value}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMultiValueFilter(paramKey, val.value)}
                        disabled={loading}
                      />
                      <span className="text-sm truncate flex-1">{val.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {val.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleSection>
          ))}

          {/* Product Specifications */}
          {hasProductSpecs && productSpecifications.groups.slice(0, 3).map((group) => (
            <CollapsibleSection
              key={group.groupName}
              title={group.groupName}
              defaultOpen={false}
              badge={group.specs.length}
            >
              <div className="px-3 pb-3 space-y-1 max-h-40 overflow-y-auto">
                {group.specs.slice(0, 10).map((spec, idx) => {
                  const paramKey = `ps_${spec.name}`;
                  const isSelected = searchParams.getAll(paramKey).includes(spec.value);
                  return (
                    <label
                      key={`${spec.name}-${spec.value}-${idx}`}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMultiValueFilter(paramKey, spec.value)}
                        disabled={loading}
                      />
                      <span className="text-sm truncate flex-1">
                        {spec.name}: {spec.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {spec.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleSection>
          ))}

          {/* Catalog Codes */}
          {hasCatalogCodes && (
            <CollapsibleSection
              title="Catalog Codes"
              defaultOpen={false}
              badge={catalogCodes.items.length}
            >
              <div className="px-3 pb-3 space-y-1 max-h-40 overflow-y-auto">
                {catalogCodes.items.slice(0, 10).map((item) => {
                  const isSelected = searchParams.getAll("catalog_code").includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMultiValueFilter("catalog_code", item.code)}
                        disabled={loading}
                      />
                      <span className="text-sm truncate flex-1">{item.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Equipment Codes */}
          {hasEquipmentCodes && (
            <CollapsibleSection
              title="Equipment Codes"
              defaultOpen={false}
              badge={equipmentCodes.items.length}
            >
              <div className="px-3 pb-3 space-y-1 max-h-40 overflow-y-auto">
                {equipmentCodes.items.slice(0, 10).map((item) => {
                  const isSelected = searchParams.getAll("equipment_code").includes(item.code);
                  return (
                    <label
                      key={item.code}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMultiValueFilter("equipment_code", item.code)}
                        disabled={loading}
                      />
                      <span className="text-sm truncate flex-1">{item.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="px-3 py-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
