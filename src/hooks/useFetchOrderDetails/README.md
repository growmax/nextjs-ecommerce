# useFetchOrderDetails

A React hook for fetching and processing order details using a service and SWR for caching.

## Usage

```tsx
import useFetchOrderDetails from "./useFetchOrderDetails";

const {
  fetchOrderResponse,
  fetchOrderError,
  fetchOrderResponseLoading,
  fetchOrderResponseMutate,
} = useFetchOrderDetails(orderId);
```

## API

- `orderId`: The order identifier (string | null | undefined)
- Returns: `{ fetchOrderResponse, fetchOrderError, fetchOrderResponseLoading, fetchOrderResponseMutate }`

## Testing

See `useFetchOrderDetails.test.ts` for example test cases using mocks from `useFetchOrderDetails.mocks.ts`.

## Folder Structure

```
hooks/
  useFetchOrderDetails/
    useFetchOrderDetails.ts
    useFetchOrderDetails.test.ts
    useFetchOrderDetails.mocks.ts
    README.md
```
