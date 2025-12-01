/**
 * Client-side functions to interact with Redis via API route
 * Redis is server-side only, so we use API routes to access it
 */

export interface SellerInfo {
  sellerId: string | number;
  sellerName: string;
}

/**
 * Get seller info from Redis cache via API route
 * @param productId - Product ID
 * @param companyId - Company ID
 * @param currencyId - Currency ID
 * @returns Cached seller info or null if not cached
 */
export async function getSellerInfoFromCache(
  productId: number,
  companyId: number,
  currencyId: number
): Promise<SellerInfo | null> {
  try {
    const response = await fetch(
      `/api/cache/seller-info?productId=${productId}&companyId=${companyId}&currencyId=${currencyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `Failed to get seller info from cache: ${response.statusText}`
      );
      return null;
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error("Error getting seller info from cache:", error);
    return null;
  }
}

/**
 * Cache seller info in Redis via API route
 * @param productId - Product ID
 * @param companyId - Company ID
 * @param currencyId - Currency ID
 * @param sellerId - Seller ID
 * @param sellerName - Seller Name
 * @returns true if cached successfully, false otherwise
 */
export async function cacheSellerInfo(
  productId: number,
  companyId: number,
  currencyId: number,
  sellerId: string | number,
  sellerName: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/cache/seller-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        companyId,
        currencyId,
        sellerId,
        sellerName,
      }),
    });

    if (!response.ok) {
      console.warn(
        `Failed to cache seller info: ${response.statusText}`
      );
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Error caching seller info:", error);
    return false;
  }
}

/**
 * Batch get seller info from cache for multiple products
 * @param products - Array of {productId, companyId, currencyId}
 * @returns Map of productId -> SellerInfo
 */
export async function batchGetSellerInfoFromCache(
  products: Array<{
    productId: number;
    companyId: number;
    currencyId: number;
  }>
): Promise<Map<number, SellerInfo>> {
  const result = new Map<number, SellerInfo>();

  // Fetch all in parallel
  const promises = products.map(async ({ productId, companyId, currencyId }) => {
    const sellerInfo = await getSellerInfoFromCache(
      productId,
      companyId,
      currencyId
    );
    if (sellerInfo) {
      return { productId, sellerInfo };
    }
    return null;
  });

  const results = await Promise.all(promises);
  results.forEach(item => {
    if (item) {
      result.set(item.productId, item.sellerInfo);
    }
  });

  return result;
}

/**
 * Batch cache seller info for multiple products
 * @param sellerInfoMap - Map of productId -> {sellerId, sellerName, companyId, currencyId}
 * @returns Number of successfully cached items
 */
export async function batchCacheSellerInfo(
  sellerInfoMap: Map<
    number,
    {
      sellerId: string | number;
      sellerName: string;
      companyId: number;
      currencyId: number;
    }
  >
): Promise<number> {
  let successCount = 0;

  // Cache all in parallel
  const promises = Array.from(sellerInfoMap.entries()).map(
    async ([productId, { sellerId, sellerName, companyId, currencyId }]) => {
      const success = await cacheSellerInfo(
        productId,
        companyId,
        currencyId,
        sellerId,
        sellerName
      );
      if (success) {
        successCount++;
      }
      return success;
    }
  );

  await Promise.all(promises);
  return successCount;
}

