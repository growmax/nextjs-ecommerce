# useCheckVolumeDiscountEnabled

A React hook for checking if volume discount is enabled for a company using SWR for data fetching and caching.

## Overview

This hook checks whether volume discount functionality is enabled for a specific company by calling the `/api/sales/checkIsVDEnabledByCompanyId` API route, which internally uses `DiscountService.checkIsVDEnabledByCompanyIdWithContext()`. It provides automatic caching, loading states, and error handling through SWR.

## Usage

```tsx
import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled";

const { VDapplied, VolumeDiscountAvailable, ShowVDButton, vdLoading } =
  useCheckVolumeDiscountEnabled(companyId, shouldCheck);
```

## Parameters

| Parameter   | Type                                    | Required | Default | Description                                                                       |
| ----------- | --------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `companyId` | `string \| number \| undefined \| null` | No       | -       | The company ID to check for volume discount availability                          |
| `cond`      | `boolean`                               | No       | `true`  | Condition to enable/disable the check. When `false`, the hook will not fetch data |

## Return Value

The hook returns an object with the following properties:

| Property                  | Type      | Description                                                                                                                |
| ------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `VDapplied`               | `boolean` | Always returns `false`. This flag indicates if volume discount is currently applied (not whether it's available)           |
| `ShowVDButton`            | `boolean` | Whether to show the volume discount button. Returns `true` if volume discount is enabled for the company                   |
| `VolumeDiscountAvailable` | `boolean` | Whether volume discount is available for the company. Returns `true` if volume discount is enabled                         |
| `vdLoading`               | `boolean` | Whether the volume discount check is currently loading. Returns `true` when data is not yet available and there's no error |

## Features

### Conditional Fetching

The hook only fetches data when:

- `companyId` is provided (not `undefined` or `null`)
- `cond` is `true` (default)

When either condition is not met, the SWR key is set to `null`, which prevents the fetcher from being called.

### SWR Key Generation

The SWR cache key is generated as:

```typescript
companyId && cond
  ? ["Check_Is_Volume_Discount_Enabled", companyId, cond]
  : null;
```

This ensures:

- Proper caching based on company ID
- Automatic cache invalidation when company ID changes
- No unnecessary API calls when conditions aren't met

### Data Structure

The hook expects the API response in the following format:

```typescript
{
  data: {
    data: boolean; // true if VD is enabled, false otherwise
  }
}
```

The hook checks `data?.data?.data` to determine if volume discount is enabled.

### Loading State

The `vdLoading` flag is `true` when:

- Data is not yet available (`!data`)
- No error has occurred (`!error`)

This provides a simple way to show loading indicators while the check is in progress.

## Examples

### Basic Usage

```tsx
const { ShowVDButton, VolumeDiscountAvailable, vdLoading } =
  useCheckVolumeDiscountEnabled(companyId);

if (vdLoading) {
  return <Spinner />;
}

if (ShowVDButton && VolumeDiscountAvailable) {
  return <VolumeDiscountButton />;
}
```

### Conditional Checking

```tsx
const shouldCheck = !loading && products.length > 0 && !!companyId;

const { ShowVDButton, vdLoading } = useCheckVolumeDiscountEnabled(
  companyId,
  shouldCheck
);
```

### With String Company ID

```tsx
const companyId = user?.companyId?.toString();

const { VolumeDiscountAvailable } = useCheckVolumeDiscountEnabled(companyId);
```

### Handling Different States

```tsx
const { VDapplied, VolumeDiscountAvailable, ShowVDButton, vdLoading } =
  useCheckVolumeDiscountEnabled(buyerCompanyId, allProductsHavePrices);

// Show loading state
if (vdLoading) {
  return <div>Checking volume discount availability...</div>;
}

// Show VD button if available
if (ShowVDButton && VolumeDiscountAvailable) {
  return (
    <button onClick={handleApplyVolumeDiscount}>Apply Volume Discount</button>
  );
}

// Note: VDapplied is always false in this hook
// It's included for API consistency but doesn't indicate applied status
```

## API Route

The hook calls the following API route:

**POST** `/api/sales/checkIsVDEnabledByCompanyId`

**Request Body:**

```json
{
  "companyId": "123" // or number
}
```

**Response:**

```json
{
  "data": true // or false
}
```

The API route internally uses `DiscountService.checkIsVDEnabledByCompanyIdWithContext()` which calls the backend endpoint `/discount/CheckorderDiscount?CompanyId={companyId}`.

## Notes

- **VDapplied Flag**: The `VDapplied` property always returns `false`. This hook only checks if volume discount is _available_ for a company, not whether it's currently _applied_ to an order. To check if VD is applied, you would need to check the order/quote data directly.

- **SWR Immutable**: The hook uses `swr/immutable` which prevents automatic revalidation. This is suitable for configuration-like data that doesn't change frequently.

- **Error Handling**: The hook doesn't expose error state directly. If an error occurs, `vdLoading` will be `false` and `ShowVDButton`/`VolumeDiscountAvailable` will be `false`. You can access error state through SWR's return value if needed.

- **Type Safety**: The hook accepts both string and number types for `companyId` to accommodate different data sources.

## Testing

See `useCheckVolumeDiscountEnabled.test.tsx` for comprehensive test cases covering:

- Successful data fetching (enabled/disabled states)
- String and number companyId handling
- Conditional fetching (undefined, null, cond flag)
- Loading states
- Error handling
- SWR key generation
- Fetcher function configuration

Mocks are available in `useCheckVolumeDiscountEnabled.mocks.ts`.

## Folder Structure

```
hooks/
  useCheckVolumeDiscountEnabled/
    useCheckVolumeDiscountEnabled.ts
    useCheckVolumeDiscountEnabled.test.tsx
    useCheckVolumeDiscountEnabled.mocks.ts
    README.md
```

## Dependencies

- `swr/immutable`: For data fetching and caching (immutable mode)
- `axios`: For making HTTP requests to the API route

## Related

- API Route: `/api/sales/checkIsVDEnabledByCompanyId`
- Service: `DiscountService.checkIsVDEnabledByCompanyIdWithContext()`
- Backend Endpoint: `/discount/CheckorderDiscount?CompanyId={companyId}`
