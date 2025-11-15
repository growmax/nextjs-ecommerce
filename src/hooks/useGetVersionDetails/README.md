# useGetVersionDetails

A React hook for fetching order details by version using React Query for data fetching and caching.

## Overview

This hook fetches order details for a specific version of an order by calling `OrderDetailsService.fetchOrderDetailsByVersion()`. It provides automatic caching, loading states, error handling, and supports nested response structures through React Query.

## Usage

```tsx
import { useGetVersionDetails } from "@/hooks/useGetVersionDetails/useGetVersionDetails";

const { data, isLoading, isError, error, refetch } = useGetVersionDetails({
  orderIdentifier: "ORDER-123",
  orderVersion: 2,
  triggerVersionCall: true,
});
```

## Parameters

### `UseGetVersionDetailsParams`

| Parameter            | Type             | Required | Description                                                                |
| -------------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| `orderIdentifier`    | `string`         | Yes      | The order identifier                                                       |
| `orderVersion`       | `number \| null` | Yes      | The order version number. Must not be `null` for fetch to occur            |
| `triggerVersionCall` | `boolean`        | Yes      | Flag to enable/disable the fetch. When `false`, the query will not execute |

## Return Value

The hook returns a React Query result object with the following properties:

| Property    | Type                                | Description                                                                        |
| ----------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `data`      | `OrderDetailsResponse \| undefined` | The order details response data                                                    |
| `isLoading` | `boolean`                           | Whether the query is currently loading                                             |
| `isError`   | `boolean`                           | Whether the query encountered an error                                             |
| `error`     | `Error \| null`                     | Error object if the query failed                                                   |
| `refetch`   | `function`                          | Function to manually refetch the data                                              |
| `...query`  | -                                   | All other React Query properties (e.g., `status`, `isFetching`, `isSuccess`, etc.) |

## Features

### Conditional Fetching

The hook only fetches data when all of the following conditions are met:

- `triggerVersionCall` is `true`
- `orderVersion` is not `null`
- `orderIdentifier` is provided (truthy)
- User is available (`user?.userId` and `user?.companyId`)
- Tenant data is available (`tenantData?.tenant?.tenantCode`)

When any condition is not met, the query is disabled (`enabled: false`).

### Query Key Generation

The query key is generated as:

```typescript
[
  "orderVersionDetails",
  orderIdentifier,
  orderVersion,
  user?.userId,
  user?.companyId,
];
```

This ensures:

- Proper caching based on order identifier and version
- Automatic cache invalidation when any parameter changes
- User-specific caching

### Nested Response Handling

The hook automatically handles nested response structures from the API:

**Direct Response:**

```typescript
{
  data: { ... },
  message: null,
  status: "success"
}
```

**Nested Response:**

```typescript
{
  success: true,
  data: {
    data: { ... }
  },
  message: "Success",
  status: "success"
}
```

The hook extracts the actual data from nested structures and normalizes it to the `OrderDetailsResponse` format.

### Caching Configuration

- **Stale Time**: 5 minutes (data is considered fresh for 5 minutes)
- **Garbage Collection Time**: 10 minutes (cached data is kept for 10 minutes)
- **Placeholder Data**: Shows previous data while fetching new data (prevents loading flicker)

### Error Handling

The hook validates required parameters in the `queryFn` and throws an error if any are missing:

- User ID
- Company ID
- Tenant Code
- Order Identifier
- Order Version

## Examples

### Basic Usage

```tsx
const { data, isLoading, isError } = useGetVersionDetails({
  orderIdentifier: orderId,
  orderVersion: selectedVersion,
  triggerVersionCall: !!selectedVersion,
});

if (isLoading) {
  return <Spinner />;
}

if (isError) {
  return <div>Error loading version details</div>;
}

return <OrderDetailsView data={data} />;
```

### Conditional Fetching

```tsx
const shouldFetch = !!selectedVersion && selectedVersion !== currentVersion;

const { data, isLoading } = useGetVersionDetails({
  orderIdentifier: orderId,
  orderVersion: selectedVersion,
  triggerVersionCall: shouldFetch,
});
```

### With Version Selection

```tsx
const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

const { data: versionData, isLoading: versionLoading } = useGetVersionDetails({
  orderIdentifier: orderIdentifier,
  orderVersion: selectedVersion,
  triggerVersionCall: !!selectedVersion,
});

const handleVersionChange = (version: number) => {
  setSelectedVersion(version);
};
```

### Error Handling

```tsx
const { data, error, isError, refetch } = useGetVersionDetails({
  orderIdentifier: orderId,
  orderVersion: version,
  triggerVersionCall: true,
});

if (isError) {
  return (
    <div>
      <p>Failed to load version details: {error?.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Using Placeholder Data

```tsx
const { data, isLoading } = useGetVersionDetails({
  orderIdentifier: orderId,
  orderVersion: newVersion,
  triggerVersionCall: true,
});

// Previous data is shown while new data is loading
// This prevents UI flicker when switching versions
return <OrderDetailsView data={data} loading={isLoading} />;
```

## Data Structure

### OrderDetailsResponse

```typescript
interface OrderDetailsResponse {
  data: {
    orderIdentifier: string;
    orderDetails: OrderDetailItem[];
    // ... other order data
  };
  message: string | null;
  status: string;
}
```

## Service Method

The hook internally calls:

**`OrderDetailsService.fetchOrderDetailsByVersion(params)`**

This service method calls the backend endpoint:

```
GET /orders/fetchOrderDetailsByVersion?userId={userId}&companyId={companyId}&orderIdentifier={orderIdentifier}&orderVersion={orderVersion}
```

## Notes

- **Placeholder Data**: The hook uses `placeholderData: previousData => previousData` to show the previous version's data while fetching a new version. This provides a smooth user experience when switching between versions.

- **Nested Response Support**: The hook automatically handles both direct and nested API response structures, ensuring consistent data format regardless of API response format.

- **Parameter Validation**: The hook validates all required parameters before making the API call. If any are missing, it throws an error with the message "Missing required parameters".

- **User Context**: The hook requires user and tenant context to be available. It will not fetch if these are not provided.

- **Version Null Handling**: When `orderVersion` is `null`, the query is disabled. This is useful when no version is selected yet.

## Testing

See `useGetVersionDetails.test.tsx` for comprehensive test cases covering:

- Successful data fetching
- Nested response structure handling
- Conditional fetching (triggerVersionCall, orderVersion, orderIdentifier)
- Loading states
- Error handling
- Query key generation
- Placeholder data behavior
- Different order versions
- User and tenant data availability

Mocks are available in `useGetVersionDetails.mocks.ts`.

## Folder Structure

```
hooks/
  useGetVersionDetails/
    useGetVersionDetails.ts
    useGetVersionDetails.test.tsx
    useGetVersionDetails.mocks.ts
    README.md
```

## Dependencies

- `@tanstack/react-query`: For data fetching and caching
- `@/hooks/useCurrentUser`: For user context
- `@/hooks/useTenantData`: For tenant context
- `@/lib/api`: For `OrderDetailsService` and `OrderDetailsResponse` type

## Related

- Service: `OrderDetailsService.fetchOrderDetailsByVersion()`
- Backend Endpoint: `/orders/fetchOrderDetailsByVersion`
- Type: `OrderDetailsResponse`
