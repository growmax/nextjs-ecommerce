# volume-discount-calculation

Utility functions for calculating volume discounts on cart items, including tax calculations, shipping charges, and financial summaries.

## Overview

This module provides two functions for calculating volume discounts:

1. `calculateVolumeDiscount` - Original version for CartItem arrays
2. `calculateVolumeDiscountV2` - Enhanced version for VolumeDiscountItem arrays with additional features

Both functions handle complex tax calculations (inter-state and intra-state), shipping tax calculations, and volume discount application.

## Functions

### `calculateVolumeDiscount`

Calculates volume discounts for an array of `CartItem` objects.

**Parameters:**

- `isInter`: Boolean indicating inter-state transaction
- `products`: Array of `CartItem` objects
- `volumeDiscountData`: Array of `VolumeDiscountData` objects with discount information
- `subTotal`: Original subtotal before volume discount
- `overallShipping`: Total shipping charges
- `settings`: `CalculationSettings` object with calculation preferences
- `beforeTax`: Boolean indicating if shipping is before tax
- `beforeTaxPercentage`: Tax percentage for shipping calculation
- `precision`: Decimal precision for calculations (default: 2)

**Returns:**

```typescript
{
  products: CartItem[];
  vdDetails: VolumeDiscountDetails;
  pfRate: number;
}
```

**Example:**

```typescript
import { calculateVolumeDiscount } from "@/utils/calculation/volume-discount-calculation/volume-discount-calculation";

const result = calculateVolumeDiscount(
  false, // isInter
  cartItems,
  volumeDiscountData,
  1000, // subTotal
  50, // overallShipping
  {
    itemWiseShippingTax: false,
    roundingAdjustment: false,
  },
  false, // beforeTax
  10, // beforeTaxPercentage
  2 // precision
);
```

### `calculateVolumeDiscountV2`

Enhanced version that works with `VolumeDiscountItem` arrays and includes insurance charges and rounding adjustments.

**Parameters:**

- `isInter`: Boolean indicating inter-state transaction
- `volumeDiscountData`: Array of `VolumeDiscountItem` objects
- `subTotal`: Original subtotal before volume discount
- `insuranceCharges`: Insurance charges amount
- `beforeTax`: Boolean indicating if shipping is before tax
- `beforeTaxPercentage`: Tax percentage for shipping calculation
- `overallShipping`: Total shipping charges
- `settings`: `CalculationSettings` object with calculation preferences
- `precision`: Decimal precision for calculations (default: 2)

**Returns:**

```typescript
VolumeDiscountCalculationResult;
```

**Example:**

```typescript
import { calculateVolumeDiscountV2 } from "@/utils/calculation/volume-discount-calculation/volume-discount-calculation";

const result = calculateVolumeDiscountV2(
  false, // isInter
  volumeDiscountItems,
  1000, // subTotal
  25, // insuranceCharges
  false, // beforeTax
  10, // beforeTaxPercentage
  50, // overallShipping
  {
    itemWiseShippingTax: false,
    roundingAdjustment: false,
  },
  2 // precision
);
```

## Key Features

### Volume Discount Application

Both functions:

- Apply volume discounts to matching products based on `itemNo`
- Calculate discounted unit price: `unitPrice = unitListPrice - (unitListPrice * appliedDiscount / 100)`
- Calculate total price: `totalPrice = askedQuantity * unitPrice`
- Calculate packing and forwarding (PF) rate: `pfRate = totalPrice * (pfItemValue / 100)`

### Tax Calculations

#### Inter-State Tax (`isInter: true`)

- Uses `interTaxBreakup` from product's HSN details
- Supports compound tax calculations
- Calculates tax values for each tax component
- Handles shipping tax based on `itemWiseShippingTax` setting

#### Intra-State Tax (`isInter: false`)

- Uses `intraTaxBreakup` from product's HSN details
- Supports compound tax calculations
- Calculates tax values for each tax component
- Handles shipping tax based on `itemWiseShippingTax` setting

### Shipping Tax Calculation

Two modes based on `settings.itemWiseShippingTax`:

1. **Item-wise Shipping Tax** (`itemWiseShippingTax: true`):
   - Calculates shipping tax per product
   - Uses product-specific tax percentage
   - Handles compound tax on shipping

2. **Overall Shipping Tax** (`itemWiseShippingTax: false`):
   - Calculates shipping tax on total shipping amount
   - Uses `beforeTaxPercentage` for calculation
   - Applied when `beforeTax: true`

