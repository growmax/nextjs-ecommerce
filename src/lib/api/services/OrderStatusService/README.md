# OrderStatusService

Service for fetching order status options by company.

## Overview

This service provides functionality to retrieve order status options for a company, with support for formatting statuses for UI components.

## Class

### `OrderStatusService`

Extends `BaseService<OrderStatusService>` and uses `coreCommerceClient` for API calls.

## Methods

### `findStatusByCompany`

Gets order statuses by company (auto-context).

**Parameters:**

- `params`: Object with:
  - `userId`: User ID (string)
  - `companyId`: Company ID (string)

**Returns:** `Promise<OrderStatusResponse>` - Order status response

**Example:**

```typescript
import OrderStatusService from "@/lib/api/services/OrderStatusService/OrderStatusService";

const statuses = await OrderStatusService.findStatusByCompany({
  userId: "123",
  companyId: "456",
});
```

### `findStatusByCompanyWithContext`

Gets order statuses with custom context.

**Parameters:**

- `params`: Object with userId and companyId
- `context`: RequestContext object

**Returns:** `Promise<OrderStatusResponse>`

### `findStatusByCompanyServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: Object with userId and companyId

**Returns:** `Promise<OrderStatusResponse | null>`

### `findStatusByCompanyServerSideWithContext`

Server-side version with custom context.

**Parameters:**

- `params`: Object with userId and companyId
- `context`: RequestContext object

**Returns:** `Promise<OrderStatusResponse | null>`

### `getOrderStatuses`

Gets order statuses formatted for UI components (convenience method).

**Parameters:**

- `params`: Optional object with:
  - `userId`: User ID (string, defaults to "1032")
  - `companyId`: Company ID (string, defaults to "8690")

**Returns:** `Promise<StatusOption[]>` - Array of status options with value/label

**Example:**

```typescript
const statusOptions = await OrderStatusService.getOrderStatuses({
  userId: "123",
  companyId: "456",
});
// Returns: [{ value: "Draft", label: "Draft" }, ...]
```

### `getOrderStatusesServerSide`

Server-side version for UI components.

**Parameters:**

- `params`: Optional object with userId and companyId

**Returns:** `Promise<StatusOption[]>` - Returns empty array on error

## API Endpoint

- **Get Order Statuses**: `GET /orders/findStatusByCompany?userId={userId}&companyId={companyId}`

## Response Structures

```typescript
interface OrderStatusResponse {
  data: string[];
  message: string | null;
  status: string;
}

interface StatusOption {
  value: string;
  label: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Query parameters are URL-encoded
- Convenience methods use default userId/companyId if not provided
- Server-side methods use `callSafe` for error handling
- `getOrderStatuses` transforms raw status strings to `{ value, label }` format

## Testing

See `OrderStatusService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Query parameter encoding
- Response transformation
- Default parameter handling
- Error handling
- Server-side error handling
- Context handling
- HTTP method verification

Mocks are available in `OrderStatusService.mocks.ts`.

## Folder Structure

```
services/
  OrderStatusService/
    OrderStatusService.ts
    OrderStatusService.test.ts
    OrderStatusService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `StatusService` - Service for quote/order status options
