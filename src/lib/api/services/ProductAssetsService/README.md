# ProductAssetsService

Service for fetching product assets by product IDs.

## Overview

This service provides functionality to retrieve product assets (images, videos, etc.) for multiple products at once.

## Class

### `ProductAssetsService`

Extends `BaseService<ProductAssetsService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getProductAssetsByProductIds`

Gets product assets for multiple product IDs.

**Parameters:**

- `productIds`: Array of product IDs (number[])

**Returns:** `Promise<ProductAssetsResponse>` - Product assets response

**Example:**

```typescript
import ProductAssetsService from "@/lib/api/services/ProductAssetsService/ProductAssetsService";

const assets = await ProductAssetsService.getProductAssetsByProductIds([
  1, 2, 3,
]);
```

**Note:** The API expects the array directly in the request body, not wrapped in an object.

### `getProductAssetsByProductIdsServerSide`

Server-side version that returns null on error.

**Parameters:**

- `productIds`: Array of product IDs (number[])

**Returns:** `Promise<ProductAssetsResponse | null>`

## API Endpoint

- **Get Product Assets**: `POST productassetses/GetProductAssetsByProductIds`
- **Body**: Array of product IDs directly (not wrapped)

## Response Structure

```typescript
interface ProductAssetsResponse {
  data?: ProductAsset[];
  message?: string;
  status?: string;
}

interface ProductAsset {
  id?: number;
  source: string;
  isDefault?: number | boolean;
  height?: number | null;
  width?: number | null;
  type?: string;
  tenantId?: number;
  productId?: {
    id: number;
    brandProductId?: string;
  };
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Sends product IDs array directly in body (not wrapped)
- Server-side methods use `callSafe` for error handling
- Supports batch fetching of assets for multiple products

## Testing

See `ProductAssetsService.test.ts` for comprehensive test cases covering:

- API calls with product IDs array
- Direct array body format
- Response handling
- Empty array handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `ProductAssetsService.mocks.ts`.

## Folder Structure

```
services/
  ProductAssetsService/
    ProductAssetsService.ts
    ProductAssetsService.test.ts
    ProductAssetsService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
