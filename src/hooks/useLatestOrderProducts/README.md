# useLatestOrderProducts

A React hook for fetching and updating order products with latest pricing, discounts, and tax data using React Query.

## Overview

This hook fetches the latest pricing, discount, and tax information for order products by calling `getLatestTaxData`, which internally uses `DiscountService.getDiscount()` and `SearchService.getProductsByIds()`. It provides automatic caching, refetching, and error handling through React Query.

## Usage

```tsx
import { useLatestOrderProducts } from "@/hooks/useLatestOrderProducts/useLatestOrderProducts";

const { updatedProducts, isLoading, isError, error, refetch } =
  useLatestOrderProducts({
    products: orderProducts,
    currency: buyerCurrency,
    sellerCurrency: sellerCurrency,
    isInter: true,
    taxExemption: false,
    isCloneReOrder: false,
    isPlaceOrder: false,
    isSprRequested: false,
    quoteSettings: settings,
    roundOff: 2,
    elasticIndex: "custom-index", // Optional
    enabled: true, // Optional, defaults to true
  });
```

## Parameters

### `UseLatestOrderProductsParams`

| Parameter        | Type      | Required | Default | Description                                                                                                            |
| ---------------- | --------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `products`       | `any[]`   | No       | `[]`    | Array of products to update with latest data                                                                           |
| `currency`       | `any`     | No       | -       | Buyer currency object or ID                                                                                            |
| `sellerCurrency` | `any`     | No       | -       | Seller currency object or ID                                                                                           |
| `isInter`        | `boolean` | No       | `true`  | Whether the order is inter-state                                                                                       |
| `taxExemption`   | `boolean` | No       | `false` | Whether tax exemption applies                                                                                          |
| `isCloneReOrder` | `boolean` | No       | `false` | Whether this is a clone/reorder operation                                                                              |
| `isPlaceOrder`   | `boolean` | No       | `false` | Whether this is a place order operation                                                                                |
| `isSprRequested` | `boolean` | No       | `false` | Whether SPR (Special Price Request) is requested                                                                       |
| `quoteSettings`  | `any`     | No       | -       | Quote settings object                                                                                                  |
| `roundOff`       | `number`  | No       | `2`     | Decimal precision for rounding                                                                                         |
| `elasticIndex`   | `string`  | No       | Auto    | Elasticsearch index name. If not provided, uses tenant's `elasticCode` + "pgandproducts", or falls back to "pgproduct" |
| `enabled`        | `boolean` | No       | `true`  | Whether the query should be enabled                                                                                    |

### `UseLatestOrderProductsOptions`

Optional React Query options (excluding `queryKey`, `queryFn`, and `enabled` which are managed by the hook).

## Return Value

The hook returns an object with the following properties:

| Property          | Type            | Description                                                                                                                                         |
| ----------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updatedProducts` | `any[]`         | Array of products with updated pricing, discounts, and tax data. Falls back to original `products` if data is not yet loaded or if there's an error |
| `isLoading`       | `boolean`       | Whether the query is currently loading                                                                                                              |
| `isError`         | `boolean`       | Whether the query encountered an error                                                                                                              |
| `error`           | `Error \| null` | Error object if the query failed                                                                                                                    |
| `refetch`         | `function`      | Function to manually refetch the data                                                                                                               |
| `...query`        | -               | All other React Query properties (e.g., `data`, `status`, `isFetching`, etc.)                                                                       |

## Features

### Automatic Elastic Index Resolution

The hook automatically determines the Elasticsearch index to use:

1. **Provided Index**: If `elasticIndex` is provided, it uses that value
2. **Tenant Index**: If tenant data has `elasticCode`, it constructs `{elasticCode}pgandproducts`
3. **Default Index**: Falls back to `"pgproduct"` if neither is available

### Query Key Generation

The query key is generated based on:

- Product IDs (sorted and joined)
- User ID and Company ID
- Tenant Code
- Currency IDs
- All boolean flags (`isInter`, `taxExemption`, etc.)
- Elastic index

This ensures proper caching and automatic refetching when any of these values change.

### Conditional Fetching

The query is only enabled when:

- `enabled` is `true`
- `products` array has items
- User is available
- Tenant data is available
- At least one product has a valid `productId`

### Caching

- **Stale Time**: 2 minutes (data is considered fresh for 2 minutes)
- **Garbage Collection Time**: 5 minutes (cached data is kept for 5 minutes)
- **Refetch on Window Focus**: Disabled by default

## Examples

### Basic Usage

```tsx
const { updatedProducts, isLoading } = useLatestOrderProducts({
  products: orderDetails.dbProductDetails,
  currency: orderDetails.buyerCurrencyId,
  sellerCurrency: orderDetails.sellerCurrencyId,
});
```

### With Tax Exemption

```tsx
const { updatedProducts } = useLatestOrderProducts({
  products: orderProducts,
  currency: buyerCurrency,
  taxExemption: true,
  isInter: false,
});
```

### Disabled Query

```tsx
const { updatedProducts } = useLatestOrderProducts({
  products: orderProducts,
  currency: buyerCurrency,
  enabled: !loading && products.length > 0,
});
```

### With Custom Elastic Index

```tsx
const { updatedProducts } = useLatestOrderProducts({
  products: orderProducts,
  currency: buyerCurrency,
  elasticIndex: "custom-tenant-pgandproducts",
});
```

### Manual Refetch

```tsx
const { updatedProducts, refetch, isLoading } = useLatestOrderProducts({
  products: orderProducts,
  currency: buyerCurrency,
});

const handleRefresh = async () => {
  await refetch();
};
```

## Error Handling

The hook handles errors gracefully:

- If `getLatestTaxData` throws an error, `isError` will be `true` and `error` will contain the error object
- `updatedProducts` will fall back to the original `products` array if there's an error
- The query will not retry automatically (can be configured via options)

## Testing

See `useLatestOrderProducts.test.ts` for comprehensive test cases covering:

- Successful data fetching
- Empty products array handling
- Disabled query state
- Elastic index resolution
- All boolean flags
- Error handling
- Refetch functionality

Mocks are available in `useLatestOrderProducts.mocks.ts`.

## Folder Structure

```
hooks/
  useLatestOrderProducts/
    useLatestOrderProducts.ts
    useLatestOrderProducts.test.ts
    useLatestOrderProducts.mocks.ts
    README.md
```

## Dependencies

- `@tanstack/react-query`: For data fetching and caching
- `@/hooks/useCurrentUser`: For user context
- `@/hooks/useTenantData`: For tenant context
- `@/utils/order/getLatestTaxData`: Core function that fetches latest tax data

## Notes

- The hook uses React Query's `useQuery` under the hood
- Product IDs are extracted, filtered, sorted, and joined to create a stable query key
- The hook automatically handles currency fallback to user's currency if order currency is invalid
- All products are passed to `getLatestTaxData`, but only products with valid `productId` values are included in the query key
