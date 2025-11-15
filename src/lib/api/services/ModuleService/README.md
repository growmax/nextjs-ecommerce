# ModuleService

Service for retrieving module settings for a user and company.

## Overview

This service provides functionality to fetch all module settings configured for a specific user and company combination.

## Class

### `ModuleService`

Extends `BaseService<ModuleService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getModule`

Retrieves all module settings for a user and company.

**Parameters:**

- `params`: `Module` object with:
  - `userId`: User ID (string or number)
  - `companyId`: Company ID (string or number)

**Returns:** `Promise<unknown>` - Module settings response

**Example:**

```typescript
import ModuleService from "@/lib/api/services/ModuleService/ModuleService";

const modules = await ModuleService.getModule({
  userId: "123",
  companyId: "456",
});
```

## API Endpoint

- **Endpoint**: `module_setting/getAllModuleSettings`
- **Method**: `GET`
- **Query Parameters**: `userId`, `companyId`
- **Body**: Empty object `{}`

## Response Structure

The response typically contains an array of module settings with properties like:

- `moduleId`: Module identifier
- `moduleName`: Module name
- `isEnabled`: Whether the module is enabled

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Supports both string and number IDs
- Empty body is sent as per API requirements

## Testing

See `ModuleService.test.ts` for comprehensive test cases covering:

- API call with correct parameters
- Handling of string and number IDs
- Response handling
- Error handling
- HTTP method verification

Mocks are available in `ModuleService.mocks.ts`.

## Folder Structure

```
services/
  ModuleService/
    ModuleService.ts
    ModuleService.test.ts
    ModuleService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
