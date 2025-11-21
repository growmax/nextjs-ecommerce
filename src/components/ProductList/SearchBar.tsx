"use client";

import { Input } from "@/components/ui/input";
import { useProductStore } from "@/store/useProductStore";
import { Search } from "lucide-react";

/**
 * SearchBar Component
 * Search input with icon that connects to product store
 */
export function SearchBar() {
  const { searchQuery, setSearchQuery } = useProductStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
        className="pl-10 w-full sm:w-64"
      />
    </div>
  );
}
