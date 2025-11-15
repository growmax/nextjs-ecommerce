# useCurrentShippingAddress

A React hook for managing the currently selected shipping address with localStorage persistence and automatic initialization.

## Overview

This hook manages the selected shipping address for a user, with automatic initialization from localStorage or API data. It provides persistence across page reloads and handles authentication state changes gracefully.

## Usage

```tsx
import useCurrentShippingAddress from "@/hooks/useCurrentShippingAddress/useCurrentShippingAddress";

const { SelectedShippingAddressData, SelectedShippingAddressDatamutate } =
  useCurrentShippingAddress(userData);
```

## Parameters

| Parameter  | Type               | Required | Default | Description                                                                                     |
| ---------- | ------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------- |
| `userData` | `UserData \| null` | No       | `null`  | User data object with `userId` and `companyId`. Pass `null` or omit to use default user context |

### UserData Interface

```typescript
interface UserData {
  userId?: number;
  companyId?: number;
}
```

## Return Value

The hook returns an object with the following properties:

| Property                            | Type              | Description                                                                                  |
| ----------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `SelectedShippingAddressData`       | `ShippingAddress` | The currently selected shipping address. Returns empty object `{}` if no address is selected |
| `SelectedShippingAddressDatamutate` | `function`        | Function to update the selected shipping address. Updates both state and localStorage        |

### ShippingAddress Interface

```typescript
interface ShippingAddress {
  id?: string | number;
  [key: string]: unknown; // Additional address properties
}
```

## Features

### Automatic Initialization

The hook automatically initializes the selected shipping address in the following priority order:

1. **localStorage**: If a valid address is stored in `SelectedShippingAddressData`, it uses that
2. **API Data**: If no valid stored address, uses the first address from `useShipping` hook
3. **Empty Object**: If no addresses are available, returns empty object

### localStorage Persistence

The selected address is automatically persisted to localStorage under the key `SelectedShippingAddressData`. This ensures:

- Address persists across page reloads
- Address persists across browser sessions
- Address is cleared when user logs out

### Authentication-Aware

The hook automatically:

- Clears address data when user is not authenticated
- Removes localStorage data on logout
- Re-initializes when user becomes authenticated

### One-Time Initialization

The hook only initializes once per authentication session to prevent unnecessary re-initialization when dependencies change.

### Server-Side Rendering Safe

The hook checks for `window` object before accessing localStorage, making it safe for server-side rendering.

## Examples

### Basic Usage

```tsx
const { SelectedShippingAddressData, SelectedShippingAddressDatamutate } =
  useCurrentShippingAddress(userData);

// Display current address
if (SelectedShippingAddressData.id) {
  return (
    <div>
      <p>{SelectedShippingAddressData.addressLine}</p>
      <p>
        {SelectedShippingAddressData.city}, {SelectedShippingAddressData.state}
      </p>
    </div>
  );
}

return <div>No shipping address selected</div>;
```

### Updating Selected Address

```tsx
const { SelectedShippingAddressData, SelectedShippingAddressDatamutate } =
  useCurrentShippingAddress(userData);

const handleAddressSelect = (address: ShippingAddress) => {
  SelectedShippingAddressDatamutate(address);
  // Address is now updated in state and localStorage
};
```

### With User Data

```tsx
const userData = {
  userId: user?.userId,
  companyId: user?.companyId,
};

const { SelectedShippingAddressData } = useCurrentShippingAddress(userData);
```

### Without User Data (Uses Default Context)

```tsx
const { SelectedShippingAddressData } = useCurrentShippingAddress();
// or
const { SelectedShippingAddressData } = useCurrentShippingAddress(null);
```

### Handling Authentication Changes

```tsx
const { SelectedShippingAddressData } = useCurrentShippingAddress(userData);

// When user logs out, SelectedShippingAddressData automatically becomes {}
// When user logs in, it automatically initializes from localStorage or API
```

## Initialization Logic

The hook follows this initialization flow:

1. **Check Authentication**: If not authenticated, clear everything and return
2. **Wait for Loading**: If shipping addresses are still loading, wait
3. **Check if Initialized**: If already initialized in this session, skip
4. **Try localStorage**: Parse and validate stored address
5. **Fallback to API**: Use first address from API if no valid stored address
6. **Default to Empty**: Return empty object if no addresses available

## localStorage Data Validation

The hook validates localStorage data before using it:

- **Valid JSON**: Must be parseable JSON
- **Not "undefined" or "null" strings**: These are treated as invalid
- **Has ID**: The parsed data must have an `id` property
- **Error Handling**: Invalid data is silently ignored and falls back to API data

## Notes

- **One-Time Initialization**: The hook uses an `isInitialized` flag to prevent re-initialization when dependencies change. This ensures the selected address doesn't change unexpectedly.

- **Authentication Reset**: When authentication state changes, the `isInitialized` flag is reset, allowing re-initialization for the new session.

- **localStorage Key**: The hook uses `"SelectedShippingAddressData"` as the localStorage key. This is a constant and cannot be customized.

- **Empty Object Fallback**: The hook always returns an object (never `null` or `undefined`). If no address is selected, it returns an empty object `{}`.

- **Server-Side Rendering**: The hook safely handles server-side rendering by checking for `window` before accessing localStorage.

- **Dependencies**: The hook depends on:
  - `useUserDetails` context for authentication state
  - `useShipping` hook for fetching shipping addresses

## Testing

See `useCurrentShippingAddress.test.tsx` for comprehensive test cases covering:

- Initialization from localStorage
- Initialization from API data
- Authentication state changes
- Loading states
- Mutate function
- Invalid localStorage data handling
- One-time initialization behavior
- Empty data handling

Mocks are available in `useCurrentShippingAddress.mocks.ts`.

## Folder Structure

```
hooks/
  useCurrentShippingAddress/
    useCurrentShippingAddress.ts
    useCurrentShippingAddress.test.tsx
    useCurrentShippingAddress.mocks.ts
    README.md
```

## Dependencies

- `@/contexts/UserDetailsContext`: For authentication state (`useUserDetails`)
- `../useShipping`: For fetching shipping addresses (`useShipping`)
- `react`: For `useState` and `useEffect`

## Related

- Hook: `useShipping` - Fetches shipping addresses from API
- Context: `UserDetailsContext` - Provides authentication state
