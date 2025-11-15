# PaymentService

Service for managing payment-related operations including payment history, payment due calculations, and payment terms.

## Overview

This service provides functionality to fetch payment history, calculate payment dues, and retrieve payment terms for orders and users.

## Class

### `PaymentService`

Extends `BaseService<PaymentService>` and uses `coreCommerceClient` for API calls.

## Methods

### `fetchOverallPaymentsByOrder`

Fetches overall payments made towards an order.

**Parameters:**

- `orderIdentifier`: Order identifier (string)

**Returns:** `Promise<OverallPaymentsResponse>` - Payment history response

**Example:**

```typescript
import PaymentService from "@/lib/api/services/PaymentService/PaymentService";

const payments = await PaymentService.fetchOverallPaymentsByOrder("ORD-001");
```

### `fetchPaymentDueByOrder`

Fetches payment due details for an order.

**Parameters:**

- `orderIdentifier`: Order identifier (string)

**Returns:** `Promise<PaymentDueResponse>` - Payment due response

**Example:**

```typescript
const paymentDue = await PaymentService.fetchPaymentDueByOrder("ORD-001");
```

### `fetchPaymentDueByOrderServerSide`

Server-side version that returns null on error.

**Parameters:**

- `orderIdentifier`: Order identifier (string)

**Returns:** `Promise<PaymentDueResponse | null>`

### `fetchPaymentTerms`

Fetches payment terms for a user.

**Parameters:**

- `userId`: User ID (number | string)

**Returns:** `Promise<PaymentTermsResponse>` - Payment terms response

**Example:**

```typescript
const terms = await PaymentService.fetchPaymentTerms(123);
```

### `fetchPaymentTermsServerSide`

Server-side version that returns null on error.

**Parameters:**

- `userId`: User ID (number | string)

**Returns:** `Promise<PaymentTermsResponse | null>`

## API Endpoints

- **Overall Payments**: `GET payment/fetchOverallPaymentTowardsOrder?orderIdentifier={orderIdentifier}`
- **Payment Due**: `GET paymentDueCalculation/fetchByOrder?orderIdentifier={orderIdentifier}`
- **Payment Terms**: `POST PaymentTerms/fetchPaymentTerms?userId={userId}&isB2C=false`

## Response Structures

```typescript
interface OverallPaymentsResponse {
  data?: PaymentHistoryItem[];
  message?: string | null;
  status?: string;
}

interface PaymentDueResponse {
  data?: PaymentDueDataItem[];
  [key: string]: unknown;
}

interface PaymentTermsResponse {
  data?: PaymentTerm[];
  message?: string | null;
  status?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Order identifiers are URL-encoded
- Supports both number and string userIds
- Server-side methods use `callSafe` for error handling
- Payment terms endpoint uses POST method with `isB2C=false` parameter

## Testing

See `PaymentService.test.ts` for comprehensive test cases covering:

- Payment history fetching
- Payment due calculations
- Payment terms retrieval
- URL encoding
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `PaymentService.mocks.ts`.

## Folder Structure

```
services/
  PaymentService/
    PaymentService.ts
    PaymentService.test.ts
    PaymentService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
