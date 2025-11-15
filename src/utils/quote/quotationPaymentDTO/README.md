# quotationPaymentDTO

Utility functions for converting quotation data to payment DTO (Data Transfer Object) format for API submission.

## Overview

This module provides utilities to transform quotation form data into the format required by the payment API. It handles address formatting, product details mapping, financial calculations, and various data transformations.

## Functions

### `formBundleProductsPayload(bundleArray: BundleProductPayload[]): BundleProductPayload[]`

Formats bundle products array by converting boolean-like values to 1/0 and filtering selected bundles.

**Parameters:**

- `bundleArray`: Array of bundle product objects

**Returns:** Filtered array of bundle products where `isBundleSelected_fe` is truthy

**Example:**

```typescript
import { formBundleProductsPayload } from "@/utils/quote/quotationPaymentDTO/quotationPaymentDTO";

const bundles = [
  { bundleSelected: 1, isBundleSelected_fe: 1 },
  { bundleSelected: 0, isBundleSelected_fe: 0 },
];
const filtered = formBundleProductsPayload(bundles);
// Returns only bundles where isBundleSelected_fe is truthy
```

### `quotationPaymentDTO(params: QuotationPaymentDTOParams): Record<string, unknown>`

Converts quotation data to payment DTO format for API submission.

**Parameters:**

- `params`: Object containing:
  - `values`: Form values with product details, addresses, financial data
  - `overviewValues`: Overview section values (users, tags, division, etc.)
  - `initialValues`: Optional initial values for fallback
  - `displayName`: Current user's display name
  - `companyName`: Current user's company name

**Returns:** Formatted payment DTO object

**Example:**

```typescript
import { quotationPaymentDTO } from "@/utils/quote/quotationPaymentDTO/quotationPaymentDTO";

const dto = quotationPaymentDTO({
  values: {
    dbProductDetails: [...],
    cartValue: { totalValue: 1000, totalTax: 100, ... },
    registerAddressDetails: { ... },
    // ... other values
  },
  overviewValues: {
    buyerReferenceNumber: "REF-001",
    quoteUsers: [{ id: 1 }],
    // ... other overview values
  },
  displayName: "John Doe",
  companyName: "Acme Corp",
});
```

## Key Features

### Address Formatting

The function automatically formats address details for:

- Register Address
- Billing Address
- Shipping Address
- Seller Address

Addresses are normalized with default empty strings for missing fields and null for optional fields.

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

### Product Details Mapping

The function maps product details with:

- Account owner ID extraction
- Business unit ID extraction
- Division ID extraction
- Warehouse ID and name extraction
- Tax breakup selection (inter vs intra based on `isInter` flag)
- Discount details formatting
- Bundle products formatting

### User and Tag Mapping

- **Quote Users**: Extracts user IDs from user objects or numbers
- **Tags**: Extracts tag IDs from tag objects or numbers
- Handles both object format `{ id: number }` and number format

### Fallback Values

The function uses `initialValues.quotationDetails[0]` as fallback for:

- Address details
- Buyer/seller company and branch information
- Customer required date
- Buyer reference number
- Comment
- Additional metadata

## Data Structures

### AddressDetails

```typescript
interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  pinCodeId?: string;
  pincode?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  email?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  [key: string]: unknown;
}
```

### BundleProductPayload

```typescript
interface BundleProductPayload {
  bundleSelected?: number;
  isBundleSelected_fe?: number;
  [key: string]: unknown;
}
```

## Examples

### Basic Usage

```typescript
import { quotationPaymentDTO } from "@/utils/quote/quotationPaymentDTO/quotationPaymentDTO";

const paymentDTO = quotationPaymentDTO({
  values: {
    dbProductDetails: cartItems,
    cartValue: {
      totalValue: 1000,
      totalTax: 100,
      grandTotal: 1100,
    },
    registerAddressDetails: {
      addressLine: "123 Main St",
      city: "New York",
      // ... other address fields
    },
  },
  overviewValues: {
    buyerReferenceNumber: "REF-001",
    quoteUsers: [{ id: 1 }],
  },
  displayName: "John Doe",
  companyName: "Acme Corp",
});
```

