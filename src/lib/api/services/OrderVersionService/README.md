# OrderVersionService

Service for creating new versions of orders.

## Overview

This service provides functionality to create new versions of existing orders, allowing order history and version tracking.

## Class

### `OrderVersionService`

Extends `BaseService<OrderVersionService>` and uses `coreCommerceClient` for API calls.

## Methods

### `createNewVersion`

Creates a new version of an order.

**Parameters:**

- `request`: `CreateOrderVersionRequest` object with:
  - `orderIdentifier`: Order identifier (string)
  - `userId`: User ID (number | string)
  - `companyId`: Company ID (number | string)
  - `versionData`: Order body data (unknown)

**Returns:** `Promise<CreateOrderVersionResponse>` - Version creation response

**Example:**

```typescript
import OrderVersionService from "@/lib/api/services/OrderVersionService/OrderVersionService";

const result = await OrderVersionService.createNewVersion({
  orderIdentifier: "ORD-001",
  userId: 123,
  companyId: 456,
  versionData: {
    products: [],
    total: 1000,
  },
});
```

### `createNewVersionServerSide`

Server-side version that returns null on error.

**Parameters:**

- `request`: `CreateOrderVersionRequest` object

**Returns:** `Promise<CreateOrderVersionResponse | null>`

## API Endpoint

- **Create Order Version**: `POST orders/createNewVersion?orderIdentifier={orderIdentifier}&userId={userId}&companyId={companyId}`
- **Body**: Version data object

## Response Structure

```typescript
interface CreateOrderVersionResponse {
  success?: boolean;
  result?: unknown;
  isLoggedIn?: boolean;
  data?: unknown;
  message?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Order identifier is URL-encoded in query string
- Supports both number and string userId/companyId
- Version data is sent directly in request body
- Server-side methods use `callSafe` for error handling

## Testing

See `OrderVersionService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Version data in request body
- Number and string ID handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `OrderVersionService.mocks.ts`.

## Folder Structure

```
services/
  OrderVersionService/
    OrderVersionService.ts
    OrderVersionService.test.ts
    OrderVersionService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `QuotationVersionService` - Service for quotation versions
