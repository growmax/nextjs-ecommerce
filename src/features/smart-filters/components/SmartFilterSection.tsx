"use client";

import { FilterCheckboxOption, FilterOptionList } from "@/components/ui/filter-option";
import { FilterCollapsibleSection, FilterSidebar } from "@/components/ui/filter-sidebar";
import { RadioGroup } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import type { SmartFilterResponse } from "../types/smart-filter-response.types";
import { FilterCategoryChildItem, FilterCategoryItem } from "@/components/ui/filter-category-item";

export interface SmartFilterSectionProps {
  /** Complete filter data from server */
  filterData: SmartFilterResponse;
  
  /** Current category ID for highlighting */
  currentCategoryId?: number | undefined;
  
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
 * Complete filter sidebar with new shadcn-inspired design:
 * - Categories (hierarchical with siblings + children)
 * - Brands
 * - Stock Filter
 * - Variant Attributes
 * - Product Specifications
 * - Catalog Codes
 * - Equipment Codes
 * 
 * Note: Price filter removed as per requirements
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

  const { filters } = filterData;
  const { categories, brands, stock, variantAttributes, productSpecifications, catalogCodes, equipmentCodes } = filters;

  // Calculate active filter count (excluding price)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.get("brand")) count++;
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

  const hasCategories = categories.siblings.length > 0 || categories.children.length > 0;
  const hasBrands = brands.items.length > 0;
  const hasVariantAttributes = variantAttributes.groups.length > 0;
  const hasProductSpecs = productSpecifications.groups.length > 0;
  const hasCatalogCodes = catalogCodes.items.length > 0;
  const hasEquipmentCodes = equipmentCodes.items.length > 0;
  const showStockFilter = stock.inStock > 0 || stock.outOfStock > 0;

  const loading = isLoading || isPending;

