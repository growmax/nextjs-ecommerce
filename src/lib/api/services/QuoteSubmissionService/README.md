# QuoteSubmissionService

Service for submitting quotes as new versions.

## Overview

This service provides functionality to submit quotes as new versions, including all quote details, products, calculations, and metadata.

## Class

### `QuoteSubmissionService`

Extends `BaseService<QuoteSubmissionService>` and uses `coreCommerceClient` for API calls.

## Methods

### `submitQuoteAsNewVersion`

Submits a quote as a new version.

**Parameters:**

- `request`: `QuoteSubmissionRequest` object with:
  - `body`: Quote submission payload (`QuoteSubmissionPayload`)
  - `quoteId`: Quote identifier (string)
  - `userId`: User ID (number | string)
  - `companyId`: Company ID (number | string)

**Returns:** `Promise<QuoteSubmissionResponse>` - Submission response

**Example:**

```typescript
import QuoteSubmissionService from "@/lib/api/services/QuoteSubmissionService/QuoteSubmissionService";

const result = await QuoteSubmissionService.submitQuoteAsNewVersion({
  body: {
    quoteName: "Test Quote",
    versionCreatedTimestamp: "2024-01-01T00:00:00Z",
    dbProductDetails: [...],
    subTotal: 1000,
    // ... other fields
  },
  quoteId: "QUO-001",
  userId: 123,
  companyId: 456,
});
```

### `submitQuoteAsNewVersionServerSide`

Server-side version that returns null on error.

**Parameters:**

- `request`: `QuoteSubmissionRequest` object

**Returns:** `Promise<QuoteSubmissionResponse | null>`

## API Endpoint

- **Submit Quote**: `POST /quotes/submitAsNewVersion?userId={userId}&quotationIdentifier={quoteId}&companyId={companyId}`
- **Body**: Quote submission payload

## Response Structure

```typescript
interface QuoteSubmissionResponse {
  success: boolean;
  data: unknown;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Quote identifier is URL-encoded in query string
- Supports both number and string userId/companyId
- Payload includes comprehensive quote data (products, calculations, addresses, terms, etc.)
- Server-side methods use `callSafe` for error handling

## Testing

See `QuoteSubmissionService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Query parameter encoding
- Payload in request body
- Number and string ID handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `QuoteSubmissionService.mocks.ts`.

## Folder Structure

```
services/
  QuoteSubmissionService/
    QuoteSubmissionService.ts
    QuoteSubmissionService.test.ts
    QuoteSubmissionService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
