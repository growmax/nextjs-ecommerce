"use client";

import { CollapsibleSection } from "@/components/ui/collapsible";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type {
  BrandFilterOption,
  CategoryFilterOption,
  FilterOption,
  ProductSpecificationGroup,
  VariantAttributeGroup,
} from "@/types/category-filters";
import { Filter } from "lucide-react";
import { useEffect } from "react";
import { BrandFilter } from "./filters/BrandFilter";
import { CatalogCodeFilter } from "./filters/CatalogCodeFilter";
import { CategoryFilter } from "./filters/CategoryFilter";
import { EquipmentCodeFilter } from "./filters/EquipmentCodeFilter";
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
  isLoading?: boolean;
  hideBrandFilter?: boolean;
  brandRemovalPath?: string;
}

/**
 * CategoryFilters Component
 * Main filter sidebar with all filter sections
 */
export function CategoryFilters({
  brands,
  childCategories,
  siblingCategories: _siblingCategories,
  currentCategoryPath,
  variantAttributeGroups,
  productSpecificationGroups,
  catalogCodes = [],
  equipmentCodes = [],
  isLoading = false,
  hideBrandFilter = false,
  brandRemovalPath,
}: CategoryFiltersProps) {
  const {
    filters,
    toggleVariantAttribute,
    toggleProductSpecification,
    setStockFilter,
    toggleCatalogCode,
    toggleEquipmentCode,
    isPending,
  } = useCategoryFilters();

  const { showLoader, hideLoader } = useBlockingLoader();

  // Show/hide blocking loader when filter state changes
  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Applying filters..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  return (
    <div className="flex flex-col bg-background border rounded-lg shadow-sm">
      {/* Filter Header - Static (no sticky to prevent overlap) */}
      <div className="flex items-center justify-between border-b bg-background py-2.5 px-4 rounded-t-lg">
        <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-foreground" />
        </div>
      </div>

      {/* Filter Content */}
      <div className="px-4">

        {/* Brands */}
        {!hideBrandFilter && brands.length > 0 && (
          <CollapsibleSection
            title="Brands"
            defaultOpen={true}
            badge={brands.length}
          >
            <BrandFilter 
              brands={brands} 
              isLoading={isLoading}
              {...(brandRemovalPath && { brandRemovalPath })}
            />
          </CollapsibleSection>
        )}

        {/* Categories */}
        {childCategories.length > 0 && (
          <CollapsibleSection
            title="Categories"
            defaultOpen={true}
            badge={childCategories.length}
          >
            <CategoryFilter
              childCategories={childCategories}
              siblingCategories={[]} // Empty for compatibility
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
    </div>
  );
}
