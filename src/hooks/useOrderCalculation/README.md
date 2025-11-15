# useOrderCalculation

A comprehensive React hook for order calculation logic in e-commerce applications. It provides calculated order data, warnings, and metadata based on the provided products and settings.

## Usage

```tsx
import useOrderCalculation from "./useOrderCalculation";

const { calculatedData, isCalculating, recalculate } = useOrderCalculation({
  products: orderData.products,
  isInter: orderData.isInter,
  taxExemption: orderData.taxExemption,
  settings: calculationSettings,
  options: { applyVolumeDiscount: true },
});
```

## API

### Input

- `products`: Array of cart items
- `isInter`: (optional) Boolean for inter-state calculation
- `taxExemption`: (optional) Boolean for tax exemption
- `insuranceCharges`, `shippingCharges`, `pfRate`, `currencyFactor`, `precision`: (optional) Calculation parameters
- `settings`: Calculation settings object
- `options`: Calculation options (discounts, rounding, etc)

### Output

- `calculatedData`: Object containing products, cartValue, breakup, warnings, metadata
- `isCalculating`: Boolean (always false, can be extended)
- `recalculate`: Function to manually trigger recalculation

## Testing

See `useOrderCalculation.test.ts` for example test cases using mocks from `useOrderCalculation.mocks.ts`.

## Folder Structure

```
hooks/
  useOrderCalculation/
    useOrderCalculation.ts
    useOrderCalculation.test.ts
    useOrderCalculation.mocks.ts
    README.md
```
