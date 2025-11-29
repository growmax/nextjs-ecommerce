"use client";

import { CollapsibleSection } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import type {
    BrandFilterOption,
    CategoryFilterOption,
    FilterOption,
    ProductSpecificationGroup,
    VariantAttributeGroup,
} from "@/types/category-filters";
import { Filter } from "lucide-react";
import { ActiveFilters } from "./ActiveFilters";
import { BrandFilter } from "./filters/BrandFilter";
import { CatalogCodeFilter } from "./filters/CatalogCodeFilter";
import { CategoryFilter } from "./filters/CategoryFilter";
import { EquipmentCodeFilter } from "./filters/EquipmentCodeFilter";
import { PriceFilter } from "./filters/PriceFilter";
import { ProductSpecificationFilter } from "./filters/ProductSpecificationFilter";
import { StockFilter } from "./filters/StockFilter";
import { VariantAttributeFilter } from "./filters/VariantAttributeFilter";

interface CategoryFiltersProps {
  brands: BrandFilterOption[];
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[];
  currentCategoryPath: string[];
  variantAttributeGroups: VariantAttributeGroup[];
  productSpecificationGroups: ProductSpecificationGroup[];
  catalogCodes?: FilterOption[];
  equipmentCodes?: FilterOption[];
  priceStats?: { min?: number; max?: number } | undefined;
  isLoading?: boolean;
  hideBrandFilter?: boolean;
}

/**
 * CategoryFilters Component
 * Main filter sidebar with all filter sections
 */
export function CategoryFilters({
  brands,
  childCategories,
  siblingCategories,
  currentCategoryPath,
  variantAttributeGroups,
  productSpecificationGroups,
  catalogCodes = [],
  equipmentCodes = [],
  priceStats,
  isLoading = false,
  hideBrandFilter = false,
}: CategoryFiltersProps) {
  const {
    filters,
    toggleVariantAttribute,
    toggleProductSpecification,
    setStockFilter,
    setPriceRange,
    toggleCatalogCode,
    toggleEquipmentCode,
    removeVariantAttribute,
    removeProductSpecification,
    clearAllFilters,
    activeFilterCount,
  } = useCategoryFilters();

  const handleRemoveStockFilter = () => {
    setStockFilter(undefined);
  };

  return (
    <div className="flex h-full flex-col bg-background shadow-sm">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm p-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            onRemoveVariantAttribute={removeVariantAttribute}
            onRemoveProductSpecification={removeProductSpecification}
            onRemoveStockFilter={handleRemoveStockFilter}
            onClearAll={clearAllFilters}
          />

          {activeFilterCount > 0 && <Separator className="my-3" />}

          {/* Brands */}
          {!hideBrandFilter && brands.length > 0 && (
            <CollapsibleSection
              title="Brands"
              defaultOpen={true}
              badge={brands.length}
            >
              <BrandFilter brands={brands} isLoading={isLoading} />
            </CollapsibleSection>
          )}

          {/* Categories */}
          {(childCategories.length > 0 || siblingCategories.length > 0) && (
            <CollapsibleSection
              title="Categories"
              defaultOpen={true}
              badge={childCategories.length + siblingCategories.length}
            >
              <CategoryFilter
                childCategories={childCategories}
                siblingCategories={siblingCategories}
                currentCategoryPath={currentCategoryPath}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Variant Attributes */}
          {variantAttributeGroups.length > 0 && (
            <CollapsibleSection
              title="Attributes"
              defaultOpen={true}
              badge={variantAttributeGroups.length}
            >
              <VariantAttributeFilter
                attributeGroups={variantAttributeGroups}
                selectedAttributes={filters.variantAttributes}
                onToggle={toggleVariantAttribute}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Product Specifications */}
          {productSpecificationGroups.length > 0 && (
            <CollapsibleSection
              title="Specifications"
              defaultOpen={false}
              badge={productSpecificationGroups.length}
            >
              <ProductSpecificationFilter
                specificationGroups={productSpecificationGroups}
                selectedSpecifications={filters.productSpecifications}
                onToggle={toggleProductSpecification}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Price Range */}
          {priceStats && (
            <CollapsibleSection title="Price Range" defaultOpen={false}>
              <PriceFilter
                minPrice={filters.priceRange?.min}
                maxPrice={filters.priceRange?.max}
                priceStats={priceStats}
                onChange={setPriceRange}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Catalog Codes */}
          {catalogCodes.length > 0 && (
            <CollapsibleSection
              title="Catalog Codes"
              defaultOpen={false}
              badge={catalogCodes.length}
            >
              <CatalogCodeFilter
                options={catalogCodes}
                selectedCodes={filters.catalogCodes || []}
                onToggle={toggleCatalogCode}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Equipment Codes */}
          {equipmentCodes.length > 0 && (
            <CollapsibleSection
              title="Equipment Codes"
              defaultOpen={false}
              badge={equipmentCodes.length}
            >
              <EquipmentCodeFilter
                options={equipmentCodes}
                selectedCodes={filters.equipmentCodes || []}
                onToggle={toggleEquipmentCode}
                isLoading={isLoading}
              />
            </CollapsibleSection>
          )}

          {/* Stock Status */}
          <CollapsibleSection title="Stock" defaultOpen={false}>
            <StockFilter
              inStock={filters.inStock}
              onChange={setStockFilter}
              isLoading={isLoading}
            />
          </CollapsibleSection>
        </div>
      </ScrollArea>
    </div>
  );
}

