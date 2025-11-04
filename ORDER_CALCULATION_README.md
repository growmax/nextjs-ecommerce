# 🧮 Order Calculation Hook - Quick Reference

## Overview
A comprehensive calculation hook for handling complex order calculations in edit order scenarios. Just pass your service data, get back fully calculated results.

---

## 🚀 Quick Start

### 1. Import the Hook
```typescript
import useOrderCalculation from "@/hooks/useOrderCalculation";
```

### 2. Use in Your Component
```typescript
const { calculatedData, isCalculating } = useOrderCalculation({
  products: orderProducts,
  isInter: true,
  taxExemption: false,
  settings: { roundingAdjustment: true },
  options: {
    applyVolumeDiscount: true,
    applyCashDiscount: true,
  }
});
```

### 3. Use the Results
```typescript
// Access calculated data
const { products, cartValue, breakup, warnings } = calculatedData;

// Update your form/state
setValue("orderDetails[0].dbProductDetails", products);
setValue("orderDetails[0].cartValue", cartValue);
```

---

## 📦 What You Get Back

### `calculatedData` Object

```typescript
{
  products: CartItem[];           // Fully calculated products with taxes, discounts
  cartValue: CartValue;           // Total values (grandTotal, totalTax, etc.)
  breakup: TaxBreakup;           // Tax breakup by type (CGST, SGST, IGST)
  warnings: Warning[];           // MOQ violations, negative prices, etc.
  metadata: Metadata;            // Debug info, timestamps, flags
}
```

---

## 🎯 Common Use Cases

### Edit Order
```typescript
useOrderCalculation({
  products: watch("orderDetails[0].dbProductDetails"),
  isInter: watch("orderDetails[0].isInter"),
  settings: calculationSettings,
});
```

### Reorder (Reset Shipping & Discounts)
```typescript
useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    resetShipping: true,
    resetDiscounts: true,
  }
});
```

### With Volume Discount
```typescript
useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    applyVolumeDiscount: VolumeDiscountAvailable && VDapplied,
  }
});
```

### With Additional Charges
```typescript
useOrderCalculation({
  products: orderProducts,
  shippingCharges: 100,
  insuranceCharges: 50,
  pfRate: 2.5,
  settings: calculationSettings,
});
```

---

## ⚙️ Configuration Options

### Main Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `products` | `CartItem[]` | **required** | Products from your API |
| `isInter` | `boolean` | `true` | Inter-state or Intra-state |
| `taxExemption` | `boolean` | `false` | Is buyer tax-exempt? |
| `insuranceCharges` | `number` | `0` | Insurance charges |
| `shippingCharges` | `number` | `0` | Shipping charges |
| `pfRate` | `number` | `0` | Packaging & Forwarding rate |
| `currencyFactor` | `number` | `1` | Currency conversion factor |
| `precision` | `number` | `2` | Decimal precision |
| `settings` | `CalculationSettings` | **required** | Calculation settings |
| `options` | `CalculationOptions` | `{}` | Additional options |

### Options Object

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `applyVolumeDiscount` | `boolean` | `true` | Apply volume discount |
| `applyCashDiscount` | `boolean` | `true` | Apply cash discount |
| `applyBasicDiscount` | `boolean` | `true` | Apply quantity-based discount |
| `handleBundles` | `boolean` | `true` | Handle bundle products |
| `checkMOQ` | `boolean` | `true` | Check minimum order quantity |
| `applyRounding` | `boolean` | `true` | Round final total |
| `resetShipping` | `boolean` | `false` | Reset shipping (for reorder) |
| `resetDiscounts` | `boolean` | `false` | Reset discounts (for reorder) |

---

## 📊 Output Structure

### CartValue
```typescript
{
  totalItems: number;          // Total number of products
  totalValue: number;          // Subtotal before tax
  totalTax: number;            // Total tax amount
  grandTotal: number;          // Final total
  totalLP: number;             // Total list price
  pfRate: number;              // Total PF charges
  totalShipping: number;       // Total shipping
  totalCashDiscount: number;   // Total cash discount
  totalBasicDiscount: number;  // Total basic discount
  cashDiscountValue: number;   // Cash discount percentage
  // ... dynamic tax fields (CGSTTotal, SGSTTotal, etc.)
}
```

### Warning Types
```typescript
type WarningType = 
  | "moq"              // Below minimum order quantity
  | "pricing"          // Price not available
  | "discount"         // Discount issue
  | "tax"              // Tax calculation issue
  | "negative_price";  // Negative price after discounts
```

