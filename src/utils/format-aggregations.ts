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
  FilterOption,
  ProductSpecificationGroup,
  VariantAttributeGroup,
} from "@/types/category-filters";

/**
 * Format brands aggregation
 */
export function formatBrandsAggregation(
  aggregation: AggregationResult | undefined,
  currentCategoryPath: string[]
): BrandFilterOption[] {
  if (!aggregation?.data?.buckets) {
    return [];
  }

  return aggregation.data.buckets.map(bucket => {
    // Build navigation path preserving category context
    let navigationPath: string;

    // Validate currentCategoryPath is an array
    const categoryPath = Array.isArray(currentCategoryPath)
      ? currentCategoryPath
      : [];

    if (categoryPath.length === 0) {
      // No category context - navigate to brand landing page
      navigationPath = `/brands/${encodeURIComponent(bucket.key)}`;
    } else {
      // Preserve full category path
      // Normalize category path (remove leading/trailing slashes, filter empty strings)
      const normalizedPath = categoryPath
        .filter(slug => slug && slug.trim().length > 0)
        .map(slug => slug.trim());

      const categoryPathStr = normalizedPath.join("/");
      navigationPath = `/brands/${encodeURIComponent(bucket.key)}/${categoryPathStr}`;
    }

    return {
      label: bucket.key,
      value: bucket.key,
      count: bucket.doc_count,
      selected: false,
      brandName: bucket.key,
      navigationPath,
    };
  });
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
  // OpenSearch returns filter aggregations with this structure:
  // aggregation.filter.nested_categories.data.buckets
  // But we also handle direct access for backwards compatibility
  const nestedAgg = aggregation as {
    filter?: {
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
    // Also check direct nested_categories (for backwards compatibility or different query structures)
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
    // Some aggregations might have data directly
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

  // Try multiple paths to find the nested categories data
  // Priority: filter.nested_categories > nested_categories > direct data
  let nestedCategories:
    | {
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
      }
    | undefined;

  if (nestedAgg?.filter?.nested_categories) {
    // Most common case: filter wrapper with nested_categories
    nestedCategories = nestedAgg.filter.nested_categories;
  } else if (nestedAgg?.nested_categories) {
    // Direct nested_categories (no filter wrapper)
    nestedCategories = nestedAgg.nested_categories;
  } else if (nestedAgg?.data) {
    // Direct data structure (unlikely but possible)
    // Wrap it to match expected structure
    nestedCategories = { data: nestedAgg.data };
  }

  // Debug logging in development to help diagnose structure issues
  if (process.env.NODE_ENV === "development") {
    if (!nestedCategories?.data?.buckets && aggregation) {
      console.warn(
        "[formatCategoriesAggregation] No category buckets found. Aggregation structure:",
        {
          hasFilter: !!nestedAgg?.filter,
          hasNestedCategories: !!nestedAgg?.nested_categories,
          hasData: !!nestedAgg?.data,
          aggregationKeys: Object.keys(aggregation || {}),
          fullAggregation: aggregation, // Log full structure for debugging
        }
      );
    } else if (nestedCategories?.data?.buckets) {
      console.log("[formatCategoriesAggregation] Found categories:", {
        bucketCount: nestedCategories.data.buckets.length,
        firstBucket: nestedCategories.data.buckets[0],
      });
    }
  }

  if (!nestedCategories?.data?.buckets) {
    return { childCategories, siblingCategories };
  }

  // Get current category information
  // Handle empty category path (e.g., on brand landing page)
  const hasCategoryPath = categoryPath.nodes && categoryPath.nodes.length > 0;
  const currentCategoryNode = hasCategoryPath
    ? categoryPath.nodes[categoryPath.nodes.length - 1]
    : undefined;
  const currentCategoryId = currentCategoryNode?.categoryId;
  const currentCategoryLevel = currentCategoryNode?.categoryLevel || 0;
  const currentCategoryIds = categoryPath.ids?.categoryIds || [];
  const parentCategoryId =
    hasCategoryPath && categoryPath.nodes.length > 1
      ? categoryPath.nodes[categoryPath.nodes.length - 2]?.categoryId
      : undefined;

  // Process each category bucket
  nestedCategories.data.buckets.forEach(bucket => {
    // Extract metadata
    const categoryId = bucket.category_id?.buckets?.[0]?.key || 0;
    const categorySlug =
      bucket.category_slug?.buckets?.[0]?.key ||
      bucket.key.toLowerCase().replace(/\s+/g, "-");
    const categoryPathStr = bucket.category_path?.buckets?.[0]?.key || "";
    const categoryLevel = bucket.category_level?.buckets?.[0]?.key || 1;
    const ancestorIds = bucket.ancestor_ids?.buckets?.map(b => b.key) || [];

    // Exclude current category
    if (currentCategoryId && categoryId === currentCategoryId) {
      return;
    }

    // Determine if it's a child or sibling
    let isChild = false;
    let isSibling = false;

    // If no current category (e.g., brand landing page), show all top-level categories
    if (!hasCategoryPath || !currentCategoryId) {
      // Show top-level categories (level 1) as potential filters
      if (categoryLevel === 1) {
        isSibling = true;
      }
    } else {
      // Child category: categoryLevel is currentLevel + 1 AND currentCategoryId is in ancestorIds
      if (
        categoryLevel === currentCategoryLevel + 1 &&
        currentCategoryId !== undefined &&
        ancestorIds.includes(currentCategoryId)
      ) {
        isChild = true;
      }
      // Sibling category: same level, different parent, not current category
      else if (
        categoryLevel === currentCategoryLevel &&
        !currentCategoryIds.includes(categoryId)
      ) {
        // Check if it has the same parent (or is at root level)
        if (parentCategoryId) {
          // If current category has a parent, sibling should also have the same parent
          if (
            ancestorIds.includes(parentCategoryId) ||
            ancestorIds.length === 0
          ) {
            isSibling = true;
          }
        } else {
          // Both are root level categories
          if (categoryLevel === 1) {
            isSibling = true;
          }
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
        categoryPath:
          categoryPathStr ||
          (isChild
            ? `${currentCategoryPath.join("/")}/${categorySlug}`
            : `/${categorySlug}`),
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
      aggregation?.data?.buckets?.map(bucket => ({
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
      nestedAgg?.nested_specs?.filtered_by_key?.data?.buckets?.map(bucket => ({
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
 * Format catalog codes aggregation
 */
export function formatCatalogCodesAggregation(
  aggregation: AggregationResult | undefined
): FilterOption[] {
  if (!aggregation?.data?.buckets) {
    return [];
  }

  return aggregation.data.buckets.map(bucket => ({
    label: bucket.key,
    value: bucket.key,
    count: bucket.doc_count,
    selected: false,
  }));
}

/**
 * Format equipment codes aggregation
 */
export function formatEquipmentCodesAggregation(
  aggregation: AggregationResult | undefined
): FilterOption[] {
  if (!aggregation?.data?.buckets) {
    return [];
  }

  return aggregation.data.buckets.map(bucket => ({
    label: bucket.key,
    value: bucket.key,
    count: bucket.doc_count,
    selected: false,
  }));
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
  catalogCodes: FilterOption[];
  equipmentCodes: FilterOption[];
} {
  if (!aggregations) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[formatAllAggregations] No aggregations provided");
    }
    return {
      brands: [],
      childCategories: [],
      siblingCategories: [],
      variantAttributeGroups: [],
      productSpecificationGroups: [],
      catalogCodes: [],
      equipmentCodes: [],
    };
  }

  try {
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
      aggregations.variantAttributes as
        | Record<string, AggregationResult>
        | undefined
    );

    const productSpecificationGroups = formatProductSpecificationsAggregation(
      aggregations.productSpecifications as
        | Record<string, AggregationResult>
        | undefined
    );

    const catalogCodes = formatCatalogCodesAggregation(
      aggregations.catalogCodes
    );
    const equipmentCodes = formatEquipmentCodesAggregation(
      aggregations.equipmentCodes
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[formatAllAggregations] Formatted filters:", {
        brandsCount: brands.length,
        childCategoriesCount: childCategories.length,
        siblingCategoriesCount: siblingCategories.length,
        variantAttributeGroupsCount: variantAttributeGroups.length,
        productSpecificationGroupsCount: productSpecificationGroups.length,
        catalogCodesCount: catalogCodes.length,
        equipmentCodesCount: equipmentCodes.length,
        hasCategoriesAggregation: !!aggregations.categories,
      });
    }

    return {
      brands,
      childCategories,
      siblingCategories,
      variantAttributeGroups,
      productSpecificationGroups,
      catalogCodes,
      equipmentCodes,
    };
  } catch (error) {
    console.error(
      "[formatAllAggregations] Error formatting aggregations:",
      error
    );
    // Return empty arrays on error to prevent UI crash
    return {
      brands: [],
      childCategories: [],
      siblingCategories: [],
      variantAttributeGroups: [],
      productSpecificationGroups: [],
      catalogCodes: [],
      equipmentCodes: [],
    };
  }
}
