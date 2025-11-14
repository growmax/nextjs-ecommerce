# discountCalculation

Utility function for finding suitable discounts based on quantity ranges.

## Overview

This module provides a function to determine the best discount applicable for a given quantity from a list of discount ranges. It finds both the current suitable discount and the next available discount tier.

## Functions

### `getSuitableDiscountByQuantity`

Finds the most suitable discount for a given quantity from a list of discount ranges.

**Parameters:**

- `quantityInput`: Quantity as number or string (will be parsed to number)
- `discountRanges`: Array of `DiscountRange` objects with min/max quantities and discount values
- `_quantityIncrease`: Unused parameter (kept for backward compatibility)

**Returns:**

```typescript
{
  suitableDiscount: DiscountRange | undefined;
  nextSuitableDiscount: DiscountRange | undefined;
}
```

**Example:**

```typescript
import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation/discountCalculation";

const discountRanges = [
  { min_qty: 1, max_qty: 10, Value: 5 },
  { min_qty: 11, max_qty: 50, Value: 10 },
  { min_qty: 51, max_qty: 100, Value: 15 },
];

const result = getSuitableDiscountByQuantity(25, discountRanges, "0");

// Result:
// {
//   suitableDiscount: { min_qty: 11, max_qty: 50, Value: 10 },
//   nextSuitableDiscount: { min_qty: 51, max_qty: 100, Value: 15 }
// }
```

## Key Features

### Suitable Discount Selection

The function finds the best discount for the given quantity:

1. **Filters Applicable Ranges**: Finds all ranges where `min_qty <= quantity <= max_qty`
2. **Selects Highest Value**: If multiple ranges apply, selects the one with the highest `Value`
3. **Returns Best Match**: Returns the discount range with the highest value

### Next Suitable Discount

The function also finds the next available discount tier:

1. **Filters Future Ranges**: Finds all ranges where `min_qty > quantity`
2. **Sorts by Minimum**: Sorts by `min_qty` in ascending order
3. **Returns First**: Returns the range with the smallest `min_qty` that is greater than the current quantity

### Input Validation

- **Quantity Parsing**: Accepts both number and string inputs, converts to number using `zod`
- **Zero/Negative Handling**: Returns `undefined` for both discounts if quantity is 0 or negative
- **Empty Ranges**: Returns `undefined` for both discounts if no discount ranges are provided
- **Schema Validation**: Validates discount ranges using `zod` schema

## Discount Range Structure

```typescript
interface DiscountRange {
  min_qty: number; // Minimum quantity for this discount
  max_qty: number; // Maximum quantity for this discount
  Value: number; // Discount percentage/value
  CantCombineWithOtherDisCounts?: boolean; // Optional flag
  pricingConditionCode?: string | null; // Optional pricing code
}
```

## Examples

### Basic Usage

```typescript
const discountRanges = [
  { min_qty: 1, max_qty: 10, Value: 5 },
  { min_qty: 11, max_qty: 50, Value: 10 },
  { min_qty: 51, max_qty: 100, Value: 15 },
];

// Quantity 25 falls in range 11-50
const result = getSuitableDiscountByQuantity(25, discountRanges, "0");
// suitableDiscount: { min_qty: 11, max_qty: 50, Value: 10 }
// nextSuitableDiscount: { min_qty: 51, max_qty: 100, Value: 15 }
```

### Overlapping Ranges

When multiple ranges overlap, the function selects the one with the highest value:

```typescript
const overlappingRanges = [
  { min_qty: 1, max_qty: 20, Value: 5 },
  { min_qty: 10, max_qty: 50, Value: 10 },
];

// Quantity 15 falls in both ranges
const result = getSuitableDiscountByQuantity(15, overlappingRanges, "0");
// suitableDiscount: { min_qty: 10, max_qty: 50, Value: 10 } (highest value)
```

### Ranges with Gaps

When quantity falls between ranges:

```typescript
const rangesWithGaps = [
  { min_qty: 1, max_qty: 10, Value: 5 },
  { min_qty: 51, max_qty: 100, Value: 15 },
];

// Quantity 25 doesn't fall in any range
const result = getSuitableDiscountByQuantity(25, rangesWithGaps, "0");
// suitableDiscount: undefined
// nextSuitableDiscount: { min_qty: 51, max_qty: 100, Value: 15 }
```

### Boundary Cases

