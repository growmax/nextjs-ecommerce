# DiscountService

Service for fetching discount information and checking volume discount settings.

## Overview

This service provides functionality to retrieve product discounts, seller prices, and check volume discount settings for companies.

## Class

### `DiscountService`

Extends `BaseService<DiscountService>` and uses `discountClient` for API calls.

## Methods

### `getDiscount`

Gets discount information with context (userId, tenantId).

**Parameters:**

- `request`: `DiscountRequestWithContext` object with:
  - `userId`: User ID (number)
  - `tenantId`: Tenant ID (string)
  - `body`: `DiscountRequestBody` with Productid, CurrencyId, BaseCurrencyId, companyId

**Returns:** `Promise<DiscountApiResponse>` - Discount response

**Example:**

```typescript
import DiscountService from "@/lib/api/services/DiscountService/DiscountService";

const discounts = await DiscountService.getDiscount({
  userId: 123,
  tenantId: "tenant-1",
  body: {
    Productid: [1, 2, 3],
    CurrencyId: 1,
    BaseCurrencyId: 1,
    companyId: 456,
  },
});
```

**Note:** CompanyId is sent as a query parameter, tenantId is sent via x-tenant header (from context).

### `getDiscountLegacy`

Legacy method for backward compatibility (deprecated).

**Parameters:**

- `body`: `DiscountRequest` object

**Returns:** `Promise<DiscountApiResponse>`

### `getAllSellerPrices`

Gets all seller prices for products.

**Parameters:**

- `request`: `GetAllSellerPricesRequest` object

**Returns:** `Promise<GetAllSellerPricesResponse>`

### `getAllSellerPricesServerSide`

Server-side version that returns null on error.

**Parameters:**

- `request`: `GetAllSellerPricesRequest` object

**Returns:** `Promise<GetAllSellerPricesResponse | null>`

### `checkIsVDEnabledByCompanyId`

Checks if volume discount is enabled for a company.

**Parameters:**

- `companyId`: Company ID (number | string)

**Returns:** `Promise<CheckVolumeDiscountEnabledResponse>`

### `checkIsVDEnabledByCompanyIdServerSide`

Server-side version that returns null on error.

**Parameters:**

- `companyId`: Company ID (number | string)

**Returns:** `Promise<CheckVolumeDiscountEnabledResponse | null>`

### `checkIsVDEnabledByCompanyIdWithContext`

Server-side version with custom context.

**Parameters:**

- `companyId`: Company ID (number | string)
- `context`: RequestContext object

**Returns:** `Promise<CheckVolumeDiscountEnabledResponse | null>`

## API Endpoints

- **Get Discount**: `POST /discount/getDiscount?CompanyId={companyId}`
- **Get All Seller Prices**: `POST /discounts/discount/getAllSellerPrices`
- **Check Volume Discount**: `POST /discount/CheckorderDiscount?CompanyId={companyId}`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Tenant ID is sent via x-tenant header (from context)
- CompanyId is sent as query parameter, not in request body
- Excludes companyId and currencyCode from request body payload
- Supports both number and string companyId

## Testing

See `DiscountService.test.ts` for comprehensive test cases covering:

- API calls with context
- Request body filtering
- Legacy method support
- Seller prices fetching
- Volume discount checking
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `DiscountService.mocks.ts`.

## Folder Structure

```
services/
  DiscountService/
    DiscountService.ts
    DiscountService.test.ts
    DiscountService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `discountClient`: Discount API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `discountClient` - Discount API client