### Volume Discount Details

The functions calculate and return:

- `subTotal`: Original subtotal
- `subTotalVolume`: Subtotal after volume discount
- `volumeDiscountApplied`: Total discount amount
- `overallTax`: Total tax amount
- `taxableAmount`: Taxable amount (with/without shipping based on `beforeTax`)
- `grandTotal`: Grand total including all charges
- `pfRate`: Total packing and forwarding charges
- `totalTax`: Total tax amount

### Product Updates

Products are updated with:

- `appliedDiscount`: Applied discount percentage
- `unitPrice`: Discounted unit price
- `totalPrice`: Total price after discount
- `pfRate`: Packing and forwarding rate
- `volumeDiscount`: Volume discount percentage
- `volumeDiscountApplied`: Boolean flag
- `unitVolumePrice`: Unit price with volume discount
- `totalVolumeDiscountPrice`: Total price with volume discount
- `dmc`: Direct material cost percentage
- `marginPercentage`: Margin percentage
- `taxVolumeDiscountPercentage`: Tax amount after volume discount
- `itemTaxableAmount`: Taxable amount per item
- Dynamic tax properties (e.g., `GST`, `GSTValue`, `CESS`, `CESSValue`)

### V2 Enhancements

`calculateVolumeDiscountV2` includes additional features:

- **Insurance Charges**: Adds insurance charges to calculations
- **Rounding Adjustment**: Handles rounding adjustments when enabled
- **Tax-Inclusive Pricing**: Adjusts unit price for tax-inclusive products
- **Additional Discounts**: Tracks volume discounts in `additionalDiscounts` array
- **Discount Combination Logic**: Handles `CantCombineWithOtherDisCounts` flag
- **Disc Changed Flag**: Applies volume discount when `discChanged: true`

## Calculation Flow

### Basic Flow

1. **Match Products**: Match products with volume discount data by `itemNo`
2. **Apply Discount**: Calculate discounted unit price
3. **Calculate Totals**: Calculate total price, PF rate, and tax
4. **Tax Calculation**: Apply inter-state or intra-state tax based on `isInter`
5. **Shipping Tax**: Calculate shipping tax based on settings
6. **Volume Discount**: Calculate volume discount price if applicable
7. **DMC & Margin**: Calculate direct material cost and margin percentage
8. **Summary**: Calculate final totals and return results

### Tax Calculation Details

#### Non-Compound Tax

```typescript
taxValue = ((totalPrice + pfRate) * taxPercentage) / 100;
```

#### Compound Tax

```typescript
taxValue = (previousTaxTotal * taxPercentage) / 100;
```

#### Shipping Tax (Item-wise)

```typescript
shippingTax = (shippingCharges * askedQuantity * taxPercentage) / 100;
```

#### Shipping Tax (Overall)

```typescript
shippingTax = (overallShipping * taxPercentage) / 100;
```

## Examples

### Basic Volume Discount

```typescript
const result = calculateVolumeDiscount(
  false,
  [
    {
      productId: "prod-1",
      itemNo: "item-1",
      unitListPrice: 100,
      askedQuantity: 10,
      pfItemValue: 5,
      tax: 10,
    },
  ],
  [
    {
      itemNo: "item-1",
      volumeDiscount: 10,
      appliedDiscount: 10,
    },
  ],
  1000,
  50,
  { itemWiseShippingTax: false, roundingAdjustment: false },
  false,
  10,
  2
);

// Result:
// - unitPrice: 90 (100 - 10%)
// - totalPrice: 900 (10 * 90)
// - pfRate: 45 (900 * 5%)
// - volumeDiscountApplied: true
```

### Inter-State Tax Calculation

```typescript
const result = calculateVolumeDiscount(
  true, // isInter
  [
    {
      productId: "prod-1",
      itemNo: "item-1",
      unitListPrice: 100,
      askedQuantity: 10,
      hsnDetails: {
        interTax: { totalTax: 10 },
      },
      interTaxBreakup: [{ taxName: "GST", taxPercentage: 10, compound: false }],
    },
  ],
  volumeDiscountData,
  1000,
  50,
  settings,
  false,
  10,
  2
);
```

### V2 with Insurance and Rounding

```typescript
const result = calculateVolumeDiscountV2(
  false,
  volumeDiscountItems,
  1000,
  25, // insuranceCharges
  false,
  10,
  50,
  {
    itemWiseShippingTax: false,
    roundingAdjustment: true, // Enable rounding
  },
  2
);
```

