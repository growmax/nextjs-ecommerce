# quoteSubmissionDTO

Utility functions for preparing quote submission DTO (Data Transfer Object) from form values.

## Overview

This module provides utilities to transform quote form data into the format required by the quote submission API. It handles product details formatting, financial calculations, user/tag mapping, and various data transformations.

## Functions

### `prepareQuoteSubmissionDTO(values, overViewValues, displayName?, companyName?): QuoteSubmissionPayload`

Prepares quote submission DTO from form values and overview values.

**Parameters:**

- `values`: Record containing quote details form values (products, cart value, addresses, etc.)
- `overViewValues`: Record containing overview section values (users, tags, division, etc.)
- `displayName`: Optional current user's display name
- `companyName`: Optional current user's company name (currently unused but kept for API compatibility)

**Returns:** Formatted `QuoteSubmissionPayload` object

**Example:**

```typescript
import { prepareQuoteSubmissionDTO } from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";

const payload = prepareQuoteSubmissionDTO(
  {
    quoteName: "Test Quote",
    dbProductDetails: [...],
    cartValue: { totalValue: 1000, totalTax: 100, ... },
    // ... other values
  },
  {
    buyerReferenceNumber: "REF-001",
    quoteUsers: [{ id: 1 }],
    tagsList: [{ id: 1 }],
    // ... other overview values
  },
  "John Doe"
);
```

### `formBundleProductsPayload(bundleArray): any[]`

Formats bundle products array by converting boolean-like values to 1/0 and filtering selected bundles.

**Parameters:**

- `bundleArray`: Array of bundle product objects

**Returns:** Filtered array of bundle products where `isBundleSelected_fe` is truthy

**Example:**

```typescript
import { formBundleProductsPayload } from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";

const bundles = [
  { bundleSelected: 1, isBundleSelected_fe: 1 },
  { bundleSelected: 0, isBundleSelected_fe: 0 },
];
const filtered = formBundleProductsPayload(bundles);
// Returns only bundles where isBundleSelected_fe is truthy
```

### `checkIsBundleProduct(bundleProducts?): boolean`

Checks if any bundle product is selected.

**Parameters:**

- `bundleProducts`: Optional array of bundle products

**Returns:** `true` if any bundle product has `bundleSelected` truthy, `false` otherwise

**Example:**

```typescript
import { checkIsBundleProduct } from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";

const hasBundle = checkIsBundleProduct([
  { bundleSelected: 1 },
  { bundleSelected: 0 },
]);
// Returns: true
```

## Key Features

### Product Details Formatting

The function automatically formats product details with:

- Account owner ID extraction
- Business unit ID extraction
- Division ID extraction
- Warehouse ID and name extraction
- Tax breakup selection (inter vs intra based on `isInter` flag)
- Discount details formatting
- Bundle products formatting
- Unit list price handling based on `showPrice` and `priceNotAvailable` flags

### Financial Calculations

The function handles two calculation modes:

1. **Standard Mode** (`VDapplied: false`): Uses `cartValue` for financial calculations
2. **Volume Discount Mode** (`VDapplied: true`): Uses `VDDetails` for financial calculations

Financial fields include:

- `subTotal`: Base subtotal
- `subTotalWithVD`: Subtotal with volume discount
- `overallTax`: Total tax
- `taxableAmount`: Taxable amount
- `calculatedTotal`: Calculated total
- `roundingAdjustment`: Rounding adjustment
- `grandTotal`: Grand total
- `overallShipping`: Total shipping
- `totalPfValue`: Total packing and forwarding value

### User and Tag Mapping

- **Quote Users**: Extracts user IDs from user objects or numbers
- **Tags**: Extracts tag IDs from tag objects or numbers
- Handles both object format `{ id: number }` and number format

### Object/Number Handling

The function handles both object and number formats for:

- `quoteDivisionId`: Can be `{ id: number }` or `number`
- `orderType`: Can be `{ id: number }` or `number` (parsed as integer)
- `branchBusinessUnit`: Can be `{ id: number }` or `number`
- `buyerCurrencyId`: Can be `{ id: number }` or `number`

## Examples

### Basic Usage

