import SearchService from "@/lib/api/services/SearchService/SearchService";
import { ProductDetail } from "@/types/product/product-detail";
import { generateProductSlug } from "@/utils/product/slug-generator";
import { MetadataRoute } from "next";

/**
 * Dynamic Sitemap for Product Pages
 *
 * Generates XML sitemap entries for all published products
 * across all locales. Helps search engines discover and index
 * product pages efficiently.
 *
 * Revalidates every 6 hours to include new products.
 */

// Revalidate sitemap every 6 hours
export const revalidate = 21600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
const SUPPORTED_LOCALES = ["en", "es", "fr"]; // TODO: Make this configurable
const BATCH_SIZE = 1000; // Fetch products in batches

/**
 * Fetch all published products for sitemap
 */
async function getAllPublishedProducts(): Promise<ProductDetail[]> {
  try {
    const tenantCode =
      process.env.TENANT_CODE ||
      process.env.NEXT_PUBLIC_TENANT_CODE ||
      "schwingstetterdemo";
    const elasticIndex = `${tenantCode.toLowerCase()}pgandproducts`;

    const allProducts: ProductDetail[] = [];
    let currentOffset = 0;
    let hasMore = true;

    // Fetch products in batches
    while (hasMore) {
      const query = {
        query: {
          bool: {
            must: [
              {
                term: {
                  is_published: 1,
                },
              },
            ],
          },
        },
        size: BATCH_SIZE,
        from: currentOffset,
        sort: [{ updated_on: { order: "desc" } }],
        _source: [
          "product_id",
          "product_index_name",
          "title",
          "brand_name",
          "brands_name",
          "updated_on",
          "is_published",
        ],
      };

      const result = await SearchService.searchProducts({
        elasticIndex,
        query,
      });

      if (result.success && result.data.length > 0) {
        allProducts.push(...(result.data as unknown as ProductDetail[]));
        currentOffset += BATCH_SIZE;

        // Check if there are more products
        hasMore = result.total > currentOffset;
      } else {
        hasMore = false;
      }

      // Safety limit: max 10,000 products in sitemap
      if (allProducts.length >= 10000) {
        hasMore = false;
      }
    }

    return allProducts;
  } catch {
    // Sitemap error logging (development only)
    if (process.env.NODE_ENV === "development") {
    }
    return [];
  }
}

/**
 * Generate sitemap entries for all products across all locales
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await getAllPublishedProducts();

    if (products.length === 0) {
      return [];
    }

    // Generate sitemap entries for each product in each locale
    const sitemapEntries: MetadataRoute.Sitemap = [];

    for (const product of products) {
      try {
        const slug = generateProductSlug(product);
        const lastModified = product.updated_on
          ? new Date(product.updated_on)
          : new Date();

        // Add entry for each locale
        for (const locale of SUPPORTED_LOCALES) {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/products/${slug}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8, // Products are important pages
            // Add alternate language versions
            alternates: {
              languages: Object.fromEntries(
                SUPPORTED_LOCALES.map(loc => [
                  loc,
                  `${BASE_URL}/${loc}/products/${slug}`,
                ])
              ),
            },
          });
        }
      } catch {}
    }

    return sitemapEntries;
  } catch {
    return [];
  }
}
