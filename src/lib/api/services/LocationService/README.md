# LocationService

Service for fetching location data including countries, states, and districts.

## Overview

This service provides functionality to retrieve geographical location data (countries, states, districts) with filtering capabilities.

## Class

### `LocationService`

Extends `BaseService<LocationService>` and uses `homePageClient` for API calls.

## Methods

### `getAllCountries`

Gets all countries.

**Returns:** `Promise<LocationResponse<CountryData>>` - Countries response

**Example:**

```typescript
import LocationService from "@/lib/api/services/LocationService/LocationService";

const countries = await LocationService.getAllCountries();
```

### `getAllStates`

Gets all states.

**Returns:** `Promise<LocationResponse<StateData>>` - States response

**Example:**

```typescript
const states = await LocationService.getAllStates();
```

### `getAllDistricts`

Gets all districts.

**Returns:** `Promise<LocationResponse<DistrictData>>` - Districts response

**Example:**

```typescript
const districts = await LocationService.getAllDistricts();
```

### `getStatesByCountry`

Gets states filtered by country ID.

**Parameters:**

- `countryId`: Country ID (number)

**Returns:** `Promise<LocationResponse<StateData>>` - Filtered states response

**Example:**

```typescript
const usStates = await LocationService.getStatesByCountry(1);
```

### `getDistrictsByState`

Gets districts filtered by state ID.

**Parameters:**

- `stateId`: State ID (number)

**Returns:** `Promise<LocationResponse<DistrictData>>` - Filtered districts response

**Example:**

```typescript
const californiaDistricts = await LocationService.getDistrictsByState(1);
```

## API Endpoints

- **Get Countries**: `GET /getCountry`
- **Get States**: `GET /getAllState`
- **Get Districts**: `GET /getAllDistrict`

## Response Structures

```typescript
interface LocationResponse<T> {
  data: T[];
  message: string;
  status: string;
}

interface CountryData {
  id: number;
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  // ... other fields
}

interface StateData {
  id: number;
  name: string;
  stateCode: string;
  countryId: number;
  // ... other fields
}

interface DistrictData {
  id: number;
  name: string;
  stateId: number;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Filtering methods (`getStatesByCountry`, `getDistrictsByState`) fetch all data and filter client-side
- Preserves response structure (message, status) in filtered responses
- Uses `homePageClient` for public location endpoints

## Testing

See `LocationService.test.ts` for comprehensive test cases covering:

- All CRUD operations
- Filtering logic
- Response structure preservation
- Error handling
- HTTP method verification

Mocks are available in `LocationService.mocks.ts`.

## Folder Structure

```
services/
  LocationService/
    LocationService.ts
    LocationService.test.ts
    LocationService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `homePageClient`: Home page API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `homePageClient` - Home page API client
