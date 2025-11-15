# ProfileService

Service for managing user profile operations.

## Overview

This service provides functionality to get and update user profile information using the authentication client.

## Class

### `ProfileService`

Extends `BaseService<ProfileService>` and uses `authClient` for API calls.

## Methods

### `getCurrentProfile`

Gets the current user's profile.

**Returns:** `Promise<Profile>` - User profile data

**Example:**

```typescript
import ProfileService from "@/lib/api/services/ProfileService/ProfileService";

const profile = await ProfileService.getCurrentProfile();
```

### `updateProfile`

Updates the current user's profile.

**Parameters:**

- `data`: Partial profile data to update (Partial<Profile>)

**Returns:** `Promise<Profile>` - Updated profile data

**Example:**

```typescript
const updated = await ProfileService.updateProfile({
  displayName: "Jane Doe",
  phoneNumber: "+1111111111",
});
```

### `getCurrentProfileServerSide`

Server-side version that returns null on error.

**Returns:** `Promise<Profile | null>`

### `updateProfileServerSide`

Server-side version that returns null on error.

**Parameters:**

- `data`: Partial profile data to update

**Returns:** `Promise<Profile | null>`

## API Endpoints

- **Get Profile**: `GET /user/me`
- **Update Profile**: `PUT /user/me`

## Response Structure

```typescript
interface ProfileResponse {
  success: boolean;
  data: Profile;
}

interface Profile {
  id: string;
  email: string;
  emailVerified: boolean;
  status: "CONFIRMED" | "PENDING" | "INACTIVE";
  tenantId: string;
  displayName: string;
  isSeller: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  secondaryEmail?: string;
  secondaryPhoneNumber?: string;
  hasPassword: boolean;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Uses `authClient` for authentication-related endpoints
- Methods extract `data` from `ProfileResponse` wrapper
- Server-side methods return null instead of throwing errors
- Returns null when response has no data property

## Testing

See `ProfileService.test.ts` for comprehensive test cases covering:

- Get profile operations
- Update profile operations
- Response data extraction
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `ProfileService.mocks.ts`.

## Folder Structure

```
services/
  ProfileService/
    ProfileService.ts
    ProfileService.test.ts
    ProfileService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `authClient`: Authentication API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `authClient` - Authentication API client
