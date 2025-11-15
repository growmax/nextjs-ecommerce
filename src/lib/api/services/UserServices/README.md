# UserServices

Service for fetching user data by name/ID.

## Overview

This service provides functionality to retrieve user information by name or ID.

## Class

### `UserServices`

Extends `BaseService<UserServices>` and uses `coreCommerceClient` for API calls.

## Methods

### `getUser`

Gets user by name or ID.

**Parameters:**

- `params`: `GetUserParams` object with:
  - `sub`: User name or ID (string | number)

**Returns:** `Promise<UserApiResponse>` - User API response

**Example:**

```typescript
import UserServices from "@/lib/api/services/UserServices/UserServices";

const user = await UserServices.getUser({ sub: "user123" });
```

## API Endpoint

- **Get User**: `GET users/findByName?name={sub}`

## Response Structure

```typescript
interface UserApiResponse {
  data: {
    id: string;
    name: string;
    email?: string;
    companyId?: number;
    // ... other user fields
  };
  message: string;
  status: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Supports both string and number sub parameter
- Similar to `UserService` but simpler, using BaseService pattern

## Testing

See `UserServices.test.ts` for comprehensive test cases covering:

- API calls with string and number sub
- Response handling
- Error handling
- HTTP method verification

Mocks are available in `UserServices.mocks.ts`.

## Folder Structure

```
services/
  UserServices/
    UserServices.ts
    UserServices.test.ts
    UserServices.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `UserService` - More comprehensive user service
