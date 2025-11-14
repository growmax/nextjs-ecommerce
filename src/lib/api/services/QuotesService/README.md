# QuotesService

Service for fetching quotes with filtering capabilities.

## Overview

This service provides functionality to retrieve quotes with pagination and filtering options.

## Class

### `QuotesService`

Extends `BaseService<QuotesService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getQuotes`

Gets quotes with filtering and pagination.

**Parameters:**

- `params`: `QuotesQueryParams` object with:
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)
  - `offset`: Offset for pagination (number, defaults to 0)
  - `limit`: Limit for pagination (number, defaults to 20)
- `requestBody`: Partial `QuotesRequestBody` object for filtering

**Returns:** `Promise<QuotesApiResponse>` - Quotes response

**Example:**

```typescript
import QuotesService from "@/lib/api/services/QuotesService/QuotesService";

const quotes = await QuotesService.getQuotes(
  {
    userId: 123,
    companyId: 456,
    offset: 0,
    limit: 20,
  },
  {
    filter_name: "Test Filter",
    status: ["PENDING"],
  }
);
```

**Note:** The method merges `requestBody` with default values for all required fields.

## API Endpoint

- **Get Quotes**: `POST /quotes/findByFilter?userId={userId}&companyId={companyId}&offset={offset}&limit={limit}`
- **Body**: Complete filter request body with defaults merged

## Response Structure

```typescript
interface QuotesApiResponse {
  data: {
    quotesResponse: QuoteItem[];
    totalQuoteCount: number;
  };
  message: string | null;
  status: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Merges partial requestBody with default values
- Default offset is 0, default limit is 20
- Uses POST method with filter body

## Testing

See `QuotesService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Request body merging with defaults
- Default parameter handling
- Response handling
- Error handling
- HTTP method verification

Mocks are available in `QuotesService.mocks.ts`.

## Folder Structure

```
services/
  QuotesService/
    QuotesService.ts
    QuotesService.test.ts
    QuotesService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `OrdersService` - Service for orders with filtering