```typescript
import { prepareQuoteSubmissionDTO } from "@/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO";

const payload = prepareQuoteSubmissionDTO(
  {
    quoteName: "Test Quote",
    dbProductDetails: cartItems,
    cartValue: {
      totalValue: 1000,
      totalTax: 100,
      grandTotal: 1100,
    },
  },
  {
    buyerReferenceNumber: "REF-001",
    quoteUsers: [{ id: 1 }],
  },
  "John Doe"
);
```

### With Volume Discount

```typescript
const payload = prepareQuoteSubmissionDTO(
  {
    dbProductDetails: cartItems,
    cartValue: mockCartValue,
    VDapplied: true,
    VDDetails: {
      subTotal: 900,
      subTotalVolume: 800,
      overallTax: 90,
      grandTotal: 1000,
    },
  },
  {}
);
```

### Product with Bundle Products

```typescript
const productWithBundle = {
  productId: "prod-1",
  bundleProducts: [
    { bundleSelected: 1, isBundleSelected_fe: 1 },
    { bundleSelected: 0, isBundleSelected_fe: 0 },
  ],
};

const payload = prepareQuoteSubmissionDTO(
  {
    dbProductDetails: [productWithBundle],
    cartValue: {
      /* ... */
    },
  },
  {}
);
```

### Handling Different Object Formats

```typescript
// Division as object
const payload1 = prepareQuoteSubmissionDTO(values, {
  quoteDivisionId: { id: 1 },
});

// Division as number
const payload2 = prepareQuoteSubmissionDTO(values, { quoteDivisionId: 1 });
```

## Return Value Structure

The function returns a `QuoteSubmissionPayload` with the following key fields:

- `versionCreatedTimestamp`: ISO timestamp string
- `domainURL`: Current domain URL
- `modifiedByUsername`: Display name string
- `quoteName`: Quote name from values or overview
- `comment`: Comment string or null
- `buyerReferenceNumber`: Reference number or null
- `payerCode`: Sold-to code from register address
- `payerBranchName`: Branch name from register address
- `quoteUsers`: Array of user IDs
- `quoteDivisionId`: Division ID (object or number)
- `orderTypeId`: Order type ID (parsed as integer)
- `tagsList`: Array of tag IDs
- `branchBusinessUnit`: Business unit ID
- `branchBusinessUnitId`: Business unit ID (same as branchBusinessUnit)
- `buyerCurrencyId`: Currency ID
- `buyerCurrency`: Currency object or ID
- `subTotal`, `overallTax`, `taxableAmount`, `grandTotal`: Financial values
- `versionLevelVolumeDisscount`: Boolean flag
- `dbProductDetails`: Array of formatted product objects

## Notes

- **Field Preservation**: The function preserves all existing fields from `values` using spread operator
- **Window Check**: `domainURL` is set based on `window` availability (SSR-safe)
- **Timestamp**: `versionCreatedTimestamp` is generated at function execution time
- **Product Mapping**: Product details are deeply transformed with nested object extraction
- **Bundle Products**: Bundle products are filtered to only include selected ones
- **Tax Selection**: Product taxes are selected based on `isInter` flag (inter vs intra)
- **Price Handling**: Unit list price logic handles `showPrice` and `priceNotAvailable` flags
- **New Products**: Line and item numbers are set to `null` for new products
- **Removed Products**: Removed products are merged into `dbProductDetails` array

## Testing

See `quoteSubmissionDTO.test.ts` for comprehensive test cases covering:

- `formBundleProductsPayload` function
- `checkIsBundleProduct` function
- Basic DTO creation
- Financial calculations (standard and volume discount)
- Product details mapping
- User and tag mapping
- Object/number format handling
- Edge cases and null handling

Mocks are available in `quoteSubmissionDTO.mocks.ts`.

## Folder Structure

```
utils/
  quote/
    quoteSubmissionDTO/
      quoteSubmissionDTO.ts
      quoteSubmissionDTO.test.ts
      quoteSubmissionDTO.mocks.ts
      README.md
```

## Dependencies

- `lodash/filter`: Filtering bundle products
- `lodash/forEach`: Iterating bundle products
- `lodash/map`: Mapping arrays
- `lodash/some`: Checking bundle selection and volume discount
- `lodash/trim`: Trimming strings
- `@/lib/api`: QuoteSubmissionPayload type

## Related

- Utility: `quotationPaymentDTO` - Similar DTO conversion for payment submission
- Utility: `orderPaymentDTO` - Similar DTO conversion for orders
