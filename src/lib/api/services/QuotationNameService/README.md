# QuotationNameService

Service for updating quotation names.

## Overview

This service provides functionality to update the name of an existing quotation using the quotation identifier.

## Class

### `QuotationNameService`

Extends `BaseService<QuotationNameService>` and uses `coreCommerceClient` for API calls.

## Methods

### `updateQuotationName`

Updates the name of a quotation.

**Parameters:**

- `params`: `UpdateQuotationNameRequest` object with:
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)
  - `quotationIdentifier`: Quotation identifier (string)
  - `quotationName`: New quotation name (string)

**Returns:** `Promise<UpdateQuotationNameResponse>` - Update response with success status and message

**Example:**

```typescript
import QuotationNameService from "@/lib/api/services/QuotationNameService/QuotationNameService";

const result = await QuotationNameService.updateQuotationName({
  userId: 123,
  companyId: 456,
  quotationIdentifier: "QUO-001",
  quotationName: "New Quotation Name",
});
```

### `updateQuotationNameServerSide`

Server-side version that returns null on error instead of throwing.

**Parameters:**

- `params`: `UpdateQuotationNameRequest` object

**Returns:** `Promise<UpdateQuotationNameResponse | null>` - Update response or null on error

**Example:**

```typescript
const result = await QuotationNameService.updateQuotationNameServerSide({
  userId: 123,
  companyId: 456,
  quotationIdentifier: "QUO-001",
  quotationName: "New Quotation Name",
});

if (result) {
  console.log("Quotation name updated:", result.quotationName);
}
```

## API Endpoint

- **Endpoint**: `/quotes/changeQuotationName`
- **Method**: `PUT`
- **Query Parameters**: `userId`, `companyId`, `quotationIdentifier`
- **Body**: `{ newName: string }`

## Response Structure

```typescript
interface UpdateQuotationNameResponse {
  success: boolean;
  message: string;
  quotationName?: string;
}
```

## Notes

- Uses singleton pattern (exported as instance)
- Automatically handles request context
- Query parameters are URL-encoded
- Server-side version uses try-catch for error handling
- Backend expects payload as `{ newName: "..." }`

## Testing

See `QuotationNameService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Request body format
- HTTP method verification
- Response handling
- Error handling
- Server-side error handling

Mocks are available in `QuotationNameService.mocks.ts`.

## Folder Structure

```
services/
  QuotationNameService/
    QuotationNameService.ts
    QuotationNameService.test.ts
    QuotationNameService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `OrderNameService` - Service for updating order names
