# OrdersService

Service for fetching and creating orders with flexible filtering options.

## Overview

This service provides functionality to retrieve orders with various filter options, create new orders, and manage order operations. It supports both client-side and server-side operations with error handling.

## Class

### `OrdersService`

Extends `BaseService<OrdersService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getOrders`

🚀 SIMPLIFIED: Get orders (auto-context).

**Parameters:**

- `params`: `OrdersParams` object with userId, companyId, offset, limit, and optional filters

**Returns:** `Promise<unknown>` - Orders response

**Example:**

```typescript
import OrdersService from "@/lib/api/services/OrdersService/OrdersService";

const orders = await OrdersService.getOrders({
  userId: "123",
  companyId: "456",
  offset: 0,
  limit: 20,
  status: "pending",
});
```

### `getOrdersWithContext`

🔧 ADVANCED: Get orders with custom context (when needed).

**Parameters:**

- `params`: `OrdersParams` object
- `context`: `RequestContext` object

**Returns:** `Promise<unknown>`

### `getOrdersServerSide`

🛡️ SIMPLIFIED: Server-side version (auto-context + error handling).

**Parameters:**

- `params`: `OrdersParams` object

**Returns:** `Promise<unknown | null>`

### `getOrdersServerSideWithContext`

🔧 ADVANCED: Server-side with custom context (when needed).

**Parameters:**

- `params`: `OrdersParams` object
- `context`: `RequestContext` object

**Returns:** `Promise<unknown | null>`

### `getAllOrders`

🌟 CONVENIENCE: Get all orders without any filters.

**Parameters:**

- `params`: Object with userId, companyId, offset, limit

**Returns:** `Promise<unknown>`

### `getAllOrdersServerSide`

🌟 CONVENIENCE: Server-side get all orders without any filters.

**Parameters:**

- `params`: Object with userId, companyId, offset, limit

**Returns:** `Promise<unknown | null>`

### `createOrder`

Create a new order.

**Parameters:**

- `orderData`: Object with orderName, orderIdentifier, userId, companyId, and optional fields

**Returns:** `Promise<unknown>` - Created order response

### `createOrderWithContext`

Create order with custom context.

**Parameters:**

- `orderData`: Order creation data
- `context`: `RequestContext` object

**Returns:** `Promise<unknown>`

### `createOrderServerSide`

Server-safe version for creating orders.

**Parameters:**

- `orderData`: Order creation data

**Returns:** `Promise<unknown | null>`

## API Endpoints

- **Get Orders**: `POST /orders/findByFilter?userId={userId}&companyId={companyId}&offset={offset}&pgLimit={limit}&...`
- **Create Order**: `POST /orders/create?userId={userId}&companyId={companyId}`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically encodes query parameters
- Supports `filterType: "all"` to exclude filter parameters from URL
- Default filter body structure matches quotes API format
- Server-side methods return `null` on error instead of throwing
- Automatically calculates `pageNumber` based on offset and limit
- Excludes undefined, null, and empty string values from query string

## Testing

See `OrdersService.test.ts` for comprehensive test cases covering:

- Query string building
- Parameter encoding
- Filter type handling
- Order fetching
- Order creation
- Server-side error handling
- Context support
- Page number calculation

Mocks are available in `OrdersService.mocks.ts`.

## Folder Structure

```
services/
  OrdersService/
    OrdersService.ts
    OrdersService.test.ts
    OrdersService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Core commerce API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
