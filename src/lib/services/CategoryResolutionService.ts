import { RequestContext } from "@/lib/api/client";
import SearchService from "@/lib/api/services/SearchService/SearchService";
import { Metadata } from "next";

/**
 * Category hierarchy structure
 * Supports N-level nesting using categoryPath and ancestorIds
 */
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  categoryId: number; // The actual category ID from product_categories
  categoryLevel: number; // Level in hierarchy (1, 2, 3, etc.)
  categoryPath?: string; // Full path string like "Electronics > Computers > Laptops"
  ancestorIds: number[]; // Array of parent category IDs
  parentId?: string; // Direct parent ID (for backward compatibility)
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  children?: CategoryNode[];
}

export interface CategoryPath {
  nodes: CategoryNode[];
  fullPath: string;
  slugs: string[];
  ids: {
    categoryIds: number[]; // Array of category IDs from the path
  };
}

export interface CategoryMetadata {
  title: string;
  description: string;
  canonical: string;
  breadcrumbs: BreadcrumbItem[];
  structuredData: {
    "@context": string;
    "@type": string;
    name: string;
    description?: string;
    breadcrumb?: {
      "@type": string;
      itemListElement: Array<{
        "@type": string;
        position: number;
        name: string;
        item: string;
      }>;
    };
  };
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

class CategoryResolutionService {
  private static instance: CategoryResolutionService;

  private constructor() { }

  public static getInstance(): CategoryResolutionService {
    if (!CategoryResolutionService.instance) {
      CategoryResolutionService.instance = new CategoryResolutionService();
    }
    return CategoryResolutionService.instance;
  }

  /**
   * Generate slug from category name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Build category tree from CategoryNode array using ancestorIds and categoryPath
   * Supports N-level nesting
   */
  private buildCategoryTree(
    categories: CategoryNode[],
    categoryMap: Map<number, CategoryNode>
  ): CategoryNode[] {
    // Sort categories by level (root categories first)
    const sortedCategories = [...categories].sort(
      (a, b) => a.categoryLevel - b.categoryLevel
    );

    // Build parent-child relationships using ancestorIds
    sortedCategories.forEach(node => {
      // Find parent using the last ancestor ID
      if (node.ancestorIds.length > 0) {
        const parentId = node.ancestorIds[node.ancestorIds.length - 1];
        if (parentId !== undefined) {
          const parent = categoryMap.get(parentId);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(node);
          }
        }
      }
    });

    // Return root categories (categories with no ancestors or level 1)
    const rootCategories = sortedCategories.filter(
      node => node.ancestorIds.length === 0 || node.categoryLevel === 1
    );

    // If no root categories found by ancestorIds, try using categoryPath
    if (rootCategories.length === 0) {
      // Parse categoryPath to find root categories
      const pathMap = new Map<string, CategoryNode[]>();
      sortedCategories.forEach(node => {
        if (node.categoryPath) {
          const pathParts = node.categoryPath.split(" > ");
          const rootName = pathParts[0];
          if (rootName) {
            if (!pathMap.has(rootName)) {
              pathMap.set(rootName, []);
            }
            const existing = pathMap.get(rootName);
            if (existing) {
              existing.push(node);
            }
          }
        }
      });

      // Build tree from categoryPath
      const rootNodes: CategoryNode[] = [];
      const processedNodes = new Set<number>();

      sortedCategories.forEach(node => {
        if (processedNodes.has(node.categoryId)) {
          return;
        }

        if (node.categoryPath) {
          const pathParts = node.categoryPath.split(" > ");
          let currentParent: CategoryNode | null = null;

          pathParts.forEach((part, index) => {
            const matchingNode = sortedCategories.find(
              n => n.name === part && !processedNodes.has(n.categoryId)
            );

            if (matchingNode) {
              processedNodes.add(matchingNode.categoryId);
              if (index === 0) {
                // Root level
                if (!rootNodes.find(n => n.id === matchingNode.id)) {
                  rootNodes.push(matchingNode);
                }
                currentParent = matchingNode;
              } else if (currentParent) {
                // Child level
                if (!currentParent.children) {
                  currentParent.children = [];
                }
                if (
                  !currentParent.children.find(n => n.id === matchingNode.id)
                ) {
                  currentParent.children.push(matchingNode);
                }
                currentParent = matchingNode;
              }
            }
          });
        } else {
          // No categoryPath, use ancestorIds
          if (node.ancestorIds.length === 0) {
            rootNodes.push(node);
          }
        }
      });

      return rootNodes.length > 0 ? rootNodes : sortedCategories;
    }