### With Volume Discount

```typescript
const paymentDTO = quotationPaymentDTO({
  values: {
    dbProductDetails: cartItems,
    VDapplied: true,
    VDDetails: {
      subTotal: 900,
      subTotalVolume: 800,
      overallTax: 90,
      grandTotal: 1000,
    },
  },
  overviewValues: {},
});
```

### With Initial Values Fallback

```typescript
const paymentDTO = quotationPaymentDTO({
  values: {
    dbProductDetails: cartItems,
    // Some values missing
  },
  overviewValues: {},
  initialValues: {
    quotationDetails: [
      {
        buyerReferenceNumber: "INITIAL-REF",
        registerAddressDetails: {
          /* ... */
        },
      },
    ],
  },
});
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

const paymentDTO = quotationPaymentDTO({
  values: {
    dbProductDetails: [productWithBundle],
    cartValue: {
      /* ... */
    },
  },
  overviewValues: {},
});
```

## Return Value Structure

The function returns a `Record<string, unknown>` with the following key fields:

- `versionCreatedTimestamp`: ISO timestamp string
- `domainURL`: Current domain URL
- `modifiedByUsername`: Formatted username string
- `buyerReferenceNumber`: Reference number or null
- `comment`: Comment string or null
- `payerCode`: Sold-to code from register address
- `payerBranchName`: Branch name from register address
- `buyerBranchId`: Buyer branch ID
- `registerAddressDetails`: Formatted address object
- `billingAddressDetails`: Formatted address object
- `shippingAddressDetails`: Formatted address object
- `sellerAddressDetail`: Formatted address object with seller-specific fields
- `buyerCompanyId`, `buyerCompanyName`: Buyer company information
- `sellerCompanyId`, `sellerCompanyName`: Seller company information
- `customerRequiredDate`: Required date string
- `buyerCurrencyId`: Currency ID number
- `isInter`: Boolean flag for inter-state tax
- `subTotal`, `overallTax`, `taxableAmount`, `grandTotal`: Financial values
- `versionLevelVolumeDisscount`: Boolean flag
- `quoteUsers`: Array of user IDs
- `quoteDivisionId`: Division ID or undefined
- `quoteTypeId`: Quote type ID or null
- `tagsList`: Array of tag IDs
- `branchBusinessUnit`: Business unit ID or empty string
- `dbProductDetails`: Array of formatted product objects

## Notes

- **Deep Cloning**: The function uses `cloneDeep` to avoid mutating input values
- **Window Check**: `domainURL` is set based on `window` availability (SSR-safe)
- **Timestamp**: `versionCreatedTimestamp` is generated at function execution time
- **Address Formatting**: All address fields default to empty strings except email, billToCode, shipToCode, and soldToCode which default to null
- **Product Mapping**: Product details are deeply transformed with nested object extraction
- **Bundle Products**: Bundle products are filtered to only include selected ones
- **Tax Selection**: Product taxes are selected based on `isInter` flag (inter vs intra)
- **Fallback Logic**: Extensive fallback logic ensures all fields have values when possible

## Testing

See `quotationPaymentDTO.test.ts` for comprehensive test cases covering:

- `formBundleProductsPayload` function
- Basic DTO creation
- Address formatting
- Financial calculations (standard and volume discount)
- Product details mapping
- User and tag mapping
- Fallback values
- Edge cases and null handling

Mocks are available in `quotationPaymentDTO.mocks.ts`.

## Folder Structure

```
utils/
  quote/
    quotationPaymentDTO/
      quotationPaymentDTO.ts
      quotationPaymentDTO.test.ts
      quotationPaymentDTO.mocks.ts
      README.md
```

## Dependencies

- `lodash/cloneDeep`: Deep cloning of values
- `lodash/filter`: Filtering bundle products
- `lodash/forEach`: Iterating bundle products
- `lodash/map`: Mapping arrays
- `lodash/some`: Checking volume discount
- `lodash/trim`: Trimming strings
- `@/types/calculation/cart`: CartItem type

## Related

- Utility: `orderPaymentDTO` - Similar DTO conversion for orders
- Utility: `prepareQuoteSubmissionDTO` - Quote submission DTO preparation
