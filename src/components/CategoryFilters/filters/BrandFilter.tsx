"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BrandFilterOption } from "@/types/category-filters";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { useState } from "react";

interface BrandFilterProps {
  brands: BrandFilterOption[];
  isLoading?: boolean;
}

/**
 * BrandFilter Component
 * Shows brands with navigation to brand pages when clicked
 */
export function BrandFilter({ brands, isLoading }: BrandFilterProps) {
  const { push } = useNavigationWithLoader();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) =>
    brand.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandClick = (brand: BrandFilterOption) => {
    // Navigate to brand page with loading state
    // The navigationPath already includes locale prefix from formatBrandsAggregation
    push(brand.navigationPath);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No brands available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Brand List */}
      <ScrollArea className="h-[180px]">
        <div className="space-y-1.5 pr-4">
          {filteredBrands.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No brands found
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.value}
                className="flex items-center space-x-2 rounded-md p-1.5 transition-colors hover:bg-accent/50 cursor-pointer"
                onClick={() => handleBrandClick(brand)}
              >
                <Checkbox
                  id={`brand-${brand.value}`}
                  checked={brand.selected ?? false}
                  onCheckedChange={() => handleBrandClick(brand)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />
                <Label
                  htmlFor={`brand-${brand.value}`}
                  className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                >
                  {brand.label}
                </Label>
                {brand.count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({brand.count})
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

