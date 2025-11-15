# SubIndustryService

Service for fetching sub-industry data.

## Overview

This service provides functionality to retrieve sub-industry information.

## Class

### `SubIndustryService`

Extends `BaseService<SubIndustryService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getData`

Gets all sub-industry data.

**Returns:** `Promise<unknown>` - Sub-industry data response

**Example:**

```typescript
import SubIndustryService from "@/lib/api/services/SubIndustryService/SubIndustryService";

const data = await SubIndustryService.getData();
```

## API Endpoint

- **Get Sub Industries**: `GET /subindustrys`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Sends `undefined` as body (not empty object) to avoid sending empty object in GET request

## Testing

See `SubIndustryService.test.ts` for comprehensive test cases covering:

- API call with correct endpoint
- HTTP method verification
- Body parameter handling
- Error handling
- Response handling

Mocks are available in `SubIndustryService.mocks.ts`.

## Folder Structure

```
services/
  SubIndustryService/
    SubIndustryService.ts
    SubIndustryService.test.ts
    SubIndustryService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
