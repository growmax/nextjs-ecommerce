# useGetManufacturerCompetitors

A React hook for fetching manufacturer competitors using SWR for data fetching and caching.

## Overview

This hook fetches the list of competitors for a manufacturer company by calling `ManufacturerCompetitorService.fetchCompetitors()`. It provides automatic caching, loading states, and error handling through SWR.

## Usage

```tsx
import useGetManufacturerCompetitors from "@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors";

const { competitors, competitorsLoading, competitorsError } =
  useGetManufacturerCompetitors(sellerCompanyId, shouldFetch);
```

## Parameters

| Parameter         | Type                            | Required | Default | Description                                                                       |
| ----------------- | ------------------------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `sellerCompanyId` | `number \| string \| undefined` | No       | -       | The seller/manufacturer company ID to fetch competitors for                       |
| `cond`            | `boolean`                       | No       | `true`  | Condition to enable/disable the fetch. When `false`, the hook will not fetch data |

## Return Value

The hook returns an object with the following properties:

| Property             | Type                 | Description                                                                                |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `competitors`        | `CompetitorDetail[]` | Array of competitor details. Returns empty array if no data is available or if fetch fails |
| `competitorsLoading` | `boolean`            | Whether the competitors are currently being fetched                                        |
| `competitorsError`   | `Error \| undefined` | Error object if the fetch failed, `undefined` otherwise                                    |

## Features

### Conditional Fetching

The hook only fetches data when:

- `sellerCompanyId` is provided (not `undefined`)
- `cond` is `true` (default)

When either condition is not met, the SWR key is set to `null`, which prevents the fetcher from being called.

### SWR Key Generation

The SWR cache key is generated as:

```typescript
cond && sellerCompanyId ? `get-Competitor-${sellerCompanyId}` : null;
```

This ensures:

- Proper caching based on seller company ID
- Automatic cache invalidation when seller company ID changes
- No unnecessary API calls when conditions aren't met

### Fetcher Function

The fetcher function handles two cases:

1. **When `sellerCompanyId` is provided**: Calls `ManufacturerCompetitorService.fetchCompetitors(sellerCompanyId)`
2. **When `sellerCompanyId` is undefined**: Returns `{ data: { competitorDetails: [] } }` without making an API call

### SWR Configuration

The hook uses the following SWR options:

- `revalidateOnFocus: false` - Prevents refetching when the window regains focus
- `revalidateOnReconnect: false` - Prevents refetching when the network reconnects

This configuration is suitable for data that doesn't need to be refreshed frequently.

## Examples

### Basic Usage

```tsx
const { competitors, competitorsLoading, competitorsError } =
  useGetManufacturerCompetitors(sellerCompanyId);

if (competitorsLoading) {
  return <Spinner />;
}

if (competitorsError) {
  return <div>Error loading competitors</div>;
}

return (
  <ul>
    {competitors.map(competitor => (
      <li key={competitor.id}>{competitor.name}</li>
    ))}
  </ul>
);
```

### Conditional Fetching

```tsx
const shouldFetch = !loading && !!sellerCompanyId;

const { competitors, competitorsLoading } = useGetManufacturerCompetitors(
  sellerCompanyId,
  shouldFetch
);
```

### With String Company ID

```tsx
const sellerCompanyId =
  quoteDetails?.data?.quotationDetails?.[0]?.sellerCompanyId?.toString();

const { competitors } = useGetManufacturerCompetitors(sellerCompanyId);
```

### Handling Empty Results

```tsx
const { competitors } = useGetManufacturerCompetitors(sellerCompanyId);

if (competitors.length === 0) {
  return <div>No competitors found</div>;
}

return <CompetitorList competitors={competitors} />;
```

### Error Handling

```tsx
const { competitors, competitorsLoading, competitorsError } =
  useGetManufacturerCompetitors(sellerCompanyId);

if (competitorsError) {
  console.error("Failed to fetch competitors:", competitorsError);
  return (
    <div>
      <p>Failed to load competitors. Please try again.</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}
```

## Data Structure

### CompetitorDetail

```typescript
interface CompetitorDetail {
  id?: number;
  name?: string;
  competitorName?: string;
  manufacturerCompanyId?: number;
  createdDate?: string;
  lastUpdatedDate?: string;
}
```

### API Response

The hook expects the service to return data in the following format:

```typescript
{
  data: {
    competitorDetails: CompetitorDetail[]
  }
}
```

## Service Method

The hook internally calls:

**`ManufacturerCompetitorService.fetchCompetitors(companyId)`**

This service method calls the backend endpoint:

```
GET /manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId={companyId}
```

## Notes

- **Empty Array Fallback**: The hook always returns an array for `competitors`, even when data is not available or when an error occurs. This prevents null/undefined errors in components.

- **SWR Caching**: Data is cached by SWR based on the seller company ID. Changing the `sellerCompanyId` will trigger a new fetch.

- **Type Safety**: The hook exports the `CompetitorDetail` type for use in components.

- **No Auto-Refetch**: The hook is configured to not refetch on window focus or network reconnect, making it suitable for relatively static data.

- **Fetcher Optimization**: When `sellerCompanyId` is undefined, the fetcher returns an empty array immediately without making an API call, improving performance.

## Testing

See `useGetManufacturerCompetitors.test.tsx` for comprehensive test cases covering:

- Successful data fetching
- Empty results handling
- String and number sellerCompanyId handling
- Conditional fetching (undefined, cond flag)
- Loading states
- Error handling
- SWR key generation
- Fetcher function behavior
- SWR options configuration

Mocks are available in `useGetManufacturerCompetitors.mocks.ts`.

## Folder Structure

```
hooks/
  useGetManufacturerCompetitors/
    useGetManufacturerCompetitors.ts
    useGetManufacturerCompetitors.test.tsx
    useGetManufacturerCompetitors.mocks.ts
    README.md
```

## Dependencies

- `swr`: For data fetching and caching
- `@/lib/api`: For `ManufacturerCompetitorService` and `CompetitorDetail` type

## Related

- Service: `ManufacturerCompetitorService.fetchCompetitors()`
- Backend Endpoint: `/manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId={companyId}`
- Type: `CompetitorDetail`
