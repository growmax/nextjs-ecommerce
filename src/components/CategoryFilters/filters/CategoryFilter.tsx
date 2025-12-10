"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
import type { CategoryFilterOption } from "@/types/category-filters";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

interface CategoryFilterProps {
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[]; // Unused but kept for compatibility
  currentCategoryPath: string[];
  isLoading?: boolean;
}

/**
 * CategoryFilter Component
 * Displays hierarchical category navigation
 * Shows only children of current category level
 */
export function CategoryFilter({
  childCategories,
  currentCategoryPath,
  isLoading,
}: CategoryFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useBlockingLoader();

  useEffect(() => {
    if (isPending) {
      showLoader({ message: "Loading category..." });
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  const handleCategoryClick = (category: CategoryFilterOption) => {
    // Navigate to category using flat URL structure
    const targetPath = `/${category.categorySlug}`;
    
    startTransition(() => {
      router.push(targetPath);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (childCategories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No subcategories available
      </div>
    );
  }

  // Determine header text based on current path
  const headerText = currentCategoryPath.length === 0 
    ? "ALL CATEGORIES" 
    : "Subcategories";

  return (
    <div className="space-y-2">
      {/* Header */}
      {currentCategoryPath.length === 0 && (
        <h3 className="text-sm font-semibold text-foreground">
          {headerText}
        </h3>
      )}

      {/* Category List */}
      <ScrollArea className="h-[280px]">
        <div className="space-y-1 pr-4">
          {childCategories.map(category => (
            <button
              key={category.categoryId}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "w-full flex items-center justify-between",
                "px-3 py-2.5 rounded-md",
                "text-left text-sm font-normal",
                "transition-colors duration-150",
                "hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              )}
            >
              <span className="flex-1 text-foreground">
                {category.label}
              </span>
              
              <div className="flex items-center gap-2 shrink-0">
                {category.count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({category.count})
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
