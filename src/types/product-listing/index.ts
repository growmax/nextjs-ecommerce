/**
 * Product Listing Type Definitions
 * Optimized for display in product listing pages
 */

// Display-optimized product type
export interface ProductListItem {
  id: number;
  sku: string;
  title: string;
  brand: string;
  price: number; // In cents (14999 = $149.99)
  image: string; // Primary image URL
  images?: string[]; // All image URLs
  isNew: boolean; // Show "New" badge
  inStock: boolean; // In stock status
  category: string; // Main category ID
  subCategory?: string; // Sub-category ID
  color?: string; // Product color
}

// Category type
export interface Category {
  id: string;
  label: string;
}

// Sub-category type
export interface SubCategory {
  id: string;
  label: string;
  parentId: string; // Parent category ID
}

// Brand type
export interface Brand {
  id: string;
  label: string;
}

// Color filter option
export interface ColorOption {
  id: string;
  label: string;
  color: string; // Tailwind class like "bg-red-500"
}

// View mode type
export type ViewMode = "grid" | "list";

// Sort options
export type SortOption =
  | "best-match"
  | "price-low-high"
  | "price-high-low"
  | "newest";
