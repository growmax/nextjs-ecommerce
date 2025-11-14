# SearchService

Service for Elasticsearch-based product search operations.

## Overview

This service provides functionality to search products using Elasticsearch, with support for catalog/equipment code filtering, text search, advanced filtering, and proper formatting of search results. It uses a dedicated axios instance with request interceptors for authentication.

## Class

### `SearchService`

Singleton service that manages Elasticsearch client and search operations.

## Methods

### `searchProducts`

Searches products using Elasticsearch.

**Parameters:**

- `options`: `ElasticSearchOptions` object with elasticIndex, query, catalogCodes, equipmentCodes, context

**Returns:** `Promise<SearchProductsResponse>` - Formatted search results

**Example:**

```typescript
import SearchService from "@/lib/api/services/SearchService/SearchService";

const results = await SearchService.searchProducts({
  elasticIndex: "products",
  query: {
    query: {
      bool: {
        must: [{ match: { productName: "test" } }],
      },
    },
  },
  catalogCodes: ["CAT-001"],
});
```

### `searchProductsByText`

Searches products by text query.

**Parameters:**

- `searchText`: Text to search for (string)
- `elasticIndex`: Elasticsearch index name (string)
- `options`: Optional object with limit, offset, catalogCodes, equipmentCodes
- `context`: Optional `RequestContext` object

**Returns:** `Promise<SearchProductsResponse>`

### `getProductById`

Gets product by ID from Elasticsearch.

**Parameters:**

- `productId`: Product ID (string | number)
- `elasticIndex`: Elasticsearch index name (string)
- `context`: Optional `RequestContext` object

**Returns:** `Promise<FormattedProduct | null>`

### `getProductsByIds`

Gets multiple products by their IDs from Elasticsearch.

**Parameters:**

- `productIds`: Array of product IDs (number[])
- `elasticIndex`: Elasticsearch index name (string)
- `context`: Optional `RequestContext` object

**Returns:** `Promise<FormattedProduct[]>`

### `advancedSearch`

Searches products with advanced filters.

**Parameters:**

- `filters`: Object with searchText, brandIds, categoryIds, minPrice, maxPrice, inStock, catalogCodes, equipmentCodes, limit, offset
- `elasticIndex`: Elasticsearch index name (string)
- `context`: Optional `RequestContext` object

**Returns:** `Promise<SearchProductsResponse>`

## API Endpoints

- **Elasticsearch Search**: `POST {ELASTIC_URL}` (configured via environment variables)

## Notes

- Uses singleton pattern via `getInstance()`
- Creates dedicated axios instance for Elasticsearch requests
- Auto-injects authorization token from cookies (client-side only)
- Supports context headers (accessToken, tenantCode, companyId, userId)
- Automatically formats Elasticsearch results to normalized product format
- Returns empty results on error instead of throwing
- Supports catalog and equipment code filtering
- Default pagination: limit=20, offset=0
- Text search uses multi-match with field boosting
- Advanced search supports brand, category, price range, and stock filters

## Environment Variables

- `ELASTIC_URL`: Elasticsearch API URL (optional)
- `NEXT_PUBLIC_ELASTIC_URL`: Public Elasticsearch API URL (optional)
- Default: `https://api.myapptino.com/elasticsearch/invocations`

## Testing

See `SearchService.test.ts` for comprehensive test cases covering:

- Singleton pattern
- Cookie token extraction
- Elasticsearch response formatting
- Product search with various options
- Text search query building
- Product retrieval by ID
- Multiple product retrieval
- Advanced search with filters
- Error handling
- Context header injection

Mocks are available in `SearchService.mocks.ts`.

## Folder Structure

```
services/
  SearchService/
    SearchService.ts
    SearchService.test.ts
    SearchService.mocks.ts
    README.md
```

## Dependencies

- `axios`: HTTP client for Elasticsearch requests
- `RequestContext`: Request context type from client

## Related

- Client: Request context types
- Elasticsearch: Elasticsearch API
