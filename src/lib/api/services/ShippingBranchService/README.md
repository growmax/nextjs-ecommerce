# ShippingBranchService

Service for managing shipping branch addresses for companies.

## Overview

This service provides functionality to fetch shipping addresses for companies, with support for different API response structures.

## Class

### `ShippingBranchService`

Extends `BaseService<ShippingBranchService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getShippingAddresses`

Gets shipping addresses for a company.

**Parameters:**

- `userId`: User ID (string)
- `companyId`: Company ID (string)

**Returns:** `Promise<ShippingAddress[]>` - Array of shipping addresses

**Example:**

```typescript
import ShippingBranchService from "@/lib/api/services/ShippingBranchService/ShippingBranchService";

const addresses = await ShippingBranchService.getShippingAddresses(
  "123",
  "456"
);
```

**Response Handling:**

- Handles array responses directly
- Extracts data from `{ data: [...] }` structure
- Extracts data from `{ success: true, data: [...] }` structure
- Returns empty array for invalid structures

## API Endpoints

- **Get Shipping Addresses**: `GET /branches/readShippingBranch/{userId}?companyId={companyId}`

## Response Structures

```typescript
interface ShippingAddress {
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
- Returns empty array for invalid responses
- Similar structure to `BillingBranchService`

## Testing

See `ShippingBranchService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Response structure handling (array, data property, success property)
- Invalid response handling
- Error handling
- HTTP method verification

Mocks are available in `ShippingBranchService.mocks.ts`.

## Folder Structure

```
services/
  ShippingBranchService/
    ShippingBranchService.ts
    ShippingBranchService.test.ts
    ShippingBranchService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `BillingBranchService` - Service for billing addresses
