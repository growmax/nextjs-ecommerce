# useGetLatestPaymentTerms

A React hook for fetching the latest payment terms with cash discount using SWR for data fetching and caching.

## Overview

This hook fetches all payment terms for a user and filters for the first payment term that has cash discount enabled. It calls the `/api/sales/payments/getAllPaymentTerms` API route, which internally uses `PaymentService.fetchPaymentTermsWithContext()`. It provides automatic caching, loading states, and error handling through SWR.

## Usage

```tsx
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";

const { latestPaymentTerms, latestPaymentTermsLoading } =
  useGetLatestPaymentTerms(shouldFetch);
```

## Parameters

| Parameter                | Type      | Required | Default | Description                                                                       |
| ------------------------ | --------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `fetchLatestPaymentTerm` | `boolean` | No       | `false` | Condition to enable/disable the fetch. When `false`, the hook will not fetch data |

## Return Value

The hook returns an object with the following properties:

| Property                    | Type                       | Description                                                                                                                             |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `latestPaymentTerms`        | `PaymentTerm \| undefined` | The first payment term with cash discount enabled. Returns `undefined` if no cash discount terms are found or if data is not yet loaded |
| `latestPaymentTermsLoading` | `boolean`                  | Whether the payment terms are currently being fetched. Returns `true` when data is not available and there's no error                   |

## Features

### Conditional Fetching

The hook only fetches data when:

- `fetchLatestPaymentTerm` is `true`
- `userId` is available from `useCurrentUser`

When either condition is not met, the SWR key is set to `null`, which prevents the fetcher from being called.

### SWR Key Generation

The SWR cache key is generated as:

```typescript
userId && fetchLatestPaymentTerm ? ["fetchPaymentTerms", userId] : null;
```

This ensures:

- Proper caching based on user ID
- Automatic cache invalidation when user changes
- No unnecessary API calls when conditions aren't met

### Cash Discount Filtering

The hook automatically filters payment terms to find the first one with `cashdiscount === true`:

```typescript
const dataterms = response?.data?.data?.filter(
  (term: PaymentTerm) => term.cashdiscount === true
)?.[0];
```

If no cash discount terms are found, `latestPaymentTerms` will be `undefined`.

### Fetcher Function

The fetcher function:

1. Validates that `userId` is available (throws error if not)
2. Calls the API with `userId` and `companyId`
3. Filters the response for cash discount terms
4. Returns the first cash discount term (or `undefined`)

### SWR Configuration

The hook uses the following SWR options:

- `revalidateOnFocus: true` - Refetches data when the window regains focus

This ensures the latest payment terms are always up-to-date when the user returns to the application.

## Examples

### Basic Usage

```tsx
const { latestPaymentTerms, latestPaymentTermsLoading } =
  useGetLatestPaymentTerms(true);

if (latestPaymentTermsLoading) {
  return <Spinner />;
}

if (latestPaymentTerms) {
  return (
    <div>
      <p>Cash Discount: {latestPaymentTerms.cashdiscountValue}%</p>
      <p>Terms: {latestPaymentTerms.paymentTerms}</p>
    </div>
  );
}

return <div>No cash discount terms available</div>;
```

### Conditional Fetching

```tsx
const shouldFetch = !loading && !!user && shouldCheckCashDiscount;

const { latestPaymentTerms } = useGetLatestPaymentTerms(shouldFetch);
```

### Using in Cash Discount Card

```tsx
const { latestPaymentTerms, latestPaymentTermsLoading } =
  useGetLatestPaymentTerms(true);

<CashDiscountCard
  latestpaymentTerms={latestPaymentTerms}
  islatestTermAvailable={!!latestPaymentTerms && !latestPaymentTermsLoading}
  // ... other props
/>;
```

### Handling Undefined State

```tsx
const { latestPaymentTerms, latestPaymentTermsLoading } =
  useGetLatestPaymentTerms(true);

// Check if cash discount is available
const isCashDiscountAvailable =
  !latestPaymentTermsLoading && !!latestPaymentTerms;

if (isCashDiscountAvailable) {
  // Apply cash discount logic
  const discountValue = latestPaymentTerms.cashdiscountValue || 0;
  // ...
}
```

## Data Structure

### PaymentTerm

```typescript
interface PaymentTerm {
  id?: number;
  paymentTerms?: string;
  paymentTermsCode?: string;
  cashdiscount?: boolean;
  cashdiscountValue?: number;
  // ... other payment term properties
}
```

### API Response

The hook expects the API to return data in the following format:

```typescript
{
  success: true,
  data: PaymentTerm[],
  isLoggedIn: true
}
```

The hook filters `data` array for terms where `cashdiscount === true` and returns the first match.

## API Route

The hook calls the following API route:

**POST** `/api/sales/payments/getAllPaymentTerms`

**Request Body:**

```json
{
  "userId": 123,
  "companyId": 456
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paymentTerms": "Net 30",
      "cashdiscount": false
    },
    {
      "id": 2,
      "paymentTerms": "2/10 Net 30",
      "cashdiscount": true,
      "cashdiscountValue": 2
    }
  ],
  "isLoggedIn": true
}
```

The API route internally uses `PaymentService.fetchPaymentTermsWithContext()` which calls the backend endpoint `/PaymentTerms/fetchPaymentTerms?userId={userId}&isB2C=false`.

## Notes

- **Cash Discount Filtering**: The hook only returns payment terms that have `cashdiscount === true`. If no such terms exist, `latestPaymentTerms` will be `undefined`.

- **First Match Only**: The hook returns only the first cash discount term found. If multiple cash discount terms exist, only the first one is returned.

- **User ID Required**: The fetcher throws an error if `userId` is not available. This prevents invalid API calls.

- **SWR Immutable**: The hook uses `swr/immutable` which prevents automatic revalidation on mount. However, `revalidateOnFocus: true` ensures data is refreshed when the window regains focus.

- **Loading State**: The `latestPaymentTermsLoading` flag is `true` when data is not yet available and there's no error. Once data is loaded or an error occurs, loading becomes `false`.

- **Default Parameter**: If `fetchLatestPaymentTerm` is not provided, it defaults to `false`, meaning the hook will not fetch by default.

## Testing

See `useGetLatestPaymentTerms.test.tsx` for comprehensive test cases covering:

- Successful data fetching with cash discount terms
- No cash discount terms handling
- Conditional fetching (fetchLatestPaymentTerm, userId)
- Loading states
- Error handling
- SWR key generation
- Fetcher function behavior
- Cash discount filtering
- SWR options configuration

Mocks are available in `useGetLatestPaymentTerms.mocks.ts`.

## Folder Structure

```
hooks/
  useGetLatestPaymentTerms/
    useGetLatestPaymentTerms.ts
    useGetLatestPaymentTerms.test.tsx
    useGetLatestPaymentTerms.mocks.ts
    README.md
```

## Dependencies

- `swr/immutable`: For data fetching and caching (immutable mode)
- `axios`: For making HTTP requests to the API route
- `@/hooks/useCurrentUser`: For user context

## Related

- API Route: `/api/sales/payments/getAllPaymentTerms`
- Service: `PaymentService.fetchPaymentTermsWithContext()`
- Backend Endpoint: `/PaymentTerms/fetchPaymentTerms?userId={userId}&isB2C=false`
- Type: `PaymentTerm`
