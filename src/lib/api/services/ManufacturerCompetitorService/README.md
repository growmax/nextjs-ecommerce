# ManufacturerCompetitorService

Service for fetching manufacturer competitor data.

## Overview

This service provides functionality to retrieve competitor information for manufacturer companies.

## Class

### `ManufacturerCompetitorService`

Extends `BaseService<ManufacturerCompetitorService>` and uses `coreCommerceClient` for API calls.

## Methods

### `fetchCompetitors`

Fetches all competitors for a manufacturer company.

**Parameters:**

- `companyId`: Manufacturer company ID (number | string)

**Returns:** `Promise<FetchCompetitorsResponse>` - Competitors response

**Example:**

```typescript
import ManufacturerCompetitorService from "@/lib/api/services/ManufacturerCompetitorService/ManufacturerCompetitorService";

const competitors = await ManufacturerCompetitorService.fetchCompetitors(123);
```

### `fetchCompetitorsServerSide`

Server-side version that returns null on error.

**Parameters:**

- `companyId`: Manufacturer company ID (number | string)

**Returns:** `Promise<FetchCompetitorsResponse | null>`

### `getCompetitorsList`

Gets just the competitor details array (convenience method).

**Parameters:**

- `companyId`: Manufacturer company ID (number | string)

**Returns:** `Promise<CompetitorDetail[]>` - Array of competitors

**Example:**

```typescript
const competitors = await ManufacturerCompetitorService.getCompetitorsList(123);
// Returns: [{ id: 1, name: "Competitor 1", ... }, ...]
```

### `getCompetitorsListServerSide`

Server-side version that returns empty array on error.

**Parameters:**

- `companyId`: Manufacturer company ID (number | string)

**Returns:** `Promise<CompetitorDetail[]>` - Returns empty array on error

## API Endpoint

- **Fetch Competitors**: `GET manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId={companyId}`

## Response Structures

```typescript
interface FetchCompetitorsResponse {
  success: boolean;
  data: {
    competitorDetails: CompetitorDetail[];
  };
}

interface CompetitorDetail {
  id?: number;
  name?: string;
  competitorName?: string;
  manufacturerCompanyId?: number;
  createdDate?: string;
  lastUpdatedDate?: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Supports both number and string companyId
- Convenience methods extract competitor details array
- Server-side methods return empty array instead of throwing errors
- Returns empty array when response is null or missing competitorDetails

## Testing

See `ManufacturerCompetitorService.test.ts` for comprehensive test cases covering:

- API calls with number and string companyId
- Response extraction
- Empty response handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `ManufacturerCompetitorService.mocks.ts`.

## Folder Structure

```
services/
  ManufacturerCompetitorService/
    ManufacturerCompetitorService.ts
    ManufacturerCompetitorService.test.ts
    ManufacturerCompetitorService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
