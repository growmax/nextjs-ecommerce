import { ProductDetail } from "@/types/product/product-detail";

/**
 * Slug Generator and Parser Utilities
 *
 * Creates SEO-friendly URLs with brand, product name, and ID
 * Format: /products/brand-product-name-productid
 * Example: /products/generics-bearing-j-06-07-prod0000012390
 */

/**
 * Normalize text for URL slugs
 * - Convert to lowercase
 * - Replace special characters and spaces with hyphens
 * - Remove consecutive hyphens
 * - Trim hyphens from start/end
 */
function normalizeForSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      // Remove consecutive hyphens
      .replace(/-+/g, "-")
      // Trim hyphens from start and end
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Generate SEO-friendly slug from product data
 *
 * @param product - Product detail object
 * @param maxLength - Maximum length for the slug (default: 100)
 * @returns SEO-friendly URL slug
 *
 * @example
 * generateProductSlug(product)
 * // Returns: "generics-bearing-j-06-07-prod0000012390"
 */
export function generateProductSlug(
  product:
    | ProductDetail
    | {
      brand_name?: string;
      brands_name?: string;
      title: string;
      product_index_name: string;
      product_id?: number;
    },
  maxLength: number = 100
): string {
  const brandName = product.brand_name || product.brands_name || "product";
  const productTitle = product.title || "item";
  const productIndexName = product.product_index_name;

  // Normalize brand and title
  const brandSlug = normalizeForSlug(brandName);
  const titleSlug = normalizeForSlug(productTitle);

  // Combine brand + title
  let combinedSlug = `${brandSlug}-${titleSlug}`;

  // Truncate if too long (leave room for product ID)
  const maxCombinedLength =
    maxLength - productIndexName.length - 1; // Keep original case length
  if (combinedSlug.length > maxCombinedLength) {
    combinedSlug = combinedSlug.substring(0, maxCombinedLength);
    // Ensure we don't cut in the middle of a word
    const lastHyphen = combinedSlug.lastIndexOf("-");
    if (lastHyphen > 0) {
      combinedSlug = combinedSlug.substring(0, lastHyphen);
    }
  }

  // Add product index name at the end - LOWERCASE for URL consistency
  const slug = `${combinedSlug}-${productIndexName.toLowerCase()}`;

  return slug;
}

/**
 * Parse product ID from slug
 * Extracts the product index name or numeric ID from the slug
 *
 * @param slug - URL slug
 * @returns Product index name (e.g., "Prod0000012390") or numeric ID string
 *
 * @example
 * parseProductSlug("generics-bearing-j-06-07-prod0000012390")
 * // Returns: "Prod0000012390"
 *
 * parseProductSlug("milwaukee-impact-driver-12390")
 * // Returns: "12390"
 */
export function parseProductSlug(slug: string): string | null {
  if (!slug) return null;

  // Split slug by hyphens
  const parts = slug.split("-");

  // Look for product index pattern (Prod followed by digits, case-insensitive)
  const prodIndexPattern = /^prod\d+$/i;
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (!part) continue;

    if (prodIndexPattern.test(part)) {
      // Always capitalize 'Prod' and normalize zero padding
      // Database expects: Prod0000064097 (5 zeros, total 10 digits after 'Prod')
      // Search might return: prod00000064097 (6+ zeros)

      // Extract just the numeric part
      const numericPart = part.substring(4); // Remove 'prod' prefix

      // Convert to number to remove leading zeros, then pad to 10 digits
      const productNumber = parseInt(numericPart, 10);
      const normalizedNumber = productNumber.toString().padStart(10, '0');

      const productId = `Prod${normalizedNumber}`;
      return productId;
    }
  }

  // If no Prod pattern found, look for numeric ID at the end
  const lastPart = parts[parts.length - 1];
  if (lastPart && /^\d+$/.test(lastPart)) {
    return lastPart;
  }

  // If still nothing found, try to extract any number from the slug
  const numbers = slug.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    return numbers[numbers.length - 1] || null;
  }

  return null;
}

/**
 * Generate full product URL path
 *
 * @param product - Product detail object
 * @param locale - Locale code (e.g., "en", "es", "fr")
 * @returns Full URL path
 *
 * @example
 * generateProductUrl(product, "en")
 * // Returns: "/en/products/generics-bearing-j-06-07-prod0000012390"
 */
export function generateProductUrl(
  product:
    | ProductDetail
    | {
      brand_name?: string;
      brands_name?: string;
      title: string;
      product_index_name: string;
      product_id?: number;
    },
  locale: string = "en"
): string {
  const slug = generateProductSlug(product);
  return `/${locale}/products/${slug}`;
}

/**
 * Validate slug format
 * Checks if a slug is properly formatted
 *
 * @param slug - URL slug to validate
 * @returns true if slug is valid
 */
export function isValidProductSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;

  // Check if it contains only valid characters
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(slug)) return false;

  // Check if we can extract a product ID
  const productId = parseProductSlug(slug);
  return productId !== null;
}

/**
 * Generate canonical URL for product
 * Used for SEO meta tags
 *
 * @param product - Product detail object
 * @param locale - Locale code
 * @param baseUrl - Base URL of the site (e.g., "https://example.com")
 * @returns Canonical URL
 */
export function generateProductCanonicalUrl(
  product:
    | ProductDetail
    | {
      brand_name?: string;
      brands_name?: string;
      title: string;
      product_index_name: string;
      product_id?: number;
    },
  locale: string,
  baseUrl: string
): string {
  const path = generateProductUrl(product, locale);
  return `${baseUrl}${path}`;
}
