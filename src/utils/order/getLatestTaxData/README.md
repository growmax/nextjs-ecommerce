# getLatestTaxData

Utility function for fetching and updating products with the latest pricing, discount, and tax information from APIs.

## Overview

This function fetches the latest tax data, discounts, and product information from Elasticsearch and discount APIs, then updates products with current pricing, discounts, and taxes. It handles different flows (edit order, place order, clone/reorder) and processes products accordingly.

## Usage

```typescript
import { getLatestTaxData } from "@/utils/order/getLatestTaxData/getLatestTaxData";

const updatedProducts = await getLatestTaxData({
  products: cartItems,
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
  currency: { id: 1, currencyCode: "INR" },
  isInter: true,
});
```

## Parameters

| Parameter        | Type             | Required | Default       | Description                                                             |
| ---------------- | ---------------- | -------- | ------------- | ----------------------------------------------------------------------- |
| `products`       | `any[]`          | Yes      | -             | Array of products to update                                             |
| `userId`         | `number`         | Yes\*    | -             | User ID (required if context not provided)                              |
| `companyId`      | `number`         | Yes\*    | -             | Company ID (required if context not provided)                           |
| `tenantCode`     | `string`         | Yes\*    | -             | Tenant code (required if context not provided)                          |
| `currency`       | `CurrencyType`   | No       | -             | Currency (number ID or object with id/currencyCode)                     |
| `sellerCurrency` | `CurrencyType`   | No       | -             | Seller currency (number ID or object with id/currencyCode)              |
| `userCurrency`   | `CurrencyType`   | No       | -             | User's currency (fallback if currency is 0)                             |
| `isCloneReOrder` | `boolean`        | No       | `false`       | Whether this is a clone/reorder operation                               |
| `taxExemption`   | `boolean`        | No       | `false`       | Whether tax exemption applies                                           |
| `isInter`        | `boolean`        | No       | `true`        | Whether inter-state tax applies                                         |
| `isSprRequested` | `boolean`        | No       | `false`       | Whether SPR is requested                                                |
| `isPlaceOrder`   | `boolean`        | No       | `false`       | Whether this is place order flow                                        |
| `roundOff`       | `number`         | No       | `2`           | Decimal precision for rounding                                          |
| `quoteSettings`  | `any`            | No       | -             | Quote settings for calculations                                         |
| `elasticIndex`   | `string`         | No       | `"pgproduct"` | Elasticsearch index name                                                |
| `context`        | `RequestContext` | No       | -             | Request context (if provided, userId/companyId/tenantCode not required) |

\* Required if `context` is not provided

### CurrencyType

Currency can be:

- **Number**: Currency ID (e.g., `1`)
- **Object**: `{ id: number, currencyCode?: string }`

## Return Value

Returns a `Promise<any[]>` - Array of updated products with latest pricing, discounts, and taxes.

## Features

### Parallel API Calls

The function makes parallel API calls to:

- `DiscountService.getDiscount()` - Fetches discount data
- `SearchService.getProductsByIds()` - Fetches product data from Elasticsearch

### Currency Handling

- Extracts currency ID from number or object format
- Falls back to user's currency if order currency is 0 or undefined
- Extracts currency code from currency object, sellerCurrency, userCurrency, or defaults to "INR"

### Multiple Flow Support

1. **Edit Order Flow** (`isPlaceOrder: false`):
   - Processes products with discounts and Elasticsearch data
   - Updates discounts, taxes, and product information
   - Handles clone/reorder specific logic if `isCloneReOrder: true`

2. **Place Order Flow** (`isPlaceOrder: true`):
   - Processes products with discount data
   - Updates pricing, discounts, and seller information
   - Handles SPR request logic

### Product Updates

The function updates products with:

- Discount information from pricelist
- Seller ID and name
- Tax information (inter/intra state)
- HSN details
- Category information
- Bundle products (for clone/reorder)
- Unit pricing calculations

### Error Handling

- Returns original products array on error
- Validates required parameters (userId, companyId, tenantCode)
- Handles empty products array
- Handles missing product IDs

## Examples

### Basic Usage

```typescript
const updatedProducts = await getLatestTaxData({
  products: [
    {
      productId: 1,
      quantity: 10,
      unitListPrice: 100,
    },
  ],
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
});
```

### With Currency

