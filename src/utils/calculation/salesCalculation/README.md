# salesCalculation

Utility functions for sales calculations, price formatting, data manipulation, and tax detail management.

## Overview

This module provides several utility functions for handling sales-related calculations and data transformations:

- Price information display logic
- Currency formatting
- Number rounding
- Elasticsearch product data manipulation
- Tax details assignment

## Functions

### `getPriceInfo`

Determines what price information should be displayed based on price availability and display settings.

**Parameters:**

- `listPricePublic`: List price value (number, null, or undefined)
- `showPrice`: Boolean indicating if price should be shown
- `isPriceNotAvailable`: Boolean indicating if price is not available

**Returns:** `PriceInfo` object with display flags

**Example:**

```typescript
import { getPriceInfo } from "@/utils/calculation/salesCalculation/salesCalculation";

const priceInfo = getPriceInfo(1000, true, false);
// Returns: { ShowDiscountedPrice: true, ShowUnitListPrice: true, ShowDiscount: true }
```

### `getAccounting`

Formats numbers as currency strings using accounting-js library.

**Parameters:**

- `user`: Currency options object (or null/undefined for defaults)
- `input`: Number or string to format (or null/undefined)
- `CustomSymbol`: Optional custom currency options (overrides user)

**Returns:** Formatted currency string

**Example:**

```typescript
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";

const formatted = getAccounting(
  { symbol: "$", decimal: ".", thousand: ",", precision: 2 },
  1000
);
// Returns: "$1,000.00"
```

### `roundOf`

Rounds a number to 2 decimal places.

**Parameters:**

- `value`: Number, string, null, or undefined

**Returns:** Rounded number (0 if input is null/undefined)

**Example:**

```typescript
import { roundOf } from "@/utils/calculation/salesCalculation/salesCalculation";

const rounded = roundOf(123.456);
// Returns: 123.46
```

### `manipulateProductsElasticData`

Transforms Elasticsearch product data into a normalized format.

**Parameters:**

- `esData`: Single product object or array of products

**Returns:** Transformed product data (mutates input)

**Example:**

```typescript
import { manipulateProductsElasticData } from "@/utils/calculation/salesCalculation/salesCalculation";

const transformed = manipulateProductsElasticData(productData);
// Returns product with normalized structure
```

### `setTaxDetails`

Sets tax details for products based on HSN details and transaction type.

**Parameters:**

- `existingPrdArr`: Array of products to update (mutates items)
- `productDetailArr`: Array of reference product details with HSN information
- `isInter`: Boolean indicating inter-state (true) or intra-state (false)
- `taxExemption`: Boolean indicating if taxes should be set to 0

**Returns:** Updated product array (or undefined if input is undefined)

**Example:**

```typescript
import { setTaxDetails } from "@/utils/calculation/salesCalculation/salesCalculation";

const updated = setTaxDetails(
  existingProducts,
  productDetails,
  true, // isInter
  false // taxExemption
);
```

## Key Features

### Price Information Logic

`getPriceInfo` determines display flags based on:

- Price availability (`isPriceNotAvailable`)
- Price visibility setting (`showPrice`)
- Price value existence (`listPricePublic`)

**Display Rules:**

- If `isPriceNotAvailable`: Show only `isPriceNotAvailable` flag
- If `showPrice && listPricePublic && !isPriceNotAvailable`: Show discounted price, unit list price, and discount
- If `showPrice && !listPricePublic && !isPriceNotAvailable`: Show only discounted price
- If `!showPrice`: Show request price

### Currency Formatting

`getAccounting` uses `accounting-js` to format numbers:

- Supports custom currency symbols, decimal separators, and thousand separators
- Falls back to INR (₹) defaults if no options provided
- Returns "0.00" formatted value for invalid inputs

### Data Transformation

`manipulateProductsElasticData` transforms:

- Business unit and division IDs to objects
- HSN tax breakup to HSN details structure
- Inventory data to inventory response format
- Field name mappings (e.g., `listpricePublic` → `listPricePublic`)
- Primary category selection

### Tax Details Assignment

`setTaxDetails` handles:

- Inter-state and intra-state tax selection
- Tax exemption (sets all taxes to 0)
- Compound tax handling (moves to end of array)
- Tax breakup creation from HSN details
- Product matching by `productId`

## Examples

### Price Information

```typescript
// Show all price information
const info1 = getPriceInfo(1000, true, false);
// { ShowDiscountedPrice: true, ShowUnitListPrice: true, ShowDiscount: true }

// Show only discounted price
const info2 = getPriceInfo(null, true, false);
// { ShowDiscountedPrice: true }

// Show request price
const info3 = getPriceInfo(1000, false, false);
// { ShowRequestPrice: true }
```