    return rootCategories;
  }

  /**
   * Get category tree from OpenSearch using nested aggregations on product_categories
   * With Redis caching for improved performance
   */
  async getCategoryTree(context?: RequestContext): Promise<CategoryNode[]> {
    // Get elasticCode from context to build elastic index
    const elasticCode = context?.elasticCode || "";
    /* if (!elasticCode) {
      console.warn("No elasticCode provided for category aggregation query");
      return [];
    } */

    const cacheKey = `category:tree:${elasticCode}`;

    // Use cached version if available (server-side only)
    if (typeof window === "undefined") {
      try {
        const { withRedisCache } = await import("@/lib/cache");
        // Cache category tree for 1 hour (3600 seconds)
        // Category tree structure changes infrequently
        return withRedisCache(
          cacheKey,
          () => this.getCategoryTreeUncached(context),
          3600 // 1 hour TTL
        );
      } catch {
        // Fall through to non-cached version if cache import fails
      }
    }

    return this.getCategoryTreeUncached(context);
  }

  /**
   * Internal method - get category tree without caching
   */
  private async getCategoryTreeUncached(
    context?: RequestContext
  ): Promise<CategoryNode[]> {
    try {
      // Get elasticCode from context to build elastic index
      // Build elastic index from elasticCode or fallback to sandbox default
      const elasticCode = context?.elasticCode || "";
      const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "sandboxpgandproducts";

      console.log("Using elastic index for category tree:", elasticIndex);

      // Build OpenSearch aggregation query with nested aggregations on product_categories
      const query = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                term: {
                  is_published: 1,
                },
              },
            ],
            must_not: [
              {
                match: {
                  pg_index_name: {
                    query: "PrdGrp0*",
                  },
                },
              },
              {
                term: {
                  is_internal: true,
                },
              },
            ],
          },
        },
        aggs: {
          product_categories: {
            nested: {
              path: "product_categories",
            },
            aggs: {
              categories: {
                terms: {
                  field: "product_categories.categoryId",
                  size: 10000,
                },
                aggs: {
                  category_name: {
                    terms: {
                      field: "product_categories.categoryName.keyword",
                      size: 1,
                    },
                  },
                  category_slug: {
                    terms: {
                      field: "product_categories.categorySlug.keyword",
                      size: 1,
                    },
                  },
                  category_path: {
                    terms: {
                      field: "product_categories.categoryPath.keyword",
                      size: 1,
                    },
                  },
                  category_level: {
                    terms: {
                      field: "product_categories.categoryLevel",
                      size: 1,
                    },
                  },
                  ancestor_ids: {
                    terms: {
                      field: "product_categories.ancestorIds",
                      size: 100, // Support up to 100 ancestor IDs
                    },
                  },
                  is_active: {
                    terms: {
                      field: "product_categories.isActive",
                      size: 1,
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Fetch categories from OpenSearch
      const result = await SearchService.getAggregations(
        elasticIndex,
        query,
        context
      );

      if (!result.success || !result.aggregations) {
        console.error("Failed to fetch categories from OpenSearch");
        return [];
      }

      // Transform aggregation results to CategoryNode format
      const categoryMap = new Map<number, CategoryNode>();
      const categories: CategoryNode[] = [];

      // Process nested aggregation results
      // Structure: aggregations.product_categories.categories.buckets
      const nestedAggs = result.aggregations.product_categories as any;
      
      if (nestedAggs?.categories?.buckets) {
        nestedAggs.categories.buckets.forEach((bucket: any) => {
          const categoryId = bucket.key;
          const categoryName = bucket.category_name?.buckets?.[0]?.key || "";
          const categorySlug = bucket.category_slug?.buckets?.[0]?.key || "";
          const categoryPath = bucket.category_path?.buckets?.[0]?.key || "";
          const categoryLevel = bucket.category_level?.buckets?.[0]?.key || 1;
          const ancestorIds =
            bucket.ancestor_ids?.buckets?.map((b: any) => b.key) || [];
          
          // Derive parentId from ancestorIds: the last ancestor is the direct parent
          // For categories with no ancestors, parentId is null (root categories)
          const parentId = ancestorIds.length > 0 
            ? ancestorIds[ancestorIds.length - 1] 
            : null;
          
          if (process.env.NODE_ENV === "development" && categoryId === 28) {
            console.log("[CategoryResolutionService] Power Tools (28) - Raw bucket data:", {
              categoryId,
              categoryName,
              categoryLevel,
              ancestorIdsFromBucket: bucket.ancestor_ids,
              ancestorIdsProcessed: ancestorIds,
              derivedParentId: parentId,
              bucketKeys: Object.keys(bucket),
            });
          }
          
          const isActive = bucket.is_active?.buckets?.[0]?.key !== false;

          if (categoryId && categoryName && isActive) {
            const node: CategoryNode = {
              id: String(categoryId),
              name: categoryName,
              slug: categorySlug || this.generateSlug(categoryName),
              categoryId: categoryId,
              categoryLevel: categoryLevel,
              ...(categoryPath && { categoryPath }),
              ancestorIds: ancestorIds,
              ...(parentId !== null && {
                parentId: String(parentId),
              }),
              isActive: isActive,
              children: [],
            };

            if (process.env.NODE_ENV === "development" && categoryId === 28) {
              console.log("[CategoryResolutionService] Created Power Tools node:", node);
            }

            categoryMap.set(categoryId, node);
            categories.push(node);
          }
        });
      }

      // Build tree using ancestorIds and categoryPath
      const tree = this.buildCategoryTree(categories, categoryMap);
      return tree;
    } catch (error) {
      console.error("Error fetching categories from OpenSearch:", error);
      return [];
    }
  }

  /**
   * Find category by slug directly from OpenSearch
   * More efficient than building full category tree
   * Uses nested aggregation to query only the specific category
   */
  async findCategoryBySlugDirect(
    slug: string,
    context?: RequestContext
  ): Promise<CategoryNode | null> {
    try {
      // Build elastic index from elasticCode or fallback to sandbox default
      const elasticCode = context?.elasticCode || "";
      const elasticIndex = elasticCode ? `${elasticCode}pgandproducts` : "sandboxpgandproducts";

      console.log("Using elastic index for category lookup:", elasticIndex);
      const normalizedSlug = slug.toLowerCase();

      // Query with aggregation to get category details directly
      const query = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                term: {
                  is_published: 1,
                },
              },
              {
                term: {
                  "product_categories.categorySlug.keyword": normalizedSlug,
                },
              },
            ],
            must_not: [
              {
                match: {
                  pg_index_name: {
                    query: "PrdGrp0*",
                  },
                },
              },
              {
                term: {
                  is_internal: true,
                },
              },
            ],
          },
        },
        aggs: {
          category_info: {
            multi_terms: {
              terms: [
                { field: "product_categories.categoryId" },
                { field: "product_categories.categoryName.keyword" },
                { field: "product_categories.categorySlug.keyword" },
                { field: "product_categories.categoryPath.keyword" },
                { field: "product_categories.categoryLevel" },
                { field: "product_categories.isActive" },
              ],
              size: 1,
            },
            aggs: {
              ancestor_ids: {
                terms: {
                  field: "product_categories.ancestorIds",
                  size: 100,
                },
              },
            },
          },
        },
      };

      // Validate elasticIndex before making API call
      if (!elasticIndex || elasticIndex === "pgandproducts") {
        console.warn(
          "Invalid elastic index for category lookup:",
          elasticIndex
        );
        return null;
      }

      const result = await SearchService.getAggregations(
        elasticIndex,
        query,
        context
      );

      if (!result.success || !result.aggregations) {
        return null;
      }

      // Extract category from aggregation
      // Multi_terms returns buckets with key as array: [categoryId, categoryName, categorySlug, categoryPath, categoryLevel, isActive]
      const categoryInfo = result.aggregations.category_info as any;
      const buckets = categoryInfo?.buckets;

      if (!buckets || buckets.length === 0) {
        return null;
      }

      // Get the first bucket (should only be one since we filtered by slug)
      const bucket = buckets[0];

      // Multi_terms key is an array
      if (!Array.isArray(bucket.key) || bucket.key.length < 6) {
        return null;
      }

      const categoryId = Number(bucket.key[0]);
      const categoryName = String(bucket.key[1]);
      const categorySlug = String(bucket.key[2]);
      const categoryPath = String(bucket.key[3]);
      const categoryLevel = Number(bucket.key[4]);
      const isActive = bucket.key[5] !== false;
      
      // Extract ancestorIds from nested aggregation
      const ancestorIds = (bucket.ancestor_ids?.buckets || []).map((b: any) => Number(b.key));
      
      // Derive parentId: last ancestor is direct parent
      const parentId = ancestorIds.length > 0 ? ancestorIds[ancestorIds.length - 1] : null;

      if (!categoryId || !categoryName || !isActive) {
        return null;
      }

      if (process.env.NODE_ENV === "development" && categoryId === 28) {
        console.log("[CategoryResolutionService.findCategoryBySlugDirect] Power Tools (28):", {
          categoryId,
          categoryName,
          categoryLevel,
          ancestorIds,
          parentId,
        });
      }

      return {
        id: String(categoryId),
        name: categoryName,
        slug: categorySlug || normalizedSlug,
        categoryId: categoryId,
        categoryLevel: categoryLevel,
        ...(categoryPath && { categoryPath }),
        ancestorIds: ancestorIds,
        ...(parentId !== null && { parentId: String(parentId) }),
        isActive: isActive,
        children: [],
      };
    } catch (error) {
      console.error(
        `[CategoryResolutionService] Error finding category by slug "${slug}":`,
        error
      );
      return null;
    }
  }

  /**
   * Helper function to find a category by slug in the tree recursively
   * Used as fallback when direct query is not available
   */
  private findCategoryInTree(
    tree: CategoryNode[],
    slug: string
  ): CategoryNode | null {
    for (const node of tree) {
      if (node.slug === slug) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findCategoryInTree(node.children, slug);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Find category by slug
   * Uses optimized direct query instead of building full tree
   */
  async findCategoryBySlug(
    slug: string,
    context?: RequestContext
  ): Promise<CategoryNode | null> {
    // Use direct query for better performance
    return this.findCategoryBySlugDirect(slug, context);
  }

  /**
   * Resolve category slugs to category path with Redis caching
   * Optimized to use direct queries instead of fetching all categories
   */
  async resolveCategories(
    slugs: string[],
    context?: RequestContext
  ): Promise<CategoryPath | null> {
    if (!slugs || slugs.length === 0) {
      return null;
    }

    // Generate cache key
    const elasticCode = context?.elasticCode || "";
    const cacheKey = `category:resolve:${elasticCode}:${slugs.join("/")}`;
    // Use cached version if available (server-side only)
    if (typeof window === "undefined") {
      try {
        const { withRedisCache } = await import("@/lib/cache");
        // Cache category resolution for 30 minutes (1800 seconds)
        // Categories don't change frequently
        return withRedisCache(
          cacheKey,
          () => this.resolveCategoriesUncached(slugs, context),
          1800 // 30 minutes TTL
        );
      } catch {
        // Fall through to non-cached version if cache import fails
      }
    }
    return this.resolveCategoriesUncached(slugs, context);
  }

  /**
   * Internal method - resolve categories without caching
   */
  private async resolveCategoriesUncached(
    slugs: string[],
    context?: RequestContext
  ): Promise<CategoryPath | null> {
    const nodes: CategoryNode[] = [];

    // Use direct query for each slug instead of fetching all categories
    for (const slug of slugs) {
      const found = await this.findCategoryBySlugDirect(slug, context);
      if (!found) {
        // Fallback: try searching in full tree if direct query fails
        // This handles edge cases where category might not be indexed properly
        const categoryTree = await this.getCategoryTree(context);
        const foundInTree = this.findCategoryInTree(categoryTree, slug);
        if (!foundInTree) {
          return null; // Invalid path
        }
        nodes.push(foundInTree);
      } else {
        nodes.push(found);
      }
    }

    // Validate path hierarchy using ancestorIds
    // Ensure each category's parent matches the previous category in the path
    for (let i = 1; i < nodes.length; i++) {
      const currentNode = nodes[i];
      const previousNode = nodes[i - 1];

      if (currentNode && previousNode) {
        // Check if previous node is in current node's ancestorIds
        if (
          currentNode.ancestorIds.length > 0 &&
          !currentNode.ancestorIds.includes(previousNode.categoryId)
        ) {
          // Path might be invalid, but allow it for flexibility
          // The category exists, so we'll accept the path
        }
      }
    }

    // Build full path string - always build from node names to ensure proper display
    // (database categoryPath may contain IDs like "/24/25/" instead of names)
    const fullPath = nodes.map(n => n.name).join(" > ");

    // Extract category IDs array
    const categoryIds = nodes.map(node => node.categoryId);

    return {
      nodes,
      fullPath,
      slugs,
      ids: {
        categoryIds,
      },
    };
  }

  /**
   * Get breadcrumbs for category path
   */
  getCategoryBreadcrumbs(
    categoryPath: CategoryPath,
    _locale: string = "en"
  ): BreadcrumbItem[] {
    // Note: hrefs don't include locale prefix because Link from @/i18n/navigation auto-adds it
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: `/` }];

    let currentPath = "";
    categoryPath.nodes.forEach(node => {
      currentPath += `/${node.slug}`;
      breadcrumbs.push({
        label: node.name,
        href: currentPath,
      });
    });

    return breadcrumbs;
  }

  /**
   * Generate SEO metadata for category page
   */
  async generateCategoryMetadata(
    categoryPath: CategoryPath,
    locale: string = "en",
    baseUrl: string = ""
  ): Promise<CategoryMetadata> {
    const lastNode = categoryPath.nodes[categoryPath.nodes.length - 1];
    if (!lastNode) {
      throw new Error("Category path must contain at least one node");
    }
    const title = `${lastNode.name} | ${categoryPath.fullPath}`;
    const description = `Browse ${categoryPath.fullPath.toLowerCase()} products. Find the best ${lastNode.name.toLowerCase()} at competitive prices.`;
    const canonical = `${baseUrl}/${locale}${categoryPath.slugs.map(s => `/${s}`).join("")}`;

    const breadcrumbs = this.getCategoryBreadcrumbs(categoryPath, locale);

    // Structured data for breadcrumbs
    const breadcrumbStructuredData = {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: `${baseUrl}${crumb.href}`,
      })),
    };

    // CollectionPage structured data
    const structuredData: CategoryMetadata["structuredData"] = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: lastNode.name,
      description: description,
      breadcrumb: breadcrumbStructuredData,
    };

    return {
      title,
      description,
      canonical,
      breadcrumbs,
      structuredData,
    };
  }

  /**
   * Generate Next.js metadata object
   */
  async generateNextMetadata(
    categoryPath: CategoryPath,
    locale: string = "en",
    baseUrl: string = ""
  ): Promise<Metadata> {
    const metadata = await this.generateCategoryMetadata(
      categoryPath,
      locale,
      baseUrl
    );

    return {
      title: metadata.title,
      description: metadata.description,
      alternates: {
        canonical: metadata.canonical,
      },
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        url: metadata.canonical,
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default CategoryResolutionService.getInstance();
