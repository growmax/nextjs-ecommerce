/**
 * Token Cache Manager
 *
 * Provides in-memory caching for anonymous tokens to minimize API calls.
 * Note: This cache is per-edge-runtime instance, not shared across instances.
 * For production, consider using Redis or a distributed cache.
 */

interface CachedToken {
  token: string;
  expiresAt: number;
  tenantId: string;
}

class TokenCache {
  private cache: Map<string, CachedToken>;
  private readonly maxSize: number;
  private readonly cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupIntervalMs;
    this.startCleanup();
  }

  /**
   * Get token from cache if valid
   */
  get(tenantId: string): string | null {
    const cached = this.cache.get(tenantId);

    if (!cached) return null;

    // Check if token is expired
    if (Date.now() >= cached.expiresAt) {
      this.cache.delete(tenantId);
      return null;
    }

    return cached.token;
  }

  /**
   * Store token in cache
   */
  set(tenantId: string, token: string, expiresIn: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    // Calculate expiry time with buffer (5 minutes before actual expiry)
    const expiresAt = Date.now() + expiresIn * 1000 - 5 * 60 * 1000;

    this.cache.set(tenantId, {
      token,
      expiresAt,
      tenantId,
    });
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(tenantId: string): boolean {
    const cached = this.cache.get(tenantId);

    if (!cached) return true;

    // Refresh if within 10 minutes of expiry
    const refreshThreshold = cached.expiresAt - 10 * 60 * 1000;
    return Date.now() >= refreshThreshold;
  }

  /**
   * Clear expired tokens periodically
   */
  private startCleanup(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now >= value.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        tenantId: key,
        expiresIn: Math.max(
          0,
          Math.floor((value.expiresAt - Date.now()) / 1000)
        ),
      })),
    };
  }

  /**
   * Cleanup on destruction
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Create singleton instance for edge runtime
// Note: This is per-runtime-instance, not truly global
let tokenCacheInstance: TokenCache | null = null;

export function getTokenCache(): TokenCache {
  if (!tokenCacheInstance) {
    tokenCacheInstance = new TokenCache();
  }
  return tokenCacheInstance;
}

// Export for testing and direct usage
export { TokenCache };

/**
 * Helper function to parse JWT expiry without full verification
 */
export function parseJwtExpiry(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const decodedPayload = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString()
    );

    return decodedPayload.exp ? decodedPayload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Calculate token TTL for caching
 */
export function calculateTokenTTL(token: string, defaultTTL = 3600): number {
  const expiry = parseJwtExpiry(token);

  if (expiry) {
    // Return seconds until expiry
    return Math.max(0, expiry - Math.floor(Date.now() / 1000));
  }

  return defaultTTL;
}
