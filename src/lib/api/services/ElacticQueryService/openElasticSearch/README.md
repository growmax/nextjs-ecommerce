# OpenElasticSearchService

OpenSearch service for product operations.

## Methods

### `getProduct(identifier, elasticIndex, elasticType?, queryType?, context?)`

Fetch single product.

### `getProductServerSide(identifier, elasticIndex, elasticType?, queryType?, context?)`

Server-safe product fetch.

### `getProductCached(identifier, elasticIndex, elasticType?, queryType?, context?)`

Cached product fetch with Redis.

### `searchProducts(searchTerm, elasticIndex, options?, context?)`

Search products using query builder.

### `searchProductsServerSide(searchTerm, elasticIndex, options?, context?)`

Server-safe product search.

## Usage

```typescript
import OpenElasticSearchService from "./openElasticSearch";

const service = OpenElasticSearchService;
const product = await service.getProduct("123", "products");
```

## Testing

Run tests: `npm test openElasticSearch.test.ts`
