# DashboardService

Service for fetching and transforming dashboard data.

## Overview

This service provides functionality to retrieve dashboard data and transform it for chart visualization and statistics.

## Class

### `DashboardService`

Extends `BaseService<DashboardService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getDashboardData`

Gets dashboard data with filters.

**Parameters:**

- `params`: `DashboardQueryParams` object with userId, companyId, offset, limit, currencyId
- `filters`: `DashboardFilterParams` object with filter criteria

**Returns:** `Promise<DashboardApiResponse>` - Dashboard response

**Example:**

```typescript
import DashboardService from "@/lib/api/services/DashboardService/DashboardService";

const data = await DashboardService.getDashboardData(
  {
    userId: 123,
    companyId: 456,
    offset: 0,
    limit: 99999999,
    currencyId: 1,
  },
  {
    fromDate: "2024-01-01",
    toDate: "2024-12-31",
    status: ["CONFIRMED"],
  }
);
```

### `transformOrderDataForChart`

Transforms dashboard data for chart visualization.

**Parameters:**

- `data`: `DashboardApiResponse` object

**Returns:** Array of chart data objects with aggregated monthly data

### `calculateTrendPercentage`

Calculates trend percentage from dashboard data.

**Parameters:**

- `data`: `DashboardApiResponse` object

**Returns:** `number` - Trend percentage

### `getDateRange`

Gets date range from dashboard data.

**Parameters:**

- `data`: `DashboardApiResponse` object

**Returns:** `string` - Date range string

### `getComprehensiveStats`

Gets comprehensive statistics from dashboard data.

**Parameters:**

- `data`: `DashboardApiResponse` object

**Returns:** Object with comprehensive statistics

## API Endpoint

- **Get Dashboard Data**: `POST /dashBoardService/findByDashBoardFilterNew?userId={userId}&companyId={companyId}&offset={offset}&limit={limit}&currencyId={currencyId}`
- **Body**: Filter parameters

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Utility methods transform and analyze dashboard data
- Handles order and quote status aggregation
- Calculates trends and statistics

## Testing

See `DashboardService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Data transformation
- Trend calculation
- Date range extraction
- Statistics calculation
- Error handling
- HTTP method verification

Mocks are available in `DashboardService.mocks.ts`.

## Folder Structure

```
services/
  DashboardService/
    DashboardService.ts
    DashboardService.test.ts
    DashboardService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client
- Types: `@/types/dashboard` - Dashboard type definitions

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
