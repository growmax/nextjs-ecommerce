# SellerWarehouseService

Service for finding seller branches and warehouses.

## Overview

This service provides functionality to find seller branches based on buyer details and products, and to find warehouses by branch ID.

## Class

### `SellerWarehouseService`

Extends `BaseService<SellerWarehouseService>` and uses `coreCommerceClient` for API calls.

## Methods

### `findSellerBranch`

Finds seller branches based on buyer details and products.

**Parameters:**

- `userId`: User ID (string)
- `companyId`: Company ID (string)
- `request`: `FindSellerBranchRequest` object with:
  - `userId`: User ID (number)
  - `buyerBranchId`: Buyer branch ID (number)
  - `buyerCompanyId`: Buyer company ID (number)
  - `productIds`: Array of product IDs (number[])
  - `sellerCompanyId`: Seller company ID (number)

**Returns:** `Promise<SellerBranch[]>` - Array of seller branches

**Example:**

```typescript
import SellerWarehouseService from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";

const branches = await SellerWarehouseService.findSellerBranch("123", "456", {
  userId: 123,
  buyerBranchId: 1,
  buyerCompanyId: 456,
  productIds: [1, 2, 3],
  sellerCompanyId: 789,
});
```

### `findWarehouseByBranchId`

Finds warehouse by branch ID.

**Parameters:**

- `branchId`: Branch ID (number)

**Returns:** `Promise<Warehouse | null>` - Warehouse object or null

**Example:**

```typescript
const warehouse = await SellerWarehouseService.findWarehouseByBranchId(1);
```

### `getSellerBranchAndWarehouse`

Combined method to get both seller branch and warehouse.

**Parameters:**

- `userId`: User ID (string)
- `companyId`: Company ID (string)
- `request`: `FindSellerBranchRequest` object

**Returns:** `Promise<{ sellerBranch: SellerBranch | null; warehouse: Warehouse | null }>`

**Example:**

```typescript
const { sellerBranch, warehouse } =
  await SellerWarehouseService.getSellerBranchAndWarehouse(
    "123",
    "456",
    request
  );
```

## API Endpoints

- **Find Seller Branch**: `POST /branches/findsellerBranch/{userId}?companyId={companyId}`
- **Find Warehouse**: `GET /branches/findWareHouseByBranchId/2?branchId={branchId}`

## Response Structures

```typescript
interface SellerBranch {
  id: number;
  name: string;
  branchId: number;
  companyId: number;
}

interface Warehouse {
  id: number;
  name: string;
  wareHouseName: string;
  wareHousecode?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Normalizes API responses to consistent formats
- Returns empty array for `findSellerBranch` when no data
- Returns null for `findWarehouseByBranchId` on errors
- `getSellerBranchAndWarehouse` uses buyerBranchId as fallback for warehouse lookup
- Handles errors gracefully, continuing with partial data when possible

## Testing

See `SellerWarehouseService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Response normalization
- Error handling
- Combined method behavior
- Fallback logic
- HTTP method verification

Mocks are available in `SellerWarehouseService.mocks.ts`.

## Folder Structure

```
services/
  SellerWarehouseService/
    SellerWarehouseService.ts
    SellerWarehouseService.test.ts
    SellerWarehouseService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
