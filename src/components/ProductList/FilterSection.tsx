"use client";

import { ChevronDown, Filter, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/useProductStore";
import { brands, categories, colors } from "@/utils/ProductList/constants";

/**
 * FilterSection Component
 * Comprehensive filter sidebar with all filter controls
 * Enhanced with responsive design and modern UI
 */
export function FilterSection() {
  const {
    selectedCategory,
    selectedBrands,
    toggleBrand,
    selectedColors,
    toggleColor,
    priceRange,
    setPriceRange,
  } = useProductStore();
  const router = useRouter();

  // Collapsible states for mobile optimization
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 lg:mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight lg:text-xl">Filters</h2>
      </div>

      {/* Scrollable Filter Content */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="space-y-4 pb-4 lg:space-y-6">
          {/* Categories Section */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-0 hover:bg-transparent"
                >
                  <h3 className="text-sm font-semibold lg:text-base">
                    Related Categories
                  </h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      categoriesOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <RadioGroup
                  value={selectedCategory}
                  onValueChange={(value) => {
                    router.push(`/browse/${value}`);
                  }}
                >
                  <div className="space-y-2.5">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2.5 rounded-md p-1 transition-colors hover:bg-accent/50"
                      >
                        <RadioGroupItem
                          value={category.id}
                          id={`cat-${category.id}`}
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`cat-${category.id}`}
                          className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                        >
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Separator className="my-4" />

          {/* Brands Section */}
          <Collapsible open={brandsOpen} onOpenChange={setBrandsOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-0 hover:bg-transparent"
                >
                  <h3 className="text-sm font-semibold lg:text-base">Brands</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      brandsOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[180px] lg:h-[220px]">
                  <div className="space-y-2.5 pr-3">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center space-x-2.5 rounded-md p-1 transition-colors hover:bg-accent/50"
                      >
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={() => toggleBrand(brand.id)}
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`brand-${brand.id}`}
                          className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                        >
                          {brand.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Separator className="my-4" />

          {/* Colors Section */}
          <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-0 hover:bg-transparent"
                >
                  <h3 className="text-sm font-semibold lg:text-base">Colors</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      colorsOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2.5">
                  {colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex items-center space-x-2.5 rounded-md p-1 transition-colors hover:bg-accent/50"
                    >
                      <Checkbox
                        id={`color-${color.id}`}
                        checked={selectedColors.includes(color.id)}
                        onCheckedChange={() => toggleColor(color.id)}
                        className="shrink-0"
                      />
                      <div
                        className={cn(
                          "h-4 w-4 shrink-0 rounded-sm border border-border",
                          color.color
                        )}
                      />
                      <Label
                        htmlFor={`color-${color.id}`}
                        className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                      >
                        {color.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Separator className="my-4" />

          {/* Price Range Section */}
          <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold lg:text-base">Price Range</h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      priceOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 pt-2">
                  {/* Price Display */}
                  <div className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      ₹{priceRange[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      ₹{priceRange[1]}
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="px-1">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000000}
                      step={1000}
                      className="w-full"
                    />
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price-from"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Min
                      </Label>
                      <Input
                        id="price-from"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            Number(e.target.value) || 0,
                            priceRange[1],
                          ])
                        }
                        className="h-9 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price-to"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Max
                      </Label>
                      <Input
                        id="price-to"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            Number(e.target.value) || 5000000,
                          ])
                        }
                        className="h-9 text-sm"
                        placeholder="5000000"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
