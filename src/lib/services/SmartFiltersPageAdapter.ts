/**
 * Smart Filters Page Adapter Service
 * 
 * Unified service for fetching Smart Filters across all page types.
 * Replaces SearchService.getFilterAggregations() and formatAllAggregations().
 * 
 * @example
 * ```typescript
 * // Category page
 * const filters = await SmartFiltersPageAdapter.getFiltersForPage({
 *   categorySlugs: ['tools', 'power-tools'],
 *   searchParams: { in_stock: 'true' },
 *   context,
 *   elasticIndex
 * });
 * 
 * // Brand page
 * const filters = await SmartFiltersPageAdapter.getFiltersForPage({
 *   brandSlug: 'dewalt',
 *   searchParams: {},
 *   context,
 *   elasticIndex
 * });
 * 
 * // Brand + Category page
 * const filters = await SmartFiltersPageAdapter.getFiltersForPage({
 *   brandSlug: 'dewalt',
 *   categorySlugs: ['tools'],
 *   searchParams: {},
 *   context,
 *   elasticIndex
 * });
 * ```
 */

import type {
  CategoryContext,
  SmartFilterResponse,
} from "@/features/smart-filters";
import SmartFilterService, {
  parseActiveFiltersFromParams,
} from "@/features/smart-filters";
import type { RequestContext } from "@/lib/api/client";
import CategoryResolutionService from "@/lib/services/CategoryResolutionService";

export interface SmartFiltersPageRequest {
  /** Brand slug (for brand pages) */
  brandSlug?: string;

  /** Category slugs array (for category pages) */
  categorySlugs?: string[];

  /** Raw search params from URL */
  searchParams: Record<string, string | string[] | undefined>;

  /** Request context (tenant info) */
  context: RequestContext;

  /** Elastic index */
  elasticIndex: string;
}

/**
 * SmartFiltersPageAdapter
 * 
 * Adapter service that provides Smart Filters for any page type.
 * Handles category resolution and brand integration automatically.
 */
export class SmartFiltersPageAdapter {
  /**
   * Get Smart Filters for any page type
   * 
   * Handles:
   * - Category pages (categorySlugs only)
   * - Brand pages (brandSlug only) 
   * - Brand + Category pages (both)
   * 
   * @param request - Page filter request configuration
   * @returns Smart filter response with ALL filter types
   */
  static async getFiltersForPage(
    request: SmartFiltersPageRequest
  ): Promise<SmartFilterResponse> {
    const { brandSlug, categorySlugs, searchParams, context, elasticIndex } =
      request;

    // Parse active filters from URL params
    const activeFilters = parseActiveFiltersFromParams(searchParams);

    // Add brand to active filters if provided (for brand pages)
    if (brandSlug) {
      activeFilters.brand = brandSlug;
    }

    // Build category context if category slugs provided
    let categoryContext: CategoryContext | null = null;

    if (categorySlugs && categorySlugs.length > 0) {
      try {
        const categoryPath = await CategoryResolutionService.resolveCategories(
          categorySlugs,
          context
        );

        if (categoryPath && categoryPath.nodes && categoryPath.nodes.length > 0) {
          const nodes = categoryPath.nodes;
          const lastNode = nodes[nodes.length - 1]!; // Non-null assertion - we checked length > 0

          // IMPORTANT: categoryLevel from database is 1-indexed:
          // Level 1 = first level children (like Power Tools)
          // Level 2 = second level children (like Drills)
          // Level 0 = root categories (like Tools)
          // 
          // Always use lastNode.categoryLevel directly - it comes from the database
          // DO NOT use nodes.length as fallback - it doesn't represent actual category level
          const level = lastNode.categoryLevel;

          if (!level && level !== 0) {
            console.warn("[SmartFiltersPageAdapter] categoryLevel not found on node:", {
              nodeName: lastNode.name,
              nodesCount: nodes.length
            });
          }

          const fullPath = nodes.map((node) => node.slug);
          const pathIds = nodes.map((node) => {
            // Handle both string and number IDs
            const id = node.id;
            return typeof id === 'string' ? parseInt(id, 10) : id;
          });

          // Handle parentId which might be string or number
          const parentIdRaw = lastNode.parentId;
          const parentId = parentIdRaw === null || parentIdRaw === undefined
            ? null
            : typeof parentIdRaw === 'string'
              ? parseInt(parentIdRaw, 10)
              : parentIdRaw;

          categoryContext = {
            categoryId: typeof lastNode.id === 'string'
              ? parseInt(lastNode.id, 10)
              : lastNode.id as number,
            categoryName: lastNode.name,
            categorySlug: lastNode.slug,
            categoryLevel: level,
            parentId: parentId as number | null,
            fullPath,
            pathIds,
          };

          if (process.env.NODE_ENV === "development") {
            console.log("[SmartFiltersPageAdapter] Category context BEFORE sending to service:", {
              categoryId: categoryContext.categoryId,
              categoryName: categoryContext.categoryName,
              categoryLevel: categoryContext.categoryLevel,
              parentId: categoryContext.parentId,
              nodesCount: nodes.length,
              lastNodeCategoryLevel: lastNode.categoryLevel,
              lastNodeParentId: lastNode.parentId,
              fullPath: categoryContext.fullPath,
            });
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("[SmartFiltersPageAdapter] No valid category path resolved");
          }
        }
      } catch (error) {
        console.error(
          "[SmartFiltersPageAdapter] Error resolving categories:",
          error
        );
        // Continue without category context - will show all level 0 categories
      }
    }

    // Fetch Smart Filters using SmartFilterService
    const response = await SmartFilterService.getFilters({
      elasticIndex,
      currentCategory: categoryContext,
      activeFilters,
      context,
    });

    return response;
  }

  /**
   * Server-safe version that returns null on error
   * Use this in Server Components and API routes
   * 
   * @param request - Page filter request configuration
   * @returns Smart filter response or null if error occurs
   */
  static async getFiltersForPageServerSide(
    request: SmartFiltersPageRequest
  ): Promise<SmartFilterResponse | null> {
    try {
      const response = await this.getFiltersForPage(request);

      // Log response status in development
      if (process.env.NODE_ENV === "development") {
        console.log("[SmartFiltersPageAdapter] Response status:", {
          success: response.success,
          hasCategoryContext: !!request.categorySlugs,
          categorySiblings: response.filters.categories.siblings.length,
          categoryChildren: response.filters.categories.children.length,
          error: response.error?.message,
        });
      }

      return response.success ? response : null;
    } catch (error) {
      console.error(
        "[SmartFiltersPageAdapter] Error fetching filters:",
        error
      );
      return null;
    }
  }
}

// Export as default for consistency with other services
export default SmartFiltersPageAdapter;
