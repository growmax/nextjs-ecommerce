"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type { BrandFilterOption } from "@/types/category-filters";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

interface BrandFilterProps {
  brands: BrandFilterOption[];
  isLoading?: boolean;
}

/**
 * BrandFilter Component
 * Shows brands with navigation to brand pages when clicked
 */
export function BrandFilter({ brands, isLoading }: BrandFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useBlockingLoader();

  // Show/hide blocking loader when transition state changes
  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Loading brand..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  const handleBrandClick = (brand: BrandFilterOption) => {
    // Navigate to brand page with loading state
    // The navigationPath already includes locale prefix from formatBrandsAggregation
    startTransition(() => {
      router.push(brand.navigationPath);
    });
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
    <div>
      {/* Brand List */}
      <ScrollArea className="h-[200px]">
        <div className="space-y-2 pr-4">
          {brands.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No brands found
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.value}
                className="flex items-center space-x-3 py-1 transition-colors hover:bg-accent/20 cursor-pointer rounded-sm px-1"
                onClick={() => handleBrandClick(brand)}
              >
                <Checkbox
                  id={`brand-${brand.value}`}
                  checked={brand.selected ?? false}
                  onCheckedChange={() => handleBrandClick(brand)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 h-[18px] w-[18px]"
                />
                <Label
                  htmlFor={`brand-${brand.value}`}
                  className="flex-1 cursor-pointer text-sm font-normal leading-relaxed"
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

