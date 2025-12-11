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
  currentCategoryPath: string[],
  currentBrandSlug?: string
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
      selected: currentBrandSlug ? bucket.key === currentBrandSlug : false,
      brandName: bucket.key,
      navigationPath,
    };
  });
}

/**
 * Format categories for hierarchical display
 * Shows only children of current category level
 */
export function formatCategoriesAggregation(
  aggregation: AggregationResult | undefined,
  categoryPath: CategoryPath,
  _currentCategoryPath: string[]
): {
  childCategories: CategoryFilterOption[];
  siblingCategories: CategoryFilterOption[]; // Empty - kept for backward compatibility
} {
  const childCategories: CategoryFilterOption[] = [];

  // Extract buckets from aggregation (handle multiple structures)
  const buckets = extractCategoryBuckets(aggregation);
  if (!buckets || buckets.length === 0) {
    return { childCategories, siblingCategories: [] };
  }

  // Get current category information
  const hasCategoryPath = categoryPath.nodes && categoryPath.nodes.length > 0;
  const currentCategoryNode = hasCategoryPath
    ? categoryPath.nodes[categoryPath.nodes.length - 1]
    : undefined;
  const currentCategoryId = currentCategoryNode?.categoryId;
  const currentLevel = currentCategoryNode?.categoryLevel ?? -1; // -1 = root (no category)

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("[formatCategoriesAggregation] Processing categories:", {
      currentLevel,
      currentCategoryId,
      bucketCount: buckets.length,
    });
  }

  // Process each category bucket
  buckets.forEach((bucket: any) => {
    const [categoryId, _categoryName, categorySlug, categoryLevel] = extractBucketData(bucket);

    // Skip current category
    if (categoryId === currentCategoryId) return;

    // ROOT LEVEL: Show only level 0 categories
    if (currentLevel === -1) {
      if (categoryLevel === 0) {
        childCategories.push(buildCategoryOption(bucket, categorySlug));
      }
      return;
    }

    // CATEGORY SELECTED: Show direct children (currentLevel + 1)
    // Check if this category is a child of current category
    const parentId = extractParentId(bucket);
    const ancestorIds = extractAncestorIds(bucket);

    // A category is a direct child if:
    // 1. Its level is currentLevel + 1, AND
    // 2. Either its parentId matches currentCategoryId OR currentCategoryId is in ancestorIds
    const isDirectChild =
      categoryLevel === currentLevel + 1 &&
      (parentId === currentCategoryId || ancestorIds.includes(currentCategoryId!));

    if (isDirectChild) {
      childCategories.push(buildCategoryOption(bucket, categorySlug));
    }
  });

  return { childCategories, siblingCategories: [] };
}

/**
 * Extract category buckets from aggregation (handles multiple structures)
 */
function extractCategoryBuckets(aggregation: any) {
  // Handle nested aggregation structures
  if (aggregation?.filter?.categories?.buckets) {
    return aggregation.filter.categories.buckets;
  }
  if (aggregation?.categories?.buckets) {
    return aggregation.categories.buckets;
  }
  if (aggregation?.filter?.nested_categories?.data?.buckets) {
    return aggregation.filter.nested_categories.data.buckets;
  }
  if (aggregation?.nested_categories?.data?.buckets) {
    return aggregation.nested_categories.data.buckets;
  }
  return aggregation?.data?.buckets || [];
}

/**
 * Extract category data from bucket (handles multi_terms and nested)
 */
function extractBucketData(bucket: any): [number, string, string, number] {
  if (Array.isArray(bucket.key)) {
    // Multi_terms: [categoryId, categoryName, categorySlug, categoryLevel]
    return [
      Number(bucket.key[0]) || 0,
      String(bucket.key[1]),
      String(bucket.key[2]),
      Number(bucket.key[3]) || 0
    ];
  }
  // Nested aggregation (fallback)
  return [
    bucket.category_id?.buckets?.[0]?.key || 0,
    bucket.key,
    bucket.category_slug?.buckets?.[0]?.key || bucket.key.toLowerCase().replace(/\s+/g, "-"),
    bucket.category_level?.buckets?.[0]?.key || 0
  ];
}

/**
 * Extract ancestor IDs from bucket
 */
function extractAncestorIds(bucket: any): number[] {
  if (Array.isArray(bucket.key) && bucket.key[5]) {
    // If ancestorIds is in multi_terms (6th element, after parentId)
    return Array.isArray(bucket.key[5]) ? bucket.key[5] : [];
  }
  return bucket.ancestor_ids?.buckets?.map((b: any) => b.key) || [];
}

/**
 * Extract parent ID from bucket
 */
function extractParentId(bucket: any): number | undefined {
  if (Array.isArray(bucket.key) && bucket.key[4] !== undefined) {
    // Multi_terms: [categoryId, categoryName, categorySlug, categoryLevel, parentId]
    // parentId is at index 4
    return bucket.key[4] !== null ? Number(bucket.key[4]) : undefined;
  }
  return bucket.parent_id?.buckets?.[0]?.key;
}

/**
 * Build category filter option from bucket
 */
function buildCategoryOption(bucket: any, categorySlug: string): CategoryFilterOption {
  const [categoryId, categoryName] = extractBucketData(bucket);

  return {
    label: categoryName,
    value: categoryName,
    count: bucket.doc_count,
    selected: false,
    categoryId,
    categoryPath: `/${categorySlug}`, // Flat URL structure
    categorySlug,
    isChild: true,
    isSibling: false,
  };
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
  currentCategoryPath: string[],
  currentBrandSlug?: string
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
      currentCategoryPath,
      currentBrandSlug
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

