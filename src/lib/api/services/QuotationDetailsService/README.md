# QuotationDetailsService

Service for fetching quotation details by quotation identifier.

## Overview

This service provides functionality to retrieve detailed information about quotations, including product details, pricing, terms, and address information.

## Class

### `QuotationDetailsService`

Extends `BaseService<QuotationDetailsService>` and uses `coreCommerceClient` for API calls.

## Methods

### `fetchQuotationDetails`

Fetches quotation details by identifier.

**Parameters:**

- `request`: `FetchQuotationDetailsRequest` object with:
  - `quotationIdentifier`: Quotation identifier (string)
  - `userId`: User ID (number)
  - `companyId`: Company ID (number)

**Returns:** `Promise<QuotationDetailsResponse>` - Quotation details response

**Example:**

```typescript
import QuotationDetailsService from "@/lib/api/services/QuotationDetailsService/QuotationDetailsService";

const details = await QuotationDetailsService.fetchQuotationDetails({
  quotationIdentifier: "QUO-001",
  userId: 123,
  companyId: 456,
});
```

**Note:** The method wraps the API response data in a `QuotationDetailsResponse` object with `success: true`.

### `fetchQuotationDetailsServerSide`

Server-side version that returns null on error.

**Parameters:**

- `request`: `FetchQuotationDetailsRequest` object

**Returns:** `Promise<QuotationDetailsResponse | null>`

## API Endpoint

- **Get Quotation Details**: `GET /quotes/fetchQuotationDetails?quotationIdentifier={quotationIdentifier}&userId={userId}&companyId={companyId}`

## Response Structure

```typescript
interface QuotationDetailsResponse {
  success: boolean;
  data: QuotationData;
  message?: string;
}

interface QuotationData {
  quotationIdentifier: string;
  quoteName?: string;
  updatedSellerStatus?: string;
  updatedBuyerStatus?: string;
  quotationDetails?: QuotationDetail[];
  buyerCompanyName?: string;
  sellerCompanyName?: string;
  grandTotal?: number;
  subTotal?: number;
  taxableAmount?: number;
  // ... many more fields
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Wraps API response in `{ success: true, data: ... }` format
- Server-side methods use `callSafe` for error handling
- Returns null when API response is null

## Testing

See `QuotationDetailsService.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Response wrapping
- Data extraction
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `QuotationDetailsService.mocks.ts`.

## Folder Structure

```
services/
  QuotationDetailsService/
    QuotationDetailsService.ts
    QuotationDetailsService.test.ts
    QuotationDetailsService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
- Similar: `OrderDetailsService` - Service for order details
