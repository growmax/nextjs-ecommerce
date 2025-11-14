# BillingBranchService

Service for managing billing branch addresses for companies.

## Overview

This service provides functionality to fetch and update billing addresses for companies, with support for different API response structures.

## Class

### `BillingBranchService`

Extends `BaseService<BillingBranchService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getBillingAddresses`

Gets billing addresses for a company.

**Parameters:**

- `userId`: User ID (string)
- `companyId`: Company ID (string)

**Returns:** `Promise<BillingAddress[]>` - Array of billing addresses

**Example:**

```typescript
import BillingBranchService from "@/lib/api/services/BillingBranchService/BillingBranchService";

const addresses = await BillingBranchService.getBillingAddresses("123", "456");
```

**Response Handling:**

- Handles array responses directly
- Extracts data from `{ data: [...] }` structure
- Extracts data from `{ success: true, data: [...] }` structure
- Returns empty array for invalid structures

### `getBillingAddressesServerSide`

Server-side version that returns null on error.

**Parameters:**

- `userId`: User ID (string)
- `companyId`: Company ID (string)

**Returns:** `Promise<BillingAddress[] | null>`

### `updateBillingAddress`

Updates billing address selection for a company.

**Parameters:**

- `companyId`: Company ID (string)
- `addressId`: Address ID (string)

**Returns:** `Promise<BillingAddress>` - Updated billing address

**Example:**

```typescript
const updated = await BillingBranchService.updateBillingAddress("456", "1");
```

## API Endpoints

- **Get Billing Addresses**: `GET /branches/readBillingBranch/{userId}?companyId={companyId}`
- **Update Billing Address**: `PUT /branches/updateBillingAddress/{companyId}`

## Response Structures

```typescript
interface BillingAddress {
  id: string;
  name: string;
  addressId: {
    id: number;
    addressLine: string;
    branchName: string;
    city: string;
    country: string;
    // ... other address fields
  };
  companyId: {
    id: number;
    name: string;
  };
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Handles multiple response structures gracefully
- Returns empty array for invalid responses (client-side)
- Returns null for invalid responses (server-side)
- Server-side methods use `callSafe` for error handling

## Testing

See `BillingBranchService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Response structure handling (array, data property, success property)
- Invalid response handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `BillingBranchService.mocks.ts`.

## Folder Structure

```
services/
  BillingBranchService/
    BillingBranchService.ts
    BillingBranchService.test.ts
    BillingBranchService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `ShippingBranchService` - Service for shipping addresses
