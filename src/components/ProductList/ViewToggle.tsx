"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProductStore } from "@/store/useProductStore";
import { Grid3X3, List, Table } from "lucide-react";
import type { ViewMode } from "@/types/product-listing";

/**
 * ViewToggle Component
 * Toggle between grid, list, and table view modes
 */
export function ViewToggle() {
  const { viewMode, setViewMode } = useProductStore();

  return (
    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
      if (value) setViewMode(value as ViewMode);
    }}>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <Grid3X3 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
