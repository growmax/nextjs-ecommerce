import BrandResolutionService from "@/lib/services/BrandResolutionService";
import CategoryResolutionService, { CategoryNode } from "@/lib/services/CategoryResolutionService";
import { MetadataRoute } from "next";

/**
 * Generate sitemap for categories and brands
 * Supports unlimited depth categories and brand pages
 * 
 * Revalidates every 6 hours to include new categories/brands
 */
export const revalidate = 21600; // 6 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  const locales = ["en"]; // Add more locales as needed

  const sitemapEntries: MetadataRoute.Sitemap = [];

  try {
    // Note: Sitemap generation runs at build time, so tenant context may not be available
    // Services will return empty arrays if no tenant code is provided
    // In production, you may want to generate sitemaps per tenant or use a default tenant
    const categoryTree = await CategoryResolutionService.getCategoryTree();

    // Get all brands
    const brands = await BrandResolutionService.getAllBrands();

    // Generate category URLs (recursive, unlimited depth)
    const generateCategoryUrls = (
      nodes: CategoryNode[],
      parentPath: string[] = [],
      locale: string,
      maxDepth: number = 5 // Limit depth for sitemap performance
    ) => {
      nodes.forEach((node) => {
        const currentPath = [...parentPath, node.slug];
        const url = `${baseUrl}/${locale}/${currentPath.join("/")}`;
        const depth = currentPath.length;

        sitemapEntries.push({
          url,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: Math.max(0.1, 1 - depth * 0.15), // Decrease priority for deeper categories
        });

        // Recursively process children (up to maxDepth)
        if (node.children && node.children.length > 0 && depth < maxDepth) {
          generateCategoryUrls(node.children, currentPath, locale, maxDepth);
        }
      });
    };

    // Generate brand URLs
    const generateBrandUrls = (locale: string) => {
      brands.forEach((brand) => {
        // Brand landing page
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/brands/${brand.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });

        // Brand + category combinations (limit to top 2 levels for performance)
        const generateBrandCategoryUrls = (
          nodes: CategoryNode[],
          parentPath: string[] = [],
          depth: number = 0,
          maxDepth: number = 2
        ) => {
          if (depth >= maxDepth) return;

          nodes.forEach((node) => {
            const currentPath = [...parentPath, node.slug];
            const url = `${baseUrl}/${locale}/brands/${brand.slug}/${currentPath.join("/")}`;

            sitemapEntries.push({
              url,
              lastModified: new Date(),
              changeFrequency: "weekly" as const,
              priority: Math.max(0.1, 0.7 - depth * 0.15),
            });

            // Recursively process children
            if (node.children && node.children.length > 0) {
              generateBrandCategoryUrls(
                node.children,
                currentPath,
                depth + 1,
                maxDepth
              );
            }
          });
        };

        // Add brand + category combinations for top categories only
        categoryTree.slice(0, 10).forEach((majorCategory) => {
          generateBrandCategoryUrls([majorCategory]);
        });
      });
    };

    // Generate URLs for each locale
    for (const locale of locales) {
      // Category URLs
      generateCategoryUrls(categoryTree, [], locale);

      // Brand URLs
      generateBrandUrls(locale);
    }

    // Limit total sitemap entries to 50,000 (Google's limit)
    // Prioritize top-level categories and popular brands
    const sortedEntries = sitemapEntries.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return 0;
    });

    return sortedEntries.slice(0, 50000);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return empty sitemap on error
    return [];
  }
}

