# OrdersFilterService

Service for filtering and retrieving orders with advanced filter capabilities.

## Overview

This service provides functionality to fetch orders with various filter options, save custom filters, and manage order filtering preferences. It supports both client-side and server-side operations with error handling.

## Class

### `OrdersFilterService`

Extends `BaseService<OrdersFilterService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getOrdersWithFilter`

Gets orders with filter payload (like quotes API).

**Parameters:**

- `params`: `OrdersFilterParams` object with userId, companyId, offset, pgLimit, status, filters, selected

**Returns:** `Promise<unknown>` - Orders response

**Example:**

```typescript
import OrdersFilterService from "@/lib/api/services/OrdersFilterService/OrdersFilterService";

const orders = await OrdersFilterService.getOrdersWithFilter({
  userId: 123,
  companyId: 456,
  offset: 0,
  pgLimit: 20,
  status: "pending",
});
```

### `getOrdersWithFilterAndContext`

Gets orders with filter payload (with custom context).

**Parameters:**

- `params`: `OrdersFilterParams` object
- `context`: `RequestContext` object

**Returns:** `Promise<unknown>`

### `getOrdersWithFilterServerSide`

Server-side version with error handling.

**Parameters:**

- `params`: `OrdersFilterParams` object

**Returns:** `Promise<unknown | null>`

### `getOrdersWithCustomFilters`

Gets orders with custom filters.

**Parameters:**

- `userId`: User ID (number)
- `companyId`: Company ID (number)
- `filter`: `OrderFilter` object

**Returns:** `Promise<unknown>`

### `getOrdersByStatus`

Gets orders by status with proper filter structure.

**Parameters:**

- `userId`: User ID (number)
- `companyId`: Company ID (number)
- `status`: Status string
- `offset`: Offset (number, default: 0)
- `limit`: Limit (number, default: 20)

**Returns:** `Promise<unknown>`

### `getAllOrders`

Gets all orders (no status filter).

**Parameters:**

- `userId`: User ID (number)
- `companyId`: Company ID (number)
- `offset`: Offset (number, default: 0)
- `limit`: Limit (number, default: 20)

**Returns:** `Promise<unknown>`

### `saveOrderFilter`

Saves order filter (create/update filter).

**Parameters:**

- `params`: `OrdersFilterParams` object

**Returns:** `Promise<unknown>` - Saved filter response

### `saveOrderFilterWithContext`

Saves order filter with custom context.

**Parameters:**

- `params`: `OrdersFilterParams` object
- `context`: `RequestContext` object

**Returns:** `Promise<unknown>`

### `saveOrderFilterServerSide`

Server-safe version for saving order filter.

**Parameters:**

- `params`: `OrdersFilterParams` object

**Returns:** `Promise<unknown | null>`

### `saveCustomOrderFilter`

Saves custom order filter.

**Parameters:**

- `userId`: User ID (number)
- `companyId`: Company ID (number)
- `filter`: `OrderFilter` object

**Returns:** `Promise<unknown>`

## API Endpoints

- **Get Orders with Filter**: `POST /orders/findByFilter?userId={userId}&companyId={companyId}&offset={offset}&pgLimit={pgLimit}&status={status}`
- **Save Order Filter**: `POST /orders/saveFilter?userId={userId}&companyId={companyId}&offset={offset}&pgLimit={pgLimit}&status={status}`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically creates default filters if none provided
- Supports status encoding in query strings
- Default pagination: offset=0, limit=20
- Server-side methods return `null` on error instead of throwing
- Filter structure matches quotes API format

## Testing

See `OrdersFilterService.test.ts` for comprehensive test cases covering:

- Default filter creation
- Payload building
- Query parameter building
- Order fetching with filters
- Custom filter handling
- Status-based filtering
- Filter saving
- Server-side error handling
- Context support

Mocks are available in `OrdersFilterService.mocks.ts`.

## Folder Structure

```
services/
  OrdersFilterService/
    OrdersFilterService.ts
    OrdersFilterService.test.ts
    OrdersFilterService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Core commerce API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
