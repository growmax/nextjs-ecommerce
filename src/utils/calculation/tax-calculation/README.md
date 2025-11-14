# tax-calculation

Utility function for calculating taxes on cart items, supporting both inter-state and intra-state tax calculations with compound tax support.

## Overview

This module provides a function to calculate taxes for individual cart items based on HSN (Harmonized System of Nomenclature) details. It supports both inter-state and intra-state tax calculations, handles compound taxes, and accumulates tax totals for cart value calculations.

## Functions

### `calculateItemTaxes`

Calculates taxes for a single cart item based on HSN details and tax type.

**Parameters:**

- `item`: `CartItem` object to calculate taxes for
- `params`: `TaxCalculationParams` object with:
  - `isInter`: Boolean indicating inter-state transaction (true) or intra-state (false)
  - `precision`: Decimal precision for tax calculations (default: 2)

**Returns:**

```typescript
{
  updatedItem: CartItem;
  updatedCartValue: CartValue;
}
```

**Example:**

```typescript
import { calculateItemTaxes } from "@/utils/calculation/tax-calculation/tax-calculation";

const result = calculateItemTaxes(cartItem, {
  isInter: true,
  precision: 2,
});

// result.updatedItem contains tax calculations
// result.updatedCartValue contains tax totals for cart
```

## Key Features

### Tax Type Selection

The function selects the appropriate tax type based on `isInter`:

- **Inter-State** (`isInter: true`): Uses `interTax` from HSN details
- **Intra-State** (`isInter: false`): Uses `intraTax` from HSN details

### Tax Breakup Building

The function automatically builds tax breakups from HSN details:

- Extracts `taxReqLs` from `interTax` or `intraTax`
- Converts `TaxReq` objects to `TaxBreakup` format
- Preserves existing breakups if already present

### Tax Calculation

#### Non-Compound Tax

```typescript
taxValue = ((totalPrice + pfRate) * taxPercentage) / 100;
```

#### Compound Tax

```typescript
taxValue = (previousTaxTotal * taxPercentage) / 100;
```

Compound taxes are calculated sequentially after non-compound taxes.

### Product Tax Calculation

```typescript
prodTax = ((totalPrice + pfRate) * totalTax) / 100;
```

### Cart Value Updates

The function accumulates tax totals in `updatedCartValue`:

- Each tax type gets a `{taxName}Total` property
- Totals are accumulated across all tax components

## Examples

### Basic Inter-State Tax

```typescript
const cartItem = {
  productId: "prod-1",
  totalPrice: 1000,
  pfRate: 50,
  hsnDetails: {
    interTax: {
      totalTax: 10,
      taxReqLs: [{ taxName: "GST", rate: 10, compound: false }],
    },
  },
};

const result = calculateItemTaxes(cartItem, {
  isInter: true,
  precision: 2,
});

// Result:
// - updatedItem.tax: 10
// - updatedItem.GST: 10
// - updatedItem.GSTValue: 105 ((1000 + 50) * 10 / 100)
// - updatedItem.totalTax: 105
// - updatedItem.prodTax: 105
// - updatedCartValue.GSTTotal: 105
```

### Intra-State Tax with Multiple Components

```typescript
const cartItem = {
  totalPrice: 1000,
  pfRate: 50,
  hsnDetails: {
    intraTax: {
      totalTax: 18,
      taxReqLs: [
        { taxName: "CGST", rate: 9, compound: false },
        { taxName: "SGST", rate: 9, compound: false },
      ],
    },
  },
};

const result = calculateItemTaxes(cartItem, {
  isInter: false,
  precision: 2,
});

// Result:
// - updatedItem.CGSTValue: 94.5
// - updatedItem.SGSTValue: 94.5
// - updatedItem.totalTax: 189
// - updatedCartValue.CGSTTotal: 94.5
// - updatedCartValue.SGSTTotal: 94.5
```

### Compound Tax Calculation

```typescript
const cartItem = {
  totalPrice: 1000,
  pfRate: 50,
  hsnDetails: {
    interTax: {
      totalTax: 12,
      taxReqLs: [
        { taxName: "GST", rate: 10, compound: false },
        { taxName: "CESS", rate: 2, compound: true },
      ],
    },
  },
};

const result = calculateItemTaxes(cartItem, {
  isInter: true,
  precision: 2,
});

// Result:
// - updatedItem.GSTValue: 105 (calculated first)
// - updatedItem.CESSValue: 2.1 (calculated on GST: 105 * 2 / 100)
// - updatedItem.totalTax: 107.1
```

