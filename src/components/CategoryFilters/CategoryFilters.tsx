"use client";

import { CollapsibleSection } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import type {
  BrandFilterOption,
  CategoryFilterOption,
  ProductSpecificationGroup,
  VariantAttributeGroup,
} from "@/types/category-filters";
import { Filter } from "lucide-react";
import { ActiveFilters } from "./ActiveFilters";
import { BrandFilter } from "./filters/BrandFilter";
import { CategoryFilter } from "./filters/CategoryFilter";
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
  isLoading?: boolean;
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
  isLoading = false,
}: CategoryFiltersProps) {
  const {
    filters,
    toggleVariantAttribute,
    toggleProductSpecification,
    setStockFilter,
    removeVariantAttribute,
    removeProductSpecification,
    clearAllFilters,
    activeFilterCount,
  } = useCategoryFilters();

  const handleRemoveStockFilter = () => {
    setStockFilter(undefined);
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            onRemoveVariantAttribute={removeVariantAttribute}
            onRemoveProductSpecification={removeProductSpecification}
            onRemoveStockFilter={handleRemoveStockFilter}
            onClearAll={clearAllFilters}
          />

          {activeFilterCount > 0 && <Separator />}

          {/* Brands */}
          {brands.length > 0 && (
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

