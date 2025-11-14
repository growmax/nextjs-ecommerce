# OpenSearchService

Service for fetching products from OpenSearch.

## Overview

This service provides functionality to retrieve product details from OpenSearch using product identifiers.

## Class

### `OpenSearchService`

Extends `BaseService<OpenSearchService>` and uses `openSearchClient` for API calls.

## Methods

### `getProduct`

Fetches a single product from OpenSearch.

**Parameters:**

- `identifier`: Product identifier (string)
- `elasticIndex`: Elasticsearch index name (string)
- `elasticType`: Elasticsearch type (string, defaults to "pgproduct")
- `queryType`: Query type (string, defaults to "get")
- `context`: Optional request context (RequestContext)

**Returns:** `Promise<ProductDetail | null>` - Product detail or null

**Example:**

```typescript
import OpenSearchService from "@/lib/api/services/OpenSearchService/OpenSearchService";

const product = await OpenSearchService.getProduct(
  "product-123",
  "products",
  "pgproduct",
  "get"
);
```

### `getProductServerSide`

Server-side version that returns null on error.

**Parameters:**

- Same as `getProduct`

**Returns:** `Promise<ProductDetail | null>`

### `getProductCached`

Gets product with caching (client-side uses server-side method, server-side uses Redis).

**Parameters:**

- Same as `getProduct`

**Returns:** `Promise<ProductDetail | null>`

## API Endpoint

- **Get Product**: `POST {openSearchClient baseURL}` (empty path)
- **Body**: OpenSearch request body with Elasticindex, ElasticBody, ElasticType, queryType

## Response Structure

Uses `extractOpenSearchData` utility to extract product data from OpenSearch response structure.

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Uses `extractOpenSearchData` utility to parse responses
- Server-side methods use `callWithSafe` for error handling
- `getProductCached` uses Redis cache on server-side
- Default elasticType is "pgproduct", default queryType is "get"

## Testing

See `OpenSearchService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Default parameter handling
- Context handling
- Response extraction
- Error handling
- Server-side error handling
- Caching behavior

Mocks are available in `OpenSearchService.mocks.ts`.

## Folder Structure

```
services/
  OpenSearchService/
    OpenSearchService.ts
    OpenSearchService.test.ts
    OpenSearchService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `openSearchClient`: OpenSearch API client
- `extractOpenSearchData`: Utility for parsing OpenSearch responses
- Types: `@/types/product/product-detail` - Product detail type definitions

## Related

- Base: `BaseService` - Base service implementation
- Client: `openSearchClient` - OpenSearch API client
- Utility: `extractOpenSearchData` - OpenSearch response parser