```typescript
const updatedProducts = await getLatestTaxData({
  products: cartItems,
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
  currency: { id: 1, currencyCode: "INR" },
  sellerCurrency: { id: 2, currencyCode: "USD" },
  userCurrency: { id: 1, currencyCode: "INR" },
});
```

### Clone/Reorder Flow

```typescript
const updatedProducts = await getLatestTaxData({
  products: cartItems,
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
  isCloneReOrder: true,
  quoteSettings: {
    taxExemption: false,
  },
});
```

### Place Order Flow

```typescript
const updatedProducts = await getLatestTaxData({
  products: cartItems,
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
  isPlaceOrder: true,
  isSprRequested: false,
});
```

### With Request Context

```typescript
const updatedProducts = await getLatestTaxData({
  products: cartItems,
  context: {
    userId: 123,
    companyId: 456,
    tenantCode: "tenant1",
  },
});
```

### With Tax Exemption

```typescript
const updatedProducts = await getLatestTaxData({
  products: cartItems,
  userId: 123,
  companyId: 456,
  tenantCode: "tenant1",
  taxExemption: true,
  isInter: false,
});
```

## API Integration

### DiscountService.getDiscount()

Called with:

```typescript
{
  userId: number,
  tenantId: string,
  body: {
    Productid: number[],
    CurrencyId: number,
    BaseCurrencyId: number,
    companyId: number,
    currencyCode: string,
  }
}
```

### SearchService.getProductsByIds()

Called with:

```typescript
(productIds: number[], elasticIndex: string, context?: RequestContext)
```

## Response Handling

The function handles multiple response formats:

1. **Discount Response**:
   - `{ success: true, data: [...] }`
   - `{ data: [...] }`
   - `[...]` (direct array)

2. **Elasticsearch Response**:
   - Formatted through `formatElasticResponse`
   - Manipulated through `manipulateProductsElasticData`

## Processing Pipeline

1. **Extract Product IDs**: Filters products with `productId`
2. **Build Request Context**: Uses provided context or builds from userId/companyId/tenantCode
3. **Extract Currency**: Handles number/object formats, falls back to user currency
4. **API Calls**: Parallel calls to DiscountService and SearchService
5. **Response Processing**: Normalizes discount and Elasticsearch data
6. **Product Updates**: Updates products based on flow (edit/place order)
7. **Tax Calculation**: Processes discounts and sets tax details
8. **Final Calculation**: For clone/reorder, calculates cart values

## Notes

- **Empty Products**: Returns empty array if products array is empty
- **No Product IDs**: Returns original products if no valid productIds found
- **Error Handling**: Returns original products on any error
- **Currency Fallback**: Falls back to userCurrency if currency is 0 or undefined
- **Default Currency Code**: Defaults to "INR" if currency code not found
- **Clone/Reorder**: Uses `calculateCart` for final calculation
- **Round Off**: Default precision is 2 decimal places
- **Elasticsearch Index**: Default index is "pgproduct"

## Testing

See `getLatestTaxData.test.ts` for comprehensive test cases covering:

- Empty products handling
- Missing parameters validation
- Currency handling (number/object formats)
- Currency fallback logic
- API call parameters
- Response format handling
- Edit order flow
- Place order flow
- Clone/reorder flow
- Tax exemption handling
- Error handling
- Bundle products handling

Mocks are available in `getLatestTaxData.mocks.ts`.

## Folder Structure

```
utils/
  order/
    getLatestTaxData/
      getLatestTaxData.ts
      getLatestTaxData.test.ts
      getLatestTaxData.mocks.ts
      README.md
```

## Dependencies

- `@/lib/api/services/DiscountService`: For fetching discount data
- `@/lib/api/services/SearchService`: For fetching product data from Elasticsearch
- `@/utils/calculation/cart-calculation`: For cart calculations (clone/reorder)
- `@/utils/calculation/cartCalculation`: For discount details processing
- `@/utils/calculation/discountCalculation`: For finding suitable discounts
- `@/utils/calculation/salesCalculation`: For tax details and product manipulation
- `@/utils/elasticsearch/format-response`: For formatting Elasticsearch responses
- `@/utils/functionalUtils`: For assigning pricelist discounts
- `lodash`: For filtering, finding, mapping, and rounding

## Related

- Hook: `useLatestOrderProducts` - React hook that uses this function
- Service: `DiscountService` - Discount API service
- Service: `SearchService` - Elasticsearch search service
