"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type {
  BrandFilterOption,
  CategoryFilterOption,
  ProductSpecificationGroup,
  VariantAttributeGroup,
  FilterOption,
} from "@/types/category-filters";
import { Filter } from "lucide-react";
import { useState } from "react";
import { CategoryFilters } from "./CategoryFilters";

interface CategoryFiltersDrawerProps {
  brands: BrandFilterOption[];
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[];
  currentCategoryPath: string[];
  variantAttributeGroups: VariantAttributeGroup[];
  productSpecificationGroups: ProductSpecificationGroup[];
  catalogCodes?: FilterOption[];
  equipmentCodes?: FilterOption[];
  priceStats?: { min?: number; max?: number };
  isLoading?: boolean;
  hideBrandFilter?: boolean;
  trigger?: React.ReactNode;
}

/**
 * CategoryFiltersDrawer Component
 * Mobile-optimized filter drawer
 */
export function CategoryFiltersDrawer({
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
  trigger,
}: CategoryFiltersDrawerProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" className="lg:hidden">
      <Filter className="mr-2 h-4 w-4" />
      Filters
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md p-0">
        <div className="h-full">
          <CategoryFilters
            brands={brands}
            childCategories={childCategories}
            siblingCategories={siblingCategories}
            currentCategoryPath={currentCategoryPath}
            variantAttributeGroups={variantAttributeGroups}
            productSpecificationGroups={productSpecificationGroups}
            catalogCodes={catalogCodes}
            equipmentCodes={equipmentCodes}
            priceStats={priceStats}
            isLoading={isLoading}
            hideBrandFilter={hideBrandFilter}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

