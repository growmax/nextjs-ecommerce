# OrderDetailsService

Service for fetching order details by order identifier and version.

## Overview

This service provides functionality to retrieve detailed information about orders, including product details, pricing, and status information.

## Class

### `OrderDetailsService`

Extends `BaseService<OrderDetailsService>` and uses `coreCommerceClient` for API calls.

## Methods

### `fetchOrderDetails`

Fetches order details by order identifier.

**Parameters:**

- `params`: `FetchOrderDetailsParams` object with:
  - `userId`: User ID (number)
  - `tenantId`: Tenant ID (string)
  - `companyId`: Company ID (number)
  - `orderId`: Order identifier (string)

**Returns:** `Promise<OrderDetailsResponse>` - Order details response

**Example:**

```typescript
import OrderDetailsService from "@/lib/api/services/OrderDetailsService/OrderDetailsService";

const details = await OrderDetailsService.fetchOrderDetails({
  userId: 123,
  tenantId: "tenant-1",
  companyId: 456,
  orderId: "ORD-001",
});
```

### `fetchOrderDetailsByVersion`

Fetches order details for a specific version.

**Parameters:**

- `params`: Object with:
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)
  - `orderIdentifier`: Order identifier (string)
  - `orderVersion`: Order version number (number)

**Returns:** `Promise<OrderDetailsResponse>`

### `fetchOrderDetailsWithContext`

Fetches order details with custom context.

**Parameters:**

- `params`: `FetchOrderDetailsParams` object
- `context`: RequestContext object

**Returns:** `Promise<OrderDetailsResponse>`

### `fetchOrderDetailsServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `FetchOrderDetailsParams` object

**Returns:** `Promise<OrderDetailsResponse | null>`

### `fetchOrderDetailsServerSideWithContext`

Server-side version with custom context.

**Parameters:**

- `params`: `FetchOrderDetailsParams` object
- `context`: RequestContext object

**Returns:** `Promise<OrderDetailsResponse | null>`

## API Endpoints

- **Get Order Details**: `GET orders/fetchOrderDetails?userId={userId}&companyId={companyId}&orderIdentifier={orderId}`
- **Get Order Details by Version**: `GET orders/fetchOrderDetailsByVersion?userId={userId}&companyId={companyId}&orderIdentifier={orderIdentifier}&orderVersion={orderVersion}`

## Response Structure

```typescript
interface OrderDetailsResponse {
  data: OrderDetailsData;
  message: string | null;
  status: string;
}

interface OrderDetailsData {
  orderIdentifier: string;
  orderType?: {
    channelCode: string;
    id: number;
    name: string;
    tenantId: number;
  };
  createdDate?: string;
  orderDeliveryDate?: string;
  updatedBuyerStatus?: string;
  updatedSellerStatus?: string;
  orderDetails?: OrderDetailItem[];
  buyerCurrencySymbol?: {
    currencyCode?: string;
    symbol?: string;
    // ... other currency fields
  };
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Supports fetching by version for order history
- Server-side methods use `callSafe` for error handling
- Context methods allow custom request context for server-side rendering

## Testing

See `OrderDetailsService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Version-based fetching
- Context handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `OrderDetailsService.mocks.ts`.

## Folder Structure

```
services/
  OrderDetailsService/
    OrderDetailsService.ts
    OrderDetailsService.test.ts
    OrderDetailsService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `QuotationDetailsService` - Service for quotation details