  return (
    <FilterSidebar
      className={className}
      activeFilterCount={activeFilterCount}
      onClearAll={clearAllFilters}
      isLoading={loading}
    >
      {/* Categories Filter */}
      {hasCategories && (
        <FilterCollapsibleSection
          title="Categories"
          defaultOpen={true}
          badge={categories.siblings.length + categories.children.length}
        >
          <FilterOptionList maxHeight="300px">
            <RadioGroup value={currentCategoryId ? String(currentCategoryId) : null}>
              {/* Render siblings with collapsible children */}
              {categories.siblings.map((cat) => {
                // Find children for this specific sibling
                const childrenForThisCat = categories.children.filter(
                  child => child.parentId === cat.id
                );
                const hasChildren = childrenForThisCat.length > 0;
                
                return (
                  <FilterCategoryItem
                    key={cat.id}
                    label={cat.name}
                    count={cat.docCount}
                    value={String(cat.id)}
                    hasChildren={hasChildren}
                    disabled={loading}
                    onNavigate={() => {
                      if (!hasChildren) {
                        router.push(cat.navigationPath || `/${cat.slug}`);
                      }
                    }}
                  >
                    {/* Child Categories */}
                    {childrenForThisCat.map((child) => (
                      <FilterCategoryChildItem
                        key={child.id}
                        label={child.name}
                        count={child.docCount}
                        disabled={loading}
                        onNavigate={() => {
                          router.push(child.navigationPath || `/${child.slug}`);
                        }}
                      />
                    ))}
                  </FilterCategoryItem>
                );
              })}
            </RadioGroup>
          </FilterOptionList>
        </FilterCollapsibleSection>
      )}

      {/* Brand Filter */}
      {hasBrands && (
        <FilterCollapsibleSection
          title="Brands"
          defaultOpen={true}
          badge={brands.items.length}
        >
          <FilterOptionList maxHeight="240px">
            {brands.items.slice(0, 15).map((brand) => {
              const selectedBrands = searchParams.getAll("brand");
              const isChecked = selectedBrands.includes(brand.name);
              
              return (
                <FilterCheckboxOption
                  key={brand.name}
                  label={brand.name}
                  count={brand.count}
                  checked={isChecked}
                  onCheckedChange={() => toggleMultiValueFilter("brand", brand.name)}
                  disabled={loading}
                />
              );
            })}
            {brandRemovalPath && searchParams.getAll("brand").length > 0 && (
              <Link
                href={brandRemovalPath}
                className="block text-xs text-primary hover:underline mt-2 px-2"
              >
                View all brands →
              </Link>
            )}
          </FilterOptionList>
        </FilterCollapsibleSection>
      )}

      {/* Stock Filter */}
      {showStockFilter && (
        <FilterCollapsibleSection title="Availability" defaultOpen={false}>
          <div className="space-y-1">
            <FilterCheckboxOption
              label={`In Stock (${stock.inStock})`}
              checked={searchParams.get("in_stock") === "true"}
              onCheckedChange={(checked) =>
                updateFilters({ in_stock: checked ? "true" : null })
              }
              disabled={loading}
            />
          </div>
        </FilterCollapsibleSection>
      )}

      {/* Variant Attributes */}
      {hasVariantAttributes && variantAttributes.groups.slice(0, 5).map((group) => (
        <FilterCollapsibleSection
          key={group.name}
          title={group.name}
          defaultOpen={false}
          badge={group.values.length}
        >
          <FilterOptionList maxHeight="200px">
            {group.values.slice(0, 10).map((val) => {
              const paramKey = `va_${group.name}`;
              const isSelected = searchParams.getAll(paramKey).includes(val.value);
              return (
                <FilterCheckboxOption
                  key={val.value}
                  label={val.value}
                  count={val.count}
                  checked={isSelected}
                  onCheckedChange={() => toggleMultiValueFilter(paramKey, val.value)}
                  disabled={loading}
                />
              );
            })}
          </FilterOptionList>
        </FilterCollapsibleSection>
      ))}

      {/* Product Specifications */}
      {hasProductSpecs && productSpecifications.groups.slice(0, 3).map((group) => (
        <FilterCollapsibleSection
          key={group.groupName}
          title={group.groupName}
          defaultOpen={false}
          badge={group.specs.length}
        >
          <FilterOptionList maxHeight="200px">
            {group.specs.slice(0, 10).map((spec, idx) => {
              const paramKey = `ps_${spec.name}`;
              const isSelected = searchParams.getAll(paramKey).includes(spec.value);
              return (
                <FilterCheckboxOption
                  key={`${spec.name}-${spec.value}-${idx}`}
                  label={`${spec.name}: ${spec.value}`}
                  count={spec.count}
                  checked={isSelected}
                  onCheckedChange={() => toggleMultiValueFilter(paramKey, spec.value)}
                  disabled={loading}
                />
              );
            })}
          </FilterOptionList>
        </FilterCollapsibleSection>
      ))}

      {/* Catalog Codes */}
      {hasCatalogCodes && (
        <FilterCollapsibleSection
          title="Catalog Codes"
          defaultOpen={false}
          badge={catalogCodes.items.length}
        >
          <FilterOptionList maxHeight="200px">
            {catalogCodes.items.slice(0, 10).map((item) => {
              const isSelected = searchParams.getAll("catalog_code").includes(item.code);
              return (
                <FilterCheckboxOption
                  key={item.code}
                  label={item.code}
                  count={item.count}
                  checked={isSelected}
                  onCheckedChange={() => toggleMultiValueFilter("catalog_code", item.code)}
                  disabled={loading}
                />
              );
            })}
          </FilterOptionList>
        </FilterCollapsibleSection>
      )}

      {/* Equipment Codes */}
      {hasEquipmentCodes && (
        <FilterCollapsibleSection
          title="Equipment Codes"
          defaultOpen={false}
          badge={equipmentCodes.items.length}
        >
          <FilterOptionList maxHeight="200px">
            {equipmentCodes.items.slice(0, 10).map((item) => {
              const isSelected = searchParams.getAll("equipment_code").includes(item.code);
              return (
                <FilterCheckboxOption
                  key={item.code}
                  label={item.code}
                  count={item.count}
                  checked={isSelected}
                  onCheckedChange={() => toggleMultiValueFilter("equipment_code", item.code)}
                  disabled={loading}
                />
              );
            })}
          </FilterOptionList>
        </FilterCollapsibleSection>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}
    </FilterSidebar>
  );
}