```typescript
// Quantity at minimum boundary
const result1 = getSuitableDiscountByQuantity(1, discountRanges, "0");
// suitableDiscount: { min_qty: 1, max_qty: 10, Value: 5 }

// Quantity at maximum boundary
const result2 = getSuitableDiscountByQuantity(100, discountRanges, "0");
// suitableDiscount: { min_qty: 51, max_qty: 100, Value: 15 }
// nextSuitableDiscount: undefined (no higher range)

// Quantity exceeds all ranges
const result3 = getSuitableDiscountByQuantity(1000, discountRanges, "0");
// suitableDiscount: { min_qty: 101, max_qty: 500, Value: 20 } (highest range)
// nextSuitableDiscount: undefined
```

### Edge Cases

```typescript
// Zero quantity
const result1 = getSuitableDiscountByQuantity(0, discountRanges, "0");
// suitableDiscount: undefined
// nextSuitableDiscount: undefined

// Negative quantity
const result2 = getSuitableDiscountByQuantity(-5, discountRanges, "0");
// suitableDiscount: undefined
// nextSuitableDiscount: undefined

// Empty ranges
const result3 = getSuitableDiscountByQuantity(25, [], "0");
// suitableDiscount: undefined
// nextSuitableDiscount: undefined

// String quantity
const result4 = getSuitableDiscountByQuantity("25", discountRanges, "0");
// suitableDiscount: { min_qty: 11, max_qty: 50, Value: 10 }
```

## Algorithm Details

### Suitable Discount Selection

1. **Parse Quantity**: Convert input to number using `zod` schema
2. **Validate Ranges**: Validate discount ranges using `zod` schema
3. **Early Returns**: Return `undefined` if quantity <= 0 or ranges are empty
4. **Filter Applicable**: Find ranges where `min_qty <= quantity <= max_qty`
5. **Select Maximum**: Use `lodash.maxBy` to select range with highest `Value`
6. **Return Result**: Return the selected discount range

### Next Suitable Discount Selection

1. **Filter Future Ranges**: Find ranges where `min_qty > quantity`
2. **Sort by Minimum**: Sort filtered ranges by `min_qty` in ascending order
3. **Select First**: Use `lodash.first` to get the range with smallest `min_qty`
4. **Return Result**: Return the next available discount range

## Return Value Structure

```typescript
interface DiscountResult {
  suitableDiscount: DiscountRange | undefined;
  // The best discount applicable for the given quantity
  // undefined if no range matches or quantity is invalid

  nextSuitableDiscount: DiscountRange | undefined;
  // The next available discount tier (smallest min_qty > quantity)
  // undefined if no higher tier exists or quantity is invalid
}
```

## Notes

- **Quantity Parsing**: Uses `zod` to parse and validate quantity input (supports number and string)
- **Range Validation**: Uses `zod` to validate discount ranges structure
- **Boundary Inclusion**: Ranges are inclusive on both ends (`min_qty <= quantity <= max_qty`)
- **Highest Value Selection**: When multiple ranges apply, selects the one with highest `Value`
- **Next Discount Sorting**: Next discount is sorted by `min_qty` to find the closest higher tier
- **Unused Parameter**: `_quantityIncrease` parameter is not used but kept for API compatibility
- **Type Safety**: Full TypeScript support with proper type definitions
- **Schema Validation**: Input validation using `zod` schemas ensures data integrity

## Edge Cases Handled

- Zero or negative quantities
- Empty discount ranges array
- Quantity between ranges (gaps)
- Quantity exceeding all ranges
- Overlapping ranges (selects highest value)
- Ranges with same value (selects first match)
- String quantity inputs
- Decimal quantities
- Boundary values (exact min/max matches)
- Invalid string inputs (throws error)

## Testing

See `discountCalculation.test.ts` for comprehensive test cases covering:

- Basic discount selection
- Overlapping ranges
- Ranges with gaps
- Boundary cases
- Edge cases (zero, negative, empty)
- String quantity inputs
- Decimal quantities
- Next discount selection
- Property preservation
- Invalid inputs

Mocks are available in `discountCalculation.mocks.ts`.

## Folder Structure

```
utils/
  calculation/
    discountCalculation/
      discountCalculation.ts
      discountCalculation.test.ts
      discountCalculation.mocks.ts
      README.md
```

## Dependencies

- `lodash/filter`: Filtering applicable ranges
- `lodash/first`: Getting first element from sorted array
- `lodash/maxBy`: Finding range with maximum value
- `lodash/sortBy`: Sorting ranges by minimum quantity
- `lodash/toNumber`: Converting values to numbers
- `zod`: Schema validation for quantity and discount ranges
- `@/types/calculation/discount`: DiscountRange and DiscountResult types

## Related

- Hook: `useOrderCalculation` - Uses this function for discount calculations
- Utility: `volume-discount-calculation` - Volume discount calculations
- Types: `@/types/calculation/discount` - Discount-related types
