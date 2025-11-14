# useCalculation

A comprehensive React hook for calculating cart values, taxes, and totals for products in orders and quotes.

## Purpose

This hook provides a memoized calculation function that processes products, applies discounts, calculates taxes, and computes totals. It handles various product configurations and tax scenarios including inter-state and intra-state transactions.

## Usage

```tsx
import { useCalculation } from "@/hooks/useCalculation/useCalculation";

function MyComponent() {
  const { globalCalc } = useCalculation();

  const result = globalCalc({
    products: productsArray,
    isInter: true,
    taxExemption: false,
    insuranceCharges: 100,
    precision: 2,
    Settings: calculationSettings,
    isSeller: false,
    overallShipping: 50,
    isBeforeTax: false,
  });

  return (
    <div>
      <p>Grand Total: {result.cartValue.grandTotal}</p>
      <p>Total Tax: {result.cartValue.totalTax}</p>
    </div>
  );
}
```

## Parameters

The `globalCalc` function accepts a `CalculationParams` object:

- `products: any[]` - Array of products to calculate
- `isInter: boolean` - Whether transaction is inter-state (affects tax calculation)
- `taxExemption?: boolean` - Whether tax exemption applies (default: false)
- `insuranceCharges?: number` - Insurance charges to add (default: 0)
- `precision?: number` - Decimal precision for calculations (default: 2)
- `Settings?: any` - Additional calculation settings
- `isSeller?: boolean` - Whether calculating from seller perspective (default: false)
- `overallShipping?: number` - Shipping charges (default: 0)
- `isBeforeTax?: boolean` - Whether to apply taxes (default: false)

## Return Value

Returns an object with `globalCalc` function that returns:

```typescript
{
  cartValue: {
    totalItems: number,
    totalLP: number,
    totalValue: number,
    totalTax: number,
    totalShipping: number,
    pfRate: number,
    taxableAmount: number,
    grandTotal: number
  },
  products: any[],
  breakup?: any[]
}
```

## Features

- **Product Normalization**: Automatically normalizes product properties with fallback values
- **Discount Application**: Applies discount details to products
- **Tax Calculation**: Handles both inter-state and intra-state tax calculations
- **Shipping Tax**: Calculates shipping tax when HSN details are available
- **Error Handling**: Gracefully handles calculation errors
- **Immutability**: Clones products to prevent mutations
- **Memoization**: Memoizes the calculation function for performance

## Calculation Flow

1. **Validation**: Checks if products array is valid
2. **Cloning**: Deep clones products to avoid mutations
3. **Normalization**: Normalizes product properties with defaults
4. **Discount Processing**: Applies discount details using `discountDetails` utility
5. **Cart Calculation**: Calculates totals using `cartCalculation` utility
6. **Tax Calculation**: Applies shipping tax if HSN details exist
7. **Result**: Returns calculated values and processed products

## Dependencies

- `lodash/cloneDeep` - For deep cloning objects
- `@/utils/calculation/cartCalculation` - Core calculation utilities
- `@/utils/calculation/tax-breakdown` - Tax calculation utilities

## Testing

See `useCalculation.test.ts` for comprehensive test coverage including:

- Empty products handling
- Products with/without HSN details
- Property normalization
- Default parameter values
- Error handling
- Function memoization
