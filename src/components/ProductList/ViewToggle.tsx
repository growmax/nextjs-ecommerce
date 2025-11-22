"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProductStore } from "@/store/useProductStore";
import { Grid3X3, List } from "lucide-react";

/**
 * ViewToggle Component
 * Toggle between grid and list view modes
 */
export function ViewToggle() {
  const { viewMode, setViewMode } = useProductStore();

  return (
    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
      if (value) setViewMode(value as "grid" | "list");
    }}>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <Grid3X3 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