### Custom Precision

```typescript
const result = calculateItemTaxes(cartItem, {
  isInter: true,
  precision: 4, // 4 decimal places
});
```

## Return Value Structure

### updatedItem

The updated cart item contains:

- `tax`: Total tax percentage from HSN details
- `totalTax`: Sum of all tax values
- `prodTax`: Product tax calculated from total tax
- `{taxName}`: Tax percentage for each tax component (e.g., `GST`, `CGST`, `SGST`)
- `{taxName}Value`: Tax value for each tax component (e.g., `GSTValue`, `CGSTValue`)
- `interTaxBreakup`: Array of inter-state tax breakups
- `intraTaxBreakup`: Array of intra-state tax breakups

### updatedCartValue

The cart value updates contain:

- `{taxName}Total`: Total tax amount for each tax type (e.g., `GSTTotal`, `CGSTTotal`)

## Algorithm Details

### Tax Calculation Flow

1. **Clone Item**: Create a copy to avoid mutating the original
2. **Initialize Breakups**: Ensure `interTaxBreakup` and `intraTaxBreakup` arrays exist
3. **Build Breakups**: Extract tax requirements from HSN details and convert to breakups
4. **Select Tax Type**: Choose `interTax` or `intraTax` based on `isInter`
5. **Calculate Taxes**: Iterate through tax breakups:
   - For non-compound: Calculate on `(totalPrice + pfRate)`
   - For compound: Calculate on accumulated tax total
   - Set tax percentage and value on item
   - Accumulate in cart value totals
6. **Calculate Total Tax**: Sum all tax values
7. **Calculate Product Tax**: Calculate from total tax percentage
8. **Return Results**: Return updated item and cart value

### Compound Tax Handling

Compound taxes are calculated after non-compound taxes:

1. Calculate all non-compound taxes first
2. Accumulate non-compound tax total
3. Calculate compound taxes on accumulated total
4. Add compound taxes to total

## Edge Cases

### Missing HSN Details

When `hsnDetails` is undefined:

- `tax` is set to 0
- `totalTax` is set to 0
- `prodTax` is set to 0
- No tax breakups are built

### Empty Tax Requirements

When `taxReqLs` is empty or undefined:

- No tax breakups are added
- `totalTax` is set to 0
- `prodTax` is still calculated from `totalTax` percentage

### Missing PF Rate

When `pfRate` is undefined:

- Tax calculations use `totalPrice` only
- Formula becomes: `(totalPrice * taxPercentage) / 100`

### Zero Total Price

When `totalPrice` is 0:

- All tax values are 0
- `prodTax` is 0

### Existing Tax Breakups

When tax breakups already exist:

- New breakups are appended to existing arrays
- Existing breakups are preserved

## Notes

- **Immutability**: Original item is not mutated, a clone is created
- **Precision**: All calculations use `parseFloat(value.toFixed(precision))` for rounding
- **Tax Type Selection**: Only one tax type (inter or intra) is used per calculation
- **Compound Tax Order**: Compound taxes must come after non-compound taxes in the array
- **Cart Value Accumulation**: Tax totals are accumulated for cart-level calculations
- **Dynamic Properties**: Tax names and values are added as dynamic properties on the item
- **Zero Handling**: Missing or zero values are handled gracefully

## Testing

See `tax-calculation.test.ts` for comprehensive test cases covering:

- Inter-state and intra-state tax calculations
- Non-compound and compound tax calculations
- Multiple tax components
- Tax breakup building
- Cart value accumulation
- Edge cases (missing HSN, zero values, etc.)
- Precision handling
- Immutability verification

Mocks are available in `tax-calculation.mocks.ts`.

## Folder Structure

```
utils/
  calculation/
    tax-calculation/
      tax-calculation.ts
      tax-calculation.test.ts
      tax-calculation.mocks.ts
      README.md
```

## Dependencies

- `lodash/each`: Iterating over tax requirements
- `@/types/calculation/cart`: CartItem and CartValue types
- `@/types/calculation/tax`: TaxBreakup type

## Related

- Utility: `cart-calculation` - Uses this function for cart-level tax calculations
- Types: `@/types/calculation/tax` - Tax-related types
- Types: `@/types/calculation/cart` - Cart-related types
