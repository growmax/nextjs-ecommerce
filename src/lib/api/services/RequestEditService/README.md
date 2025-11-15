# RequestEditService

Service for requesting edits to orders.

## Overview

This service provides functionality to submit edit requests for orders, allowing users to request changes to existing orders.

## Class

### `RequestEditService`

Extends `BaseService<RequestEditService>` and uses `coreCommerceClient` for API calls.

## Methods

### `requestEdit`

Submits an edit request for an order.

**Parameters:**

- `params`: `RequestEditParams` object with:
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)
  - `orderId`: Order identifier (string)
  - `data`: Optional data object (Record<string, unknown>)

**Returns:** `Promise<RequestEditResponse>` - Edit request response

**Example:**

```typescript
import RequestEditService from "@/lib/api/services/RequestEditService/RequestEditService";

const result = await RequestEditService.requestEdit({
  userId: 123,
  companyId: 456,
  orderId: "ORD-001",
  data: {
    reason: "Price adjustment needed",
    changes: ["quantity", "discount"],
  },
});
```

### `requestEditServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `RequestEditParams` object

**Returns:** `Promise<RequestEditResponse | null>`

## API Endpoint

- **Request Edit**: `PUT orders/requestEdit?userId={userId}&companyId={companyId}&orderIdentifier={orderId}`
- **Body**: `{ data: {...} }`

## Response Structure

```typescript
interface RequestEditResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  status?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Query parameters are URL-encoded
- Data is wrapped in `{ data: {...} }` object in request body
- If `data` is not provided, sends `{ data: {} }`
- Server-side methods use `callSafe` for error handling

## Testing

See `RequestEditService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Data wrapping in request body
- Default empty data handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `RequestEditService.mocks.ts`.

## Folder Structure

```
services/
  RequestEditService/
    RequestEditService.ts
    RequestEditService.test.ts
    RequestEditService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
