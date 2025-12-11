/**
 * SmartCategoryFilter Component
 * 
 * Displays hierarchical category navigation with Smart Filter logic:
 * - Level 0: Shows all level 0 siblings + direct children
 * - Level > 0: Shows same-parent siblings + direct children
 * 
 * Implements SEO-safe navigation with proper URL structure.
 */

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { CategoryFilterOption } from "../types/smart-filter-response.types";

interface SmartCategoryFilterProps {
  /** Sibling categories (same level, same parent) */
  siblings: CategoryFilterOption[];
  
  /** Child categories (one level below current) */
  childCategories: CategoryFilterOption[];
  
  /** Current category ID for highlighting */
  currentCategoryId?: number;
  
  /** Optional custom navigation handler */
  onNavigate?: (category: CategoryFilterOption) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Maximum height for scrollable area */
  maxHeight?: string;
  
  /** Show section headers */
  showHeaders?: boolean;
}

/**
 * SmartCategoryFilter
 * 
 * Renders category navigation following Smart Filter rules.
 * Automatically handles siblings and children display logic.
 */
export function SmartCategoryFilter({
  siblings,
  childCategories,
  currentCategoryId,
  onNavigate,
  isLoading = false,
  maxHeight = "320px",
  showHeaders = true,
}: SmartCategoryFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  /**
   * Handle category navigation
   */
  const handleCategoryClick = (category: CategoryFilterOption) => {
    if (onNavigate) {
      onNavigate(category);
      return;
    }
    
    // Default navigation: use category slug for SEO-safe URLs
    const targetPath = category.navigationPath || `/${category.slug}`;
    
    startTransition(() => {
      router.push(targetPath);
    });
  };
  
  /**
   * Render loading skeleton
   */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {showHeaders && (
          <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
        )}
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }
  
  /**
   * Empty state
   */
  const hasCategories = siblings.length > 0 || childCategories.length > 0;
  if (!hasCategories) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No categories available
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Sibling Categories Section */}
      {siblings.length > 0 && (
        <div className="space-y-2">
          {showHeaders && (
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Categories
            </h4>
          )}
          
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-1 pr-3">
              {siblings.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isSelected={category.id === currentCategoryId}
                  onClick={() => handleCategoryClick(category)}
                  isPending={isPending}
                  showCount
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Child Categories Section */}
      {childCategories.length > 0 && (
        <div className="space-y-2">
          {showHeaders && siblings.length > 0 && (
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Subcategories
            </h4>
          )}
          
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-1 pr-3">
              {childCategories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isSelected={false}
                  onClick={() => handleCategoryClick(category)}
                  isPending={isPending}
                  showCount
                  isChild
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

/**
 * CategoryButton Component
 * Individual category option button
 */
interface CategoryButtonProps {
  category: CategoryFilterOption;
  isSelected: boolean;
  onClick: () => void;
  isPending?: boolean;
  showCount?: boolean;
  isChild?: boolean;
}

function CategoryButton({
  category,
  isSelected,
  onClick,
  isPending = false,
  showCount = true,
  isChild = false,
}: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "w-full flex items-center justify-between gap-2",
        "px-3 py-2.5 rounded-lg",
        "text-left text-sm",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Selected state
        isSelected && [
          "bg-primary/10 text-primary font-medium",
          "border border-primary/20",
        ],
        // Hover state (not selected)
        !isSelected && [
          "hover:bg-accent/50",
          "text-foreground",
        ],
        // Child category indent
        isChild && "pl-6"
      )}
    >
      {/* Category name and count */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="truncate">
          {category.name}
        </span>
        
        {showCount && category.docCount !== undefined && (
          <span className="text-xs text-muted-foreground shrink-0">
            ({category.docCount})
          </span>
        )}
      </div>
      
      {/* Chevron indicator */}
      {!isSelected && (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}
