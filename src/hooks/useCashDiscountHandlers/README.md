# useCashDiscountHandlers

A React hook that provides handlers for applying and removing cash discounts from products in orders and quotes.

## Purpose

This hook manages cash discount operations by providing memoized callback functions that handle discount application and removal while preserving original prices and showing user-friendly toast notifications.

## Usage

```tsx
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";

function MyComponent() {
  const [products, setProducts] = useState(initialProducts);
  const [cartValue, setCartValue] = useState(initialCartValue);

  const { handleCDApply, handleRemoveCD } = useCashDiscountHandlers({
    products,
    setProducts,
    cartValue,
    setCartValue,
    isOrder: true,
  });

  const applyDiscount = () => {
    handleCDApply(5, true, paymentTerms);
  };

  const removeDiscount = () => {
    handleRemoveCD(previousPaymentTerms);
  };

  return (
    <div>
      <button onClick={applyDiscount}>Apply 5% Cash Discount</button>
      <button onClick={removeDiscount}>Remove Cash Discount</button>
    </div>
  );
}
```

## Parameters

- `products: CartItem[]` - Current array of products
- `setProducts: (products: CartItem[]) => void` - State setter for products
- `cartValue?: any` - Current cart value (optional, for future use)
- `setCartValue?: (cartValue: any) => void` - State setter for cart value (optional, for future use)
- `isOrder?: boolean` - Whether this is an order or quote (default: true)

## Return Value

Returns an object with two memoized functions:

### `handleCDApply`

Applies cash discount to all products.

```typescript
handleCDApply(
  cashDiscountValue: number,
  islatestTermAvailable: boolean,
  paymentTerms?: PaymentTerm
): void
```

**Parameters:**

- `cashDiscountValue` - The discount percentage/value to apply
- `islatestTermAvailable` - Whether latest payment terms are available
- `paymentTerms` - Optional payment terms object

**Behavior:**

- Clones products to avoid mutation
- Preserves `originalUnitPrice` for each product
- Sets `cashdiscountValue` on each product
- Updates products state (triggers recalculation)
- Shows success toast notification

### `handleRemoveCD`

Removes cash discount from all products.

```typescript
handleRemoveCD(prevTerms?: PaymentTerm): void
```

**Parameters:**

- `prevTerms` - Optional previous payment terms

**Behavior:**

- Clones products to avoid mutation
- Restores `originalUnitPrice` if available
- Resets `cashdiscountValue` to 0
- Updates products state (triggers recalculation)
- Shows success toast notification

## Features

- **Immutability**: Deep clones products before modification
- **Price Preservation**: Stores original prices before applying discounts
- **Price Restoration**: Restores original prices when removing discounts
- **Memoization**: Uses `useCallback` to prevent unnecessary re-renders
- **User Feedback**: Shows toast notifications for user actions
- **Flexible**: Works with different payment term scenarios

## Integration

This hook is designed to work seamlessly with `useOrderCalculation` hook. When products are updated via `setProducts`, the calculation hook will automatically recalculate totals with the new discount values.

## Dependencies

- `lodash/cloneDeep` - For deep cloning products
- `react` - For useCallback hook
- `sonner` - For toast notifications
- `@/lib/api` - For PaymentTerm type
- `@/types/calculation/cart` - For CartItem type

## Testing

See `useCashDiscountHandlers.test.ts` for comprehensive test coverage including:

- Applying cash discount
- Applying discount with payment terms
- Removing cash discount
- Price preservation and restoration
- Zero discount handling
- Function memoization