### Tax-Inclusive Pricing

```typescript
const result = calculateVolumeDiscountV2(
  false,
  [
    {
      ...product,
      taxInclusive: true,
      tax: 10,
    },
  ],
  1000,
  0,
  false,
  10,
  50,
  settings,
  2
);

// Unit price is adjusted: unitPrice = unitPrice / (1 + tax / 100)
```

## Edge Cases

### Products Without productId

Products without `productId` are handled separately:

- Tax is calculated based on `totalPrice * tax / 100`
- Added to totals but not included in volume discount matching

### Empty Volume Discount Data

When `volumeDiscountData` is empty:

- Products are processed without volume discounts
- Final totals are calculated based on original prices

### Zero Volume Discount

When `volumeDiscount: 0`:

- `volumeDiscountApplied` is set to `false`
- No volume discount price calculations
- Regular discount calculations proceed

### Missing Tax Breakup

When tax breakup is missing:

- Uses default tax percentage from `beforeTaxPercentage`
- Calculates shipping tax only
- Sets `totalTax` to shipping tax amount

### Compound Tax Calculation

Compound taxes are calculated sequentially:

1. Calculate base tax (non-compound)
2. Calculate compound tax on base tax total
3. Accumulate all tax values

## Return Value Structure

### calculateVolumeDiscount

```typescript
{
  products: CartItem[], // Updated products with volume discount
  vdDetails: {
    subTotal: number,
    subTotalVolume: number,
    volumeDiscountApplied: number,
    overallTax: number,
    taxableAmount: number,
    grandTotal: number,
    pfRate: number,
    totalTax: number,
    shippingTax?: number,
    // Dynamic tax totals (e.g., GSTTotal, CESSTotal)
  },
  pfRate: number, // Total PF rate
}
```

### calculateVolumeDiscountV2

```typescript
{
  products: VolumeDiscountItem[], // Updated products
  vdDetails: {
    subTotal: number,
    subTotalVolume: number,
    volumeDiscountApplied: number,
    overallTax: number,
    taxableAmount: number,
    grandTotal: number,
    pfRate: number,
    totalTax: number,
    insuranceCharges: number,
    calculatedTotal: number,
    roundingAdjustment: number,
    shippingTax?: number,
    // Dynamic tax totals
  },
  pfRate: number,
}
```

## Notes

- **Precision**: All calculations use `parseFloat` with `toFixed` for precision control
- **Deep Cloning**: Products are cloned to avoid mutating input arrays
- **Tax Breakup**: Dynamic tax properties are added to products at runtime
- **Error Handling**: V2 function includes try-catch for error handling
- **Shipping Tax**: Only calculated when `beforeTax: true`
- **Volume Discount**: Only applied when `volumeDiscount > 0`
- **DMC Calculation**: Requires `productCost > 0` and `unitVolumePrice > 0`
- **Margin**: Always `100 - dmc`
- **Tax-Inclusive**: V2 adjusts unit price for tax-inclusive products
- **Discount Combination**: V2 respects `CantCombineWithOtherDisCounts` flag

## Testing

See `volume-discount-calculation.test.ts` for comprehensive test cases covering:

- Basic volume discount calculation
- Inter-state and intra-state tax calculations
- Compound tax calculations
- Shipping tax calculations (item-wise and overall)
- Volume discount application
- DMC and margin calculations
- Tax-inclusive pricing
- Insurance charges and rounding adjustments
- Edge cases and error handling

Mocks are available in `volume-discount-calculation.mocks.ts`.

## Folder Structure

```
utils/
  calculation/
    volume-discount-calculation/
      volume-discount-calculation.ts
      volume-discount-calculation.test.ts
      volume-discount-calculation.mocks.ts
      README.md
```

## Dependencies

- `lodash/each`: Iterating over tax breakups
- `@/types/calculation/cart`: CartItem, VolumeDiscountData, VolumeDiscountDetails, CalculationSettings
- `@/types/calculation/volume-discount`: VolumeDiscountItem, VolumeDiscountCalculationResult

## Related

- Hook: `useOrderCalculation` - Uses `calculateVolumeDiscount` for order calculations
- Types: `@/types/calculation/cart` - Cart and calculation types
- Types: `@/types/calculation/volume-discount` - Volume discount types
