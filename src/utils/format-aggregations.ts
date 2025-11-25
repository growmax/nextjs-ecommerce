/**
 * Format Aggregations Utility
 * 
 * Formats OpenSearch aggregation results into filter-friendly structures
 */

import type { CategoryPath } from "@/lib/services/CategoryResolutionService";
import type {
    AggregationResult,
    BrandFilterOption,
    CategoryFilterOption,
    FilterAggregations,
    ProductSpecificationGroup,
    VariantAttributeGroup,
} from "@/types/category-filters";

/**
 * Format brands aggregation
 */
export function formatBrandsAggregation(
  aggregation: AggregationResult | undefined,
  _currentCategoryPath: string[]
): BrandFilterOption[] {
  if (!aggregation?.data?.buckets) {
    return [];
  }

  return aggregation.data.buckets.map((bucket) => ({
    label: bucket.key,
    value: bucket.key,
    count: bucket.doc_count,
    selected: false,
    brandName: bucket.key,
    navigationPath: `/brands/${encodeURIComponent(bucket.key)}/category`,
  }));
}

/**
 * Format categories aggregation (child and sibling categories)
 * Excludes current category and properly identifies category relationships
 */
export function formatCategoriesAggregation(
  aggregation: AggregationResult | undefined,
  categoryPath: CategoryPath,
  currentCategoryPath: string[]
): {
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[];
} {
  const childCategories: CategoryFilterOption[] = [];
  const siblingCategories: CategoryFilterOption[] = [];

  // Handle nested aggregation structure
  const nestedAgg = aggregation as {
    nested_categories?: {
      data?: {
        buckets?: Array<{
          key: string;
          doc_count: number;
          category_id?: { buckets?: Array<{ key: number }> };
          category_slug?: { buckets?: Array<{ key: string }> };
          category_path?: { buckets?: Array<{ key: string }> };
          category_level?: { buckets?: Array<{ key: number }> };
          ancestor_ids?: { buckets?: Array<{ key: number }> };
        }>;
      };
    };
  };

  if (!nestedAgg?.nested_categories?.data?.buckets) {
    return { childCategories, siblingCategories };
  }

  // Get current category information
  const currentCategoryNode = categoryPath.nodes[categoryPath.nodes.length - 1];
  const currentCategoryId = currentCategoryNode?.categoryId;
  const currentCategoryLevel = currentCategoryNode?.categoryLevel || 0;
  const currentCategoryIds = categoryPath.ids.categoryIds || [];
  const parentCategoryId =
    categoryPath.nodes.length > 1
      ? categoryPath.nodes[categoryPath.nodes.length - 2]?.categoryId
      : undefined;

  // Process each category bucket
  nestedAgg.nested_categories.data.buckets.forEach((bucket) => {
    // Extract metadata
    const categoryId = bucket.category_id?.buckets?.[0]?.key || 0;
    const categorySlug = bucket.category_slug?.buckets?.[0]?.key || bucket.key.toLowerCase().replace(/\s+/g, '-');
    const categoryPathStr = bucket.category_path?.buckets?.[0]?.key || '';
    const categoryLevel = bucket.category_level?.buckets?.[0]?.key || 1;
    const ancestorIds = bucket.ancestor_ids?.buckets?.map((b) => b.key) || [];

    // Exclude current category
    if (currentCategoryId && categoryId === currentCategoryId) {
      return;
    }

    // Determine if it's a child or sibling
    let isChild = false;
    let isSibling = false;

    // Child category: categoryLevel is currentLevel + 1 AND currentCategoryId is in ancestorIds
    if (categoryLevel === currentCategoryLevel + 1 && currentCategoryId !== undefined && ancestorIds.includes(currentCategoryId)) {
      isChild = true;
    }
    // Sibling category: same level, different parent, not current category
    else if (categoryLevel === currentCategoryLevel && !currentCategoryIds.includes(categoryId)) {
      // Check if it has the same parent (or is at root level)
      if (parentCategoryId) {
        // If current category has a parent, sibling should also have the same parent
        if (ancestorIds.includes(parentCategoryId) || ancestorIds.length === 0) {
          isSibling = true;
        }
      } else {
        // Both are root level categories
        if (categoryLevel === 1) {
          isSibling = true;
        }
      }
    }

    // Only add if it's a child or sibling
    if (isChild || isSibling) {
      const categoryOption: CategoryFilterOption = {
        label: bucket.key,
        value: bucket.key,
        count: bucket.doc_count,
        selected: false,
        categoryId,
        categoryPath: categoryPathStr || (isChild ? `${currentCategoryPath.join("/")}/${categorySlug}` : `/${categorySlug}`),
        categorySlug,
        isChild,
        isSibling,
      };

      if (isChild) {
        childCategories.push(categoryOption);
      } else if (isSibling) {
        siblingCategories.push(categoryOption);
      }
    }
  });

  return { childCategories, siblingCategories };
}

/**
 * Format variant attributes aggregation
 */
export function formatVariantAttributesAggregation(
  aggregations: Record<string, AggregationResult> | undefined
): VariantAttributeGroup[] {
  if (!aggregations) {
    return [];
  }

  return Object.entries(aggregations).map(([attributeName, aggregation]) => {
    const options =
      aggregation?.data?.buckets?.map((bucket) => ({
        label: bucket.key,
        value: bucket.key,
        count: bucket.doc_count,
        selected: false,
      })) || [];

    return {
      attributeName,
      options,
    };
  });
}

/**
 * Format product specifications aggregation
 */
export function formatProductSpecificationsAggregation(
  aggregations: Record<string, AggregationResult> | undefined
): ProductSpecificationGroup[] {
  if (!aggregations) {
    return [];
  }

  return Object.entries(aggregations).map(([specKey, aggregation]) => {
    // Handle nested aggregation structure
    const nestedAgg = aggregation as {
      nested_specs?: {
        filtered_by_key?: {
          data?: { buckets?: Array<{ key: string; doc_count: number }> };
        };
      };
    };

    const options =
      nestedAgg?.nested_specs?.filtered_by_key?.data?.buckets?.map((bucket) => ({
        label: bucket.key,
        value: bucket.key,
        count: bucket.doc_count,
        selected: false,
      })) || [];

    return {
      specKey,
      specName: specKey, // Could be improved with a mapping
      options,
    };
  });
}

/**
 * Format all aggregations for filter components
 */
export function formatAllAggregations(
  aggregations: FilterAggregations | null,
  categoryPath: CategoryPath,
  currentCategoryPath: string[]
): {
  brands: BrandFilterOption[];
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[];
  variantAttributeGroups: VariantAttributeGroup[];
  productSpecificationGroups: ProductSpecificationGroup[];
} {
  if (!aggregations) {
    return {
      brands: [],
      childCategories: [],
      siblingCategories: [],
      variantAttributeGroups: [],
      productSpecificationGroups: [],
    };
  }

  const brands = formatBrandsAggregation(
    aggregations.brands,
    currentCategoryPath
  );

  const { childCategories, siblingCategories } = formatCategoriesAggregation(
    aggregations.categories,
    categoryPath,
    currentCategoryPath
  );

  const variantAttributeGroups = formatVariantAttributesAggregation(
    aggregations.variantAttributes as Record<string, AggregationResult> | undefined
  );

  const productSpecificationGroups = formatProductSpecificationsAggregation(
    aggregations.productSpecifications as Record<string, AggregationResult> | undefined
  );

  return {
    brands,
    childCategories,
    siblingCategories,
    variantAttributeGroups,
    productSpecificationGroups,
  };
}

