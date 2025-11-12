/**
 * Extract numeric product IDs from an array of product objects.
 * Tries common field names: productId, id, dbProductId, product_id
 * Returns only numeric ids (filters out non-number and NaN)
 */
export default function getProductIds(
  products?: Array<Record<string, unknown>>
): number[] {
  if (!products || !Array.isArray(products)) return [];

  return products
    .map(product => {
      const productId = (product &&
        (product.productId ??
          product.id ??
          product.dbProductId ??
          product.product_id)) as unknown;

      if (typeof productId === "number" && Number.isFinite(productId))
        return productId;
      // If it's a string that parses to an integer, consider converting? Keep behavior strict and ignore strings
      return null;
    })
    .filter((id): id is number => id !== null);
}
