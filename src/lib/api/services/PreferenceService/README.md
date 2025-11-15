# PreferenceService

Service for managing user preferences and filter preferences for different modules (order, quote, etc.).

## Overview

This service provides functionality to fetch, create, update, and save user preferences and filter preferences. It automatically extracts user data from JWT tokens and provides both client-side and server-side safe methods.

## Class

### `PreferenceService`

Extends `BaseService<PreferenceService>` and uses `preferenceClient` for API calls.

## Methods

### Finding Preferences

#### `findPreferences`

Finds user preferences for a specific module (auto-extracts user data from token).

**Parameters:**

- `module`: Module type (order, quote, etc.)

**Returns:** `Promise<UserPreference>`

**Example:**

```typescript
import PreferenceService from "@/lib/api/services/PreferenceService/PreferenceService";

const preferences = await PreferenceService.findPreferences("order");
```

#### `findPreferencesServerSide`

Server-safe version that returns null on error.

**Parameters:**

- `module`: Module type (order, quote, etc.)

**Returns:** `Promise<UserPreference | null>`

#### `findPreferencesWithParams`

Finds user preferences with explicit parameters (for advanced usage).

**Parameters:**

- `userId`: User ID (number)
- `module`: Module type (order, quote, etc.)
- `tenantCode`: Tenant code (string)
- `isMobile`: Mobile flag (boolean, default: false)

**Returns:** `Promise<UserPreference>`

#### `findPreferencesWithParamsServerSide`

Server-safe version with custom context (for API routes).

**Parameters:**

- `userId`: User ID (number)
- `module`: Module type (order, quote, etc.)
- `context`: Request context with accessToken and other fields

**Returns:** `Promise<UserPreference | null>`

#### `findOrderPreferences`

Finds order preferences with company context.

**Parameters:**

- `requestData`: `OrderPreferencesRequest` object

**Returns:** `Promise<OrderPreferencesResponse>`

#### `findOrderPreferencesAuto`

Finds order preferences with auto-extracted user data.

**Parameters:**

- `isMobile`: Optional flag for mobile preferences (boolean, default: false)

**Returns:** `Promise<OrderPreferencesResponse>`

#### `findOrderPreferencesServerSide`

Server-safe version for order preferences.

**Parameters:**

- `isMobile`: Optional flag for mobile preferences (boolean, default: false)

**Returns:** `Promise<OrderPreferencesResponse | null>`

#### `findFilterPreferences`

Finds filter preferences for a specific module with auto-extracted user data.

**Parameters:**

- `module`: Module type (quote, order, etc.)

**Returns:** `Promise<FilterPreferenceResponse>`

#### `findFilterPreferencesServerSide`

Server-safe version for filter preferences.

**Parameters:**

- `module`: Module type (quote, order, etc.)

**Returns:** `Promise<FilterPreferenceResponse | null>`

### Creating/Updating Preferences

#### `createPreferences`

Creates/updates user preferences with auto-extracted user data.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)

**Returns:** `Promise<UserPreference>`

#### `createPreferencesServerSide`

Server-safe version for creating preferences.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)

**Returns:** `Promise<UserPreference | null>`

#### `updatePreferences`

Updates user preferences with auto-extracted user data.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to update (Record<string, unknown>)

**Returns:** `Promise<UserPreference>`

#### `updatePreferencesServerSide`

Server-safe version for updating preferences.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to update (Record<string, unknown>)

**Returns:** `Promise<UserPreference | null>`

#### `savePreferences`

Saves (creates or updates) user preferences with auto-extracted user data.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)

**Returns:** `Promise<UserPreference>`

#### `savePreferencesServerSide`

Server-safe version for saving preferences.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)

**Returns:** `Promise<UserPreference | null>`

#### `saveFilterPreferences`

Saves filter preferences for a specific module with auto-extracted user data.

**Parameters:**

- `module`: Module type (quote, order, etc.)
- `filterPreferences`: Filter preferences data to save (`PreferenceData`)

**Returns:** `Promise<FilterPreferenceResponse>`

#### `saveFilterPreferencesServerSide`

Server-safe version for saving filter preferences.

**Parameters:**

- `module`: Module type (quote, order, etc.)
- `filterPreferences`: Filter preferences data to save (`PreferenceData`)

**Returns:** `Promise<FilterPreferenceResponse | null>`

### Advanced Methods with Custom Context

#### `createPreferencesWithContext`

Creates preferences with custom context (for advanced usage).

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)
- `context`: Request context with accessToken and other fields

**Returns:** `Promise<UserPreference>`

#### `createPreferencesWithContextServerSide`

Server-safe version for creating preferences with custom context.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `preferences`: Preferences data to save (Record<string, unknown>)
- `context`: Request context with accessToken and other fields

**Returns:** `Promise<UserPreference | null>`

#### `saveFilterPreferencesWithContext`

Saves filter preferences with custom context (for API routes).

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `filterPreferences`: Filter preferences data to save (`PreferenceData`)
- `context`: Request context with accessToken and other fields

**Returns:** `Promise<FilterPreferenceResponse>`

#### `saveFilterPreferencesWithContextServerSide`

Server-safe version for saving filter preferences with custom context.

**Parameters:**

- `module`: Module type (order, quote, etc.)
- `filterPreferences`: Filter preferences data to save (`PreferenceData`)
- `context`: Request context with accessToken and other fields

**Returns:** `Promise<FilterPreferenceResponse | null>`

## API Endpoints

- **Find Preferences**: `GET /preferences/find?userId={userId}&module={module}&tenantCode={tenantCode}&isMobile={isMobile}`
- **Create Preferences**: `POST /preferences`
- **Update Preferences**: `POST /preferences/update`
- **Save Preferences**: `POST /preferences/save?userId={userId}&module={module}&tenantCode={tenantCode}`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically extracts user data from JWT tokens via `AuthStorage` and `JWTService`
- Provides both client-side and server-side safe methods
- Server-side methods return `null` on error instead of throwing
- Supports custom context for API routes
- Uses `tenantId` from JWT payload, with fallback to `elasticCode`
- All methods that auto-extract user data require a valid access token

## Testing

See `PreferenceService.test.ts` for comprehensive test cases covering:

- Token extraction and validation
- Finding preferences (with and without params)
- Creating/updating/saving preferences
- Filter preferences management
- Server-side error handling
- Custom context usage
- JWT payload parsing (including elasticCode fallback)

Mocks are available in `PreferenceService.mocks.ts`.

## Folder Structure

```
services/
  PreferenceService/
    PreferenceService.ts
    PreferenceService.test.ts
    PreferenceService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `preferenceClient`: Preference API client
- `AuthStorage`: For accessing JWT tokens
- `JWTService`: For decoding JWT tokens

## Related

- Base: `BaseService` - Base service implementation
- Client: `preferenceClient` - Preference API client
- Auth: `AuthStorage` - Authentication storage
- JWT: `JWTService` - JWT token service
