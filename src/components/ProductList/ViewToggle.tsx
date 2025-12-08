"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProductStore } from "@/store/useProductStore";
import type { ViewMode } from "@/types/product-listing";
import { Grid3X3, List, Table } from "lucide-react";

/**
 * ViewToggle Component
 * Toggle between grid, list, and table view modes
 */
export function ViewToggle() {
  const { viewMode, setViewMode } = useProductStore();

  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => {
        if (value) setViewMode(value as ViewMode);
      }}
      variant="outline"
      className="border-0 shadow-none [&>button]:hover:bg-transparent [&>button]:data-[state=on]:bg-accent"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view" className="h-10 px-3">
        <Grid3X3 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="h-10 px-3">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view" className="h-10 px-3">
        <Table className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
