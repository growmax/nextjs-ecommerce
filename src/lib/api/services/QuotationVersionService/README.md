# QuotationVersionService

Service for creating new versions of quotations.

## Overview

This service provides functionality to create new versions of existing quotations, allowing quotation history and version tracking.

## Class

### `QuotationVersionService`

Extends `BaseService<QuotationVersionService>` and uses `coreCommerceClient` for API calls.

## Methods

### `createNewVersion`

Creates a new version of a quotation.

**Parameters:**

- `request`: `CreateQuotationVersionRequest` object with:
  - `quotationIdentifier`: Quotation identifier (string)
  - `userId`: User ID (number | string)
  - `companyId`: Company ID (number | string)
  - `versionData`: Quotation body data (unknown)

**Returns:** `Promise<CreateQuotationVersionResponse>` - Version creation response

**Example:**

```typescript
import QuotationVersionService from "@/lib/api/services/QuotationVersionService/QuotationVersionService";

const result = await QuotationVersionService.createNewVersion({
  quotationIdentifier: "QUO-001",
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

- `request`: `CreateQuotationVersionRequest` object

**Returns:** `Promise<CreateQuotationVersionResponse | null>`

## API Endpoint

- **Create Quotation Version**: `POST quotes/createNewVersion?quotationIdentifier={quotationIdentifier}&userId={userId}&companyId={companyId}`
- **Body**: Version data object

## Response Structure

```typescript
interface CreateQuotationVersionResponse {
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
- Quotation identifier is URL-encoded in query string
- Supports both number and string userId/companyId
- Version data is sent directly in request body
- Server-side methods use `callSafe` for error handling

## Testing

See `QuotationVersionService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Version data in request body
- Number and string ID handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `QuotationVersionService.mocks.ts`.

## Folder Structure

```
services/
  QuotationVersionService/
    QuotationVersionService.ts
    QuotationVersionService.test.ts
    QuotationVersionService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `OrderVersionService` - Service for order versions