### Currency Formatting

```typescript
// Default INR formatting
const formatted1 = getAccounting(null, 1000);
// "₹1,000.00"

// Custom currency
const formatted2 = getAccounting(
  { symbol: "$", decimal: ".", thousand: ",", precision: 2 },
  1234.56
);
// "$1,234.56"

// Invalid input
const formatted3 = getAccounting(null, "invalid");
// "₹0.00"
```

### Rounding

```typescript
const rounded1 = roundOf(123.456); // 123.46
const rounded2 = roundOf("123.456"); // 123.46
const rounded3 = roundOf(null); // 0
```

### Data Manipulation

```typescript
const product = {
  businessUnitId: "BU-1",
  businessUnitCode: "BU001",
  hsnTaxBreakup: { interTax: 10, intraTax: 8 },
  inventory: [{ availableQty: 100 }],
};

const transformed = manipulateProductsElasticData(product);
// {
//   businessUnit: { id: "BU-1", ... },
//   hsnDetails: { interTax: 10, intraTax: 8, ... },
//   inventoryResponse: { inStock: true, availableStock: 100, ... }
// }
```

### Tax Details

```typescript
const products = [{ productId: "prod-1" }];
const productDetails = [{
  productId: "prod-1",
  hsnDetails: {
    tax: 10,
    interTax: { totalTax: 10, taxReqLs: [...] },
    intraTax: { totalTax: 8, taxReqLs: [...] }
  }
}];

const updated = setTaxDetails(products, productDetails, true, false);
// Products now have tax, totalInterTax, interTaxBreakup, etc.
```

## Return Value Structures

### PriceInfo

```typescript
{
  isPriceNotAvailable?: boolean;
  ShowDiscountedPrice?: boolean;
  ShowUnitListPrice?: boolean;
  ShowDiscount?: boolean;
  ShowRequestPrice?: boolean;
}
```

### Transformed Product Data

After `manipulateProductsElasticData`, products have:

- `businessUnit`: Business unit object or null
- `division`: Division object or null
- `hsnDetails`: Normalized HSN details object
- `inventoryResponse`: Inventory response object
- `listPricePublic`: Mapped from `listpricePublic`
- `deliveryLeadTime`: Mapped from `standardLeadTime`
- `isCustomProduct`: Mapped from `customProduct`
- `packagingQuantity`: Mapped from `packagingQty`
- `primary_products_categoryObjects`: Primary category object

### Updated Product

After `setTaxDetails`, products have:

- `tax`: Main tax percentage
- `totalInterTax`: Total inter-state tax
- `totalIntraTax`: Total intra-state tax
- `interTaxBreakup`: Array of inter-state tax breakups
- `intraTaxBreakup`: Array of intra-state tax breakups
- `compoundInter`: Array of compound inter-state taxes
- `compoundIntra`: Array of compound intra-state taxes
- `productTaxes`: Selected tax breakups (inter or intra based on `isInter`)

## Notes

- **Immutability**: `manipulateProductsElasticData` and `setTaxDetails` mutate input data
- **Default Currency**: `getAccounting` defaults to INR (₹) if no options provided
- **Precision**: `roundOf` always rounds to 2 decimal places
- **Tax Exemption**: When `taxExemption: true`, all tax percentages are set to 0
- **Compound Taxes**: Compound taxes are moved to the end of tax arrays in `setTaxDetails`
- **Product Matching**: `setTaxDetails` matches products by `productId`
- **Empty Arrays**: Functions handle empty arrays and undefined values gracefully

## Testing

See `salesCalculation.test.ts` for comprehensive test cases covering:

- Price information display logic
- Currency formatting with various options
- Number rounding edge cases
- Data transformation for single and array inputs
- Tax details assignment for inter/intra-state
- Tax exemption handling
- Compound tax handling
- Edge cases and null/undefined handling

Mocks are available in `salesCalculation.mocks.ts`.

## Folder Structure

```
utils/
  calculation/
    salesCalculation/
      salesCalculation.ts
      salesCalculation.test.ts
      salesCalculation.mocks.ts
      README.md
```

## Dependencies

- `accounting-js`: Currency formatting (`formatMoney`)
- `lodash/find`: Finding items in arrays
- `lodash/isArray`: Array type checking
- `lodash/each`: Iterating over arrays
- `lodash/isEmpty`: Empty check
- `lodash/remove`: Removing items from arrays

## Related

- Utility: `getLatestTaxData` - Uses `manipulateProductsElasticData` and `setTaxDetails`
- Hook: `useLatestOrderProducts` - Uses sales calculation utilities
- Hook: `useFetchOrderDetails` - Uses sales calculation utilities
