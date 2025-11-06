```typescript
// Simple, reusable pattern for any service:
const data = await withRedisCache(
  "cache-key", // Unique cache key
  () => fetchFromAPI(), // Function to call on cache miss
  3600 // TTL in seconds (optional)
);
```

### Example: Tenant Caching

```typescript
// In TenantService.ts
async getTenantDataCached(domainUrl: string, origin?: string) {
  return withRedisCache(
    `tenant:${domainUrl}`,
    () => this.getTenantDataServerSide(domainUrl, origin),
    3600  // 1 hour
  );
}
```

---

## 🎓 Easy Extensibility

### Adding Caching to Other Services

**Product Caching (Example):**

```typescript
// In OpenSearchService.ts
import { withRedisCache } from "@/lib/cache";

async getProductCached(productId: string, elasticIndex: string) {
  return withRedisCache(
    `product:${elasticIndex}:${productId}`,
    () => this.getProductServerSide(productId, elasticIndex),
    300  // 5 minutes
  );
}
```

**Category Caching (Example):**

```typescript
// In CatalogService.ts
async getCategoriesCached(tenantCode: string) {
  return withRedisCache(
    `categories:${tenantCode}`,
    () => this.getCategories(),
    1800  // 30 minutes
  );
}
```

---
