/**
 * Category mapping: URL slug -> API category ID
 * 
 * Note: These mappings should ideally come from a configuration API
 * For now, we're using hardcoded mappings based on the API response
 */
export const CATEGORY_ID_MAP: Record<string, number> = {
  all: 0, // Special case: fetch all categories
  milwakee: 23,
  electronics: 18,
  // TODO: Add more category mappings as they become available
  // Example:
  // 'power-tools': 24,
  // 'hand-tools': 25,
  // 'safety': 26,
};

/**
 * Get category ID from URL slug
 * @param slug - Category slug from URL
 * @returns Category ID for API, or null if not found
 */
export function getCategoryId(slug: string): number | null {
  return CATEGORY_ID_MAP[slug] ?? null;
}

/**
 * Get category slug from ID
 * @param id - Category ID from API
 * @returns URL slug, or null if not found
 */
export function getCategorySlug(id: number): string | null {
  const entry = Object.entries(CATEGORY_ID_MAP).find(
    ([_, catId]) => catId === id
  );
  return entry ? entry[0] : null;
}

/**
 * Check if category slug is valid
 * @param slug - Category slug to validate
 * @returns True if slug exists in mapping
 */
export function isValidCategory(slug: string): boolean {
  return slug in CATEGORY_ID_MAP;
}

/**
 * Get all available category slugs
 * @returns Array of valid category slugs
 */
export function getAvailableCategorySlugs(): string[] {
  return Object.keys(CATEGORY_ID_MAP);
}

/**
 * Get all category mappings
 * @returns Record of slug -> ID mappings
 */
export function getAllCategoryMappings(): Record<string, number> {
  return { ...CATEGORY_ID_MAP };
}