### Metadata
```typescript
{
  totalProducts: number;        // Total products
  productsWithPrice: number;    // Products with valid pricing
  productsWithoutPrice: number; // Products missing price
  hasVolumeDiscount: boolean;   // Volume discount applied?
  hasCashDiscount: boolean;     // Cash discount applied?
  hasNegativePrices: boolean;   // Any negative prices?
  calculationTimestamp: number; // When calculated
}
```

---

## 🔍 What Calculations Are Performed?

### Step-by-Step Process

1. **Input Validation** - Validates and clones input data
2. **Reset Fields** - Resets shipping/discounts for reorder (optional)
3. **Bundle Handling** - Processes bundle products (optional)
4. **Discount Application**:
   - Quantity-based discounts
   - Special discounts
   - Cash discounts
5. **Price Calculation** - Computes final unit prices
6. **Tax Calculation**:
   - Inter-state (IGST)
   - Intra-state (CGST + SGST)
   - Compound taxes
7. **Cart Totals** - Aggregates all values
8. **Volume Discount** - Applies VD if enabled (optional)
9. **Additional Charges** - Adds shipping, insurance, PF
10. **Rounding** - Rounds final total (optional)
11. **Validation** - Checks for warnings (MOQ, negative prices, etc.)

---

## 💡 Pro Tips

### 1. Use with React Hook Form
```typescript
const { watch, setValue } = useFormContext();
const products = watch("orderDetails[0].dbProductDetails");

const { calculatedData } = useOrderCalculation({
  products: products || [],
  settings: calculationSettings,
});

useEffect(() => {
  setValue("orderDetails[0].cartValue", calculatedData.cartValue);
}, [calculatedData]);
```

### 2. Handle Warnings
```typescript
const { calculatedData } = useOrderCalculation({ /* ... */ });

if (calculatedData.warnings.length > 0) {
  calculatedData.warnings.forEach(warning => {
    if (warning.type === 'moq') {
      showNotification(`Product ${warning.productId}: ${warning.message}`);
    }
  });
}
```

### 3. Conditional Options Based on State
```typescript
const isReorder = watch("isReorder");
const VDEnabled = watch("orderDetails[0].VolumeDiscountAvailable");

const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    resetShipping: isReorder,
    resetDiscounts: isReorder,
    applyVolumeDiscount: VDEnabled,
  }
});
```

### 4. Debugging with Metadata
```typescript
const { calculatedData } = useOrderCalculation({ /* ... */ });

console.log("Calculation metadata:", {
  time: new Date(calculatedData.metadata.calculationTimestamp),
  hasVD: calculatedData.metadata.hasVolumeDiscount,
  warnings: calculatedData.warnings.length,
});
```

---

## 🧪 Testing

### Unit Test Example
```typescript
import { renderHook } from "@testing-library/react";
import useOrderCalculation from "./useOrderCalculation";

test("should calculate basic order totals", () => {
  const { result } = renderHook(() =>
    useOrderCalculation({
      products: [
        {
          productId: 1,
          quantity: 10,
          unitPrice: 100,
          unitListPrice: 120,
        },
      ],
      settings: { roundingAdjustment: true },
    })
  );

  expect(result.current.calculatedData.cartValue.totalValue).toBe(1000);
  expect(result.current.calculatedData.cartValue.totalBasicDiscount).toBe(200);
});
```

---

## 📚 Related Files

- **Hook**: `/src/hooks/useOrderCalculation.ts`
- **Examples**: `/src/hooks/useOrderCalculation.example.tsx`
- **Planning Guide**: `/CALCULATION_PLANNING_GUIDE.md`
- **Types**: `/src/types/calculation/`
- **Utils**: `/src/utils/calculation/`

---

## 🆘 Common Issues & Solutions

### Issue: Calculations not updating
**Solution**: Ensure you're passing reactive data (from `watch()` or state)

### Issue: Warnings not showing
**Solution**: Check `calculatedData.warnings` array and display them

### Issue: Wrong tax type applied
**Solution**: Verify `isInter` boolean is correct (inter-state vs intra-state)

### Issue: Volume discount not applying
**Solution**: Ensure `options.applyVolumeDiscount` is `true` AND products have VD data

### Issue: Negative prices after discount
**Solution**: Check `warnings` array for `negative_price` type and handle accordingly

---

## 🎯 Best Practices

1. ✅ Always clone input data (hook does this for you)
2. ✅ Use TypeScript types for type safety
3. ✅ Handle warnings in your UI
4. ✅ Use `useEffect` to sync with form state
5. ✅ Test edge cases (zero quantity, missing prices, etc.)
6. ✅ Log metadata for debugging in development
7. ✅ Use conditional options based on order type

---

**Need Help?** Check the examples file or planning guide! 📖

