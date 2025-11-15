# OrderNameService

Service for updating order names.

## Overview

This service provides functionality to update the name of an existing order using the order identifier.

## Class

### `OrderNameService`

Extends `BaseService<OrderNameService>` and uses `coreCommerceClient` for API calls.

## Methods

### `updateOrderName`

Updates the name of an order.

**Parameters:**

- `params`: `UpdateOrderNameRequest` object with:
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)
  - `orderIdentifier`: Order identifier (string)
  - `orderName`: New order name (string)

**Returns:** `Promise<UpdateOrderNameResponse>` - Update response with success status and message

**Example:**

```typescript
import OrderNameService from "@/lib/api/services/OrderNameService/OrderNameService";

const result = await OrderNameService.updateOrderName({
  userId: 123,
  companyId: 456,
  orderIdentifier: "ORD-001",
  orderName: "New Order Name",
});
```

### `updateOrderNameServerSide`

Server-side version that returns null on error instead of throwing.

**Parameters:**

- `params`: `UpdateOrderNameRequest` object

**Returns:** `Promise<UpdateOrderNameResponse | null>` - Update response or null on error

**Example:**

```typescript
const result = await OrderNameService.updateOrderNameServerSide({
  userId: 123,
  companyId: 456,
  orderIdentifier: "ORD-001",
  orderName: "New Order Name",
});

if (result) {
  console.log("Order name updated:", result.orderName);
}
```

## API Endpoint

- **Endpoint**: `/orders/changeOrderName`
- **Method**: `PUT`
- **Query Parameters**: `userId`, `companyId`, `orderIdentifier`
- **Body**: `{ newName: string }`

## Response Structure

```typescript
interface UpdateOrderNameResponse {
  success: boolean;
  message: string;
  orderName?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Query parameters are URL-encoded
- Server-side version uses `callSafe` for error handling
- Backend expects payload as `{ newName: "..." }`

## Testing

See `OrderNameService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Request body format
- HTTP method verification
- Response handling
- Error handling
- Server-side error handling

Mocks are available in `OrderNameService.mocks.ts`.

## Folder Structure

```
services/
  OrderNameService/
    OrderNameService.ts
    OrderNameService.test.ts
    OrderNameService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `QuotationNameService` - Service for updating quotation names
