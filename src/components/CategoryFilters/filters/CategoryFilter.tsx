"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategoryFilterOption } from "@/types/category-filters";
import { FolderTree } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryFilterProps {
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[];
  currentCategoryPath: string[];
  isLoading?: boolean;
}

/**
 * CategoryFilter Component
 * Shows child categories and sibling categories with proper navigation
 */
export function CategoryFilter({
  childCategories,
  siblingCategories,
  currentCategoryPath,
  isLoading,
}: CategoryFilterProps) {
  const router = useRouter();

  const handleCategoryClick = (category: CategoryFilterOption) => {
    if (category.isChild) {
      // Navigate to full path: /parentCategory/child1/child2/...
      router.push(`/${category.categoryPath}`);
    } else if (category.isSibling) {
      // Navigate preserving parent path: /parentCategory/clickedCategory
      // Get parent path from current path (remove last segment)
      const parentPath =
        currentCategoryPath.length > 1
          ? currentCategoryPath.slice(0, -1).join("/")
          : "";
      const newPath = parentPath
        ? `/${parentPath}/${category.categorySlug}`
        : `/${category.categorySlug}`;
      router.push(newPath);
    } else {
      // Root category
      router.push(`/${category.categorySlug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const hasChildCategories = childCategories.length > 0;
  const hasSiblingCategories = siblingCategories.length > 0;

  if (!hasChildCategories && !hasSiblingCategories) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No categories available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Child Categories */}
      {hasChildCategories && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5" />
            Child Categories
          </h4>
          <ScrollArea className="h-[140px]">
            <div className="space-y-0.5 pr-4">
              {childCategories.map((category) => (
                <Button
                  key={category.categoryId}
                  variant="ghost"
                  className="w-full justify-start text-left font-normal h-auto py-1.5 px-2 text-sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="flex-1">{category.label}</span>
                  {category.count > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({category.count})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Sibling Categories */}
      {hasSiblingCategories && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5" />
            Related Categories
          </h4>
          <ScrollArea className="h-[140px]">
            <div className="space-y-0.5 pr-4">
              {siblingCategories.map((category) => (
                <Button
                  key={category.categoryId}
                  variant="ghost"
                  className="w-full justify-start text-left font-normal h-auto py-1.5 px-2 text-sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="flex-1">{category.label}</span>
                  {category.count > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({category.count})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

