import { Brand, ColorOption } from "@/types/product-listing/index";

// Category interface with API ID mapping
export interface Category {
  id: string;      // URL slug
  label: string;   // Display name
  apiId?: number;  // API category ID (optional for backward compatibility)
}

/**
 * Main Categories for Navigation
 * Note: apiId values should match the OpenSearch API category IDs
 * Currently only "milwakee" and "electronics" have confirmed API IDs
 */
export const categories: Category[] = [
  { id: "all", label: "All Products", apiId: 0 },
  { id: "milwakee", label: "Milwakee", apiId: 23 },
  { id: "electronics", label: "Electronics", apiId: 18 },
  // TODO: Add API IDs for these categories once available
  { id: "power-tools", label: "Power Tools" },
  { id: "hand-tools", label: "Hand Tools" },
  { id: "safety", label: "Safety Equipment" },
  { id: "accessories", label: "Accessories" },
  { id: "storage", label: "Storage & Organization" },
  { id: "measuring", label: "Measuring Tools" },
  { id: "lighting", label: "Lighting" },
];

/**
 * Brands for Filter
 */
export const brands: Brand[] = [
  { id: "milwaukee", label: "Milwaukee" },
  { id: "milwakee", label: "Milwakee" }, // API spelling
  { id: "dewalt", label: "DeWalt" },
  { id: "makita", label: "Makita" },
  { id: "bosch", label: "Bosch" },
  { id: "ryobi", label: "Ryobi" },
  { id: "craftsman", label: "Craftsman" },
  { id: "black-decker", label: "Black & Decker" },
  { id: "stanley", label: "Stanley" },
  { id: "irwin", label: "Irwin" },
  { id: "klein", label: "Klein Tools" },
  { id: "3m", label: "3M" },
];

/**
 * Colors for Filter
 */
export const colors: ColorOption[] = [
  { id: "red", label: "Red", color: "bg-red-500" },
  { id: "orange", label: "Orange", color: "bg-orange-500" },
  { id: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { id: "blue", label: "Blue", color: "bg-blue-500" },
  { id: "black", label: "Black", color: "bg-black" },
  { id: "white", label: "White", color: "bg-white border border-gray-300" },
  { id: "gray", label: "Gray", color: "bg-gray-500" },
  { id: "green", label: "Green", color: "bg-green-500" },
];
