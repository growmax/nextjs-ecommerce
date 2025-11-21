# useElasticSearch

Constants for OpenSearch product search configuration.

## Exports

### `PRODUCT_SEARCH_FIELDS: readonly string[]`

Fields to search in for product queries.

### `PRODUCT_SOURCE_FIELDS: readonly string[]`

Fields to include in search results.

## Usage

```typescript
import {
  PRODUCT_SEARCH_FIELDS,
  PRODUCT_SOURCE_FIELDS,
} from "./useElasticSearch";

console.log(PRODUCT_SEARCH_FIELDS); // ["product_short_description", "brand_product_id", "brand_name"]
```

## Testing

Run tests: `npm test useElasticSearch.test.ts`
