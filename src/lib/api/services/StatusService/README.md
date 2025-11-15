# StatusService (QuoteStatusService)

Service for fetching and transforming quote/order status options by company.

## Overview

This service provides functionality to retrieve status options for quotes and orders, with automatic transformation to UI-friendly formats and fallback mechanisms for error handling.

## Class

### `QuoteStatusService`

Extends `BaseService<QuoteStatusService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getQuoteStatusByCompanyRaw`

Gets raw status options by company (returns API response as-is).

**Parameters:**

- `params`: `QuoteStatusParams` object with:
  - `userId`: User ID (number, required)
  - `companyId`: Company ID (number, required)
  - `module`: Module type - "quotes" or "orders" (optional, defaults to "quotes")

**Returns:** `Promise<QuoteStatusApiResponse>` - Raw API response with status array

**Example:**

```typescript
import QuoteStatusService from "@/lib/api/services/StatusService/StatusService";

const result = await QuoteStatusService.getQuoteStatusByCompanyRaw({
  userId: 123,
  companyId: 456,
  module: "quotes",
});
```

**Features:**

- Automatic fallback to orders endpoint if quotes module fails with 500+ error
- Throws error if userId or companyId is missing

### `getQuoteStatusByCompany`

Gets status options transformed for UI use.

**Parameters:**

- `params`: `QuoteStatusParams` object

**Returns:** `Promise<QuoteStatusResponse>` - Transformed response with value/label pairs

**Example:**

```typescript
const result = await QuoteStatusService.getQuoteStatusByCompany({
  userId: 123,
  companyId: 456,
  module: "quotes",
});
// Returns: { data: [{ value: "draft", label: "Draft" }, ...], ... }
```

**Transformation:**

- Filters out null/undefined values
- Converts to `{ value, label }` format
- Applies module-specific value transformation:
  - **Quotes**: Lowercase with underscores (`"Draft"` → `"draft"`)
  - **Orders**: Preserves allowed characters (alphanumeric, spaces, `.-_,@`)

### `getQuoteStatusByCompanyRawServerSide`

Server-side safe version that returns null on error.

**Parameters:**

- `params`: `QuoteStatusParams` object

**Returns:** `Promise<QuoteStatusApiResponse | null>`

### `getQuoteStatusByCompanyServerSide`

Server-side safe version with transformation.

**Parameters:**

- `params`: `QuoteStatusParams` object

**Returns:** `Promise<QuoteStatusResponse | null>`

## API Endpoints

- **Quotes**: `GET /quotes/findStatusByCompany?userId={userId}&companyId={companyId}`
- **Orders**: `GET /orders/findStatusByCompany?userId={userId}&companyId={companyId}`

## Response Structures

```typescript
interface QuoteStatusApiResponse {
  data: string[]; // May include null values
  message: string | null;
  status: string;
}

interface QuoteStatusResponse {
  data: Array<{ value: string; label: string }>;
  message: string | null;
  status: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- **Fallback Mechanism**: If quotes module fails with 500+ error, automatically falls back to orders endpoint
- **Value Transformation**: Different transformation rules for quotes vs orders modules
- **Null Filtering**: Automatically filters out null/undefined values in transformed responses
- Server-side methods return null instead of throwing errors

## Testing

See `StatusService.test.ts` for comprehensive test cases covering:

- API calls for both modules
- Parameter validation
- Fallback mechanism
- Value transformation for both modules
- Null filtering
- Error handling
- Server-side error handling

Mocks are available in `StatusService.mocks.ts`.

## Folder Structure

```
services/
  StatusService/
    StatusService.ts
    StatusService.test.ts
    StatusService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
