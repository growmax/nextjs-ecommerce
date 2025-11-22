# Query Builder

Utility functions for building OpenSearch queries.

## Functions

### `buildProductSearchQuery(searchTerm, elasticIndex, options?): OpenSearchSearchRequest`

Builds complete OpenSearch search request for products.

### `getProductSourceFields(): readonly string[]`

Returns fields to include in search results.

### `getProductSearchFields(): readonly string[]`

Returns fields to search in.

## Usage

```typescript
import { buildProductSearchQuery } from "./query-builder";

const query = buildProductSearchQuery("laptop", "products");
```

## Testing

Run tests: `npm test query-builder.test.ts`
