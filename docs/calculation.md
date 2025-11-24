# 🧮 Order Calculation System

## Overview

Complete guide for the order calculation system. Pass service data to `useOrderCalculation` hook and get fully calculated results with taxes, discounts, and totals.

---

## 🚀 Quick Start

### Step 1: Import the Hook

```typescript
import { useOrderCalculation } from "@/hooks/useOrderCalculation";
```

### Step 2: Use in Your Component

```typescript
const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  isInter: true,
  taxExemption: false,
  precision: 2,
  settings: {
    roundingAdjustment: true,
    itemWiseShippingTax: false,
  },
  options: {
    applyVolumeDiscount: true,
    applyCashDiscount: true,
    applyBasicDiscount: true,
    checkMOQ: true,
    applyRounding: true,
  },
});
```

### Step 3: Use the Results

```typescript
const { products, cartValue, breakup, warnings } = calculatedData;

// Update your form/state
setValue("orderDetails[0].dbProductDetails", products);
setValue("orderDetails[0].cartValue", cartValue);
```

---

## 📦 Output Structure

### `calculatedData` Object

```typescript
{
  products: CartItem[];           // Fully calculated products
  cartValue: CartValue;            // Totals (grandTotal, totalTax, etc.)
  breakup: TaxBreakup;             // Tax breakdown (CGST, SGST, IGST)
  warnings: Warning[];             // MOQ violations, negative prices, etc.
  metadata: Metadata;              // Debug info, timestamps
}
```

### CartValue Structure

```typescript
{
  totalItems: number; // Number of products
  totalValue: number; // Subtotal before tax
  totalTax: number; // Total tax amount
  grandTotal: number; // Final total
  totalLP: number; // Total list price
  pfRate: number; // Total PF charges
  totalShipping: number; // Total shipping
  totalCashDiscount: number; // Total cash discount
  totalBasicDiscount: number; // Total basic discount
  taxableAmount: number; // Taxable amount
  // ... dynamic tax fields (CGSTTotal, SGSTTotal, etc.)
}
```

---

## ⚙️ Configuration

### Main Parameters

| Parameter          | Type                  | Default      | Description                                   |
| ------------------ | --------------------- | ------------ | --------------------------------------------- |
| `products`         | `CartItem[]`          | **required** | Products from API                             |
| `isInter`          | `boolean`             | `true`       | Inter-state (IGST) or Intra-state (CGST+SGST) |
| `taxExemption`     | `boolean`             | `false`      | Is buyer tax-exempt?                          |
| `insuranceCharges` | `number`              | `0`          | Insurance charges                             |
| `shippingCharges`  | `number`              | `0`          | Shipping charges                              |
| `pfRate`           | `number`              | `0`          | Packaging & Forwarding rate                   |
| `precision`        | `number`              | `2`          | Decimal precision                             |
| `settings`         | `CalculationSettings` | **required** | Calculation settings                          |
| `options`          | `CalculationOptions`  | `{}`         | Additional options                            |

### Options Object

| Option                | Type      | Default | Description                   |
| --------------------- | --------- | ------- | ----------------------------- |
| `applyVolumeDiscount` | `boolean` | `true`  | Apply volume discount         |
| `applyCashDiscount`   | `boolean` | `true`  | Apply cash discount           |
| `applyBasicDiscount`  | `boolean` | `true`  | Apply quantity-based discount |
| `handleBundles`       | `boolean` | `true`  | Handle bundle products        |
| `checkMOQ`            | `boolean` | `true`  | Check minimum order quantity  |
| `applyRounding`       | `boolean` | `true`  | Round final total             |
| `resetShipping`       | `boolean` | `false` | Reset shipping (for reorder)  |
| `resetDiscounts`      | `boolean` | `false` | Reset discounts (for reorder) |

---

## 🔄 Calculation Pipeline

```
Input → Clone & Validate → Reset (if reorder) → Bundles →
Discounts → Prices → Taxes → Cart Totals → Volume Discount →
Additional Charges → Rounding → Output
```

### Step-by-Step Process

1. **Clone & Validate** - Deep clone products, validate input
2. **Reset Fields** - Reset shipping/discounts for reorder (optional)
3. **Bundle Handling** - Process bundle products (optional)
4. **Discount Application**:
   - Quantity-based discounts (with ranges)
   - Cash discounts
   - Special discounts
5. **Price Calculation** - Compute final unit prices and totals
6. **Tax Calculation**:
   - Inter-state (IGST)
   - Intra-state (CGST + SGST)
   - Compound taxes
7. **Cart Totals** - Aggregate all values
8. **Volume Discount** - Apply VD if enabled (optional)
9. **Additional Charges** - Add shipping, insurance, PF
10. **Rounding** - Round final total (optional)
11. **Validation** - Check for warnings (MOQ, negative prices, etc.)

---

## 🎯 Common Use Cases

### Edit Order

```typescript
const { calculatedData } = useOrderCalculation({
  products: watch("orderDetails[0].dbProductDetails"),
  isInter: watch("orderDetails[0].isInter"),
  settings: calculationSettings,
});
```

### Reorder (Reset Shipping & Discounts)

```typescript
const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    resetShipping: true,
    resetDiscounts: true,
  },
});
```

### With Volume Discount

```typescript
const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    applyVolumeDiscount: VolumeDiscountAvailable && VDapplied,
  },
});
```

### With Additional Charges

```typescript
const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  shippingCharges: 100,
  insuranceCharges: 50,
  pfRate: 2.5,
  settings: calculationSettings,
});
```

---

## 🔍 Discount Logic

### Quantity-Based Discount

```
Product: Quantity = 10, Unit List Price = ₹1000
Discount Range: { min: 6, max: 10, discount: 10% }

Applied: unitPrice = 1000 × (1 - 10/100) = ₹900
```

### Cash Discount

```
After Quantity Discount: unitPrice = ₹900
Cash Discount: 5%

Applied: unitPrice = 900 × (1 - 5/100) = ₹855
Total: totalPrice = 855 × 10 = ₹8,550
```

---

## 🧾 Tax Calculation

### Inter-State (IGST)

```
Product: totalPrice = ₹8,550, pfRate = ₹171
Tax Rate: 18% IGST

taxableAmount = 8,550 + 171 = ₹8,721
IGST = 8,721 × 18% = ₹1,569.78
```

### Intra-State (CGST + SGST)

```
Product: totalPrice = ₹8,550, pfRate = ₹171
Tax Rate: 9% CGST + 9% SGST = 18% Total

taxableAmount = 8,550 + 171 = ₹8,721
CGST = 8,721 × 9% = ₹784.89
SGST = 8,721 × 9% = ₹784.89
Total Tax = ₹1,569.78
```

---

## 📊 Cart Aggregation

```
Product 1: price=₹8,550, tax=₹1,570, shipping=₹100
Product 2: price=₹5,000, tax=₹900, shipping=₹50

totalValue = 8,550 + 5,000 = ₹13,550
totalTax = 1,570 + 900 = ₹2,470
totalShipping = 100 + 50 = ₹150
insurance = ₹200
pfRate = ₹271

calculatedTotal = 13,550 + 2,470 + 150 + 200 + 271 = ₹16,641
grandTotal = ₹16,641 (rounded)
```

---

## 🎨 Best Practices

### 1. Immutability

```typescript
const products = cloneDeep(input.products); // ✅ Good
input.products.forEach(p => (p.price = 100)); // ❌ Bad
```

### 2. Early Returns

```typescript
if (taxExemption) {
  return { ...product, totalTax: 0 }; // ✅ Good
}
```

### 3. Single Responsibility

```typescript
// ✅ Good - focused functions
function applyDiscount(price, percentage) { ... }
function calculateTax(price, rate) { ... }

// ❌ Bad - does too much
function calculateEverything(data) { /* 500 lines... */ }
```

### 4. Type Safety

```typescript
interface Product {
  unitPrice: number;
  quantity: number;
  discount?: number;
}
```

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

## 💡 Pro Tips

### Use with React Hook Form

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

### Handle Warnings

```typescript
if (calculatedData.warnings.length > 0) {
  calculatedData.warnings.forEach(warning => {
    if (warning.type === "moq") {
      showNotification(`Product ${warning.productId}: ${warning.message}`);
    }
  });
}
```

### Conditional Options

```typescript
const isReorder = watch("isReorder");

const { calculatedData } = useOrderCalculation({
  products: orderProducts,
  settings: calculationSettings,
  options: {
    resetShipping: isReorder,
    resetDiscounts: isReorder,
    applyVolumeDiscount: VDEnabled,
  },
});
```

---

## 🎯 What Conditions Are Handled?

The hook handles **40+ conditions** automatically:

- ✅ Edit order, Reorder, Clone order
- ✅ Quantity-based discounts, Cash discounts, Volume discounts
- ✅ Inter-state (IGST), Intra-state (CGST+SGST), Tax exemptions
- ✅ Bundle products, MOQ checks, Packaging quantity
- ✅ Shipping charges, Insurance charges, PF charges
- ✅ Rounding adjustments, Currency conversion, Precision
- ✅ MOQ violations, Negative prices, Missing pricing warnings

---

## 📚 Related Files

### Implementation

- **Hook**: `/src/hooks/useOrderCalculation.ts`
- **Types**: `/src/types/calculation/`

### Utilities

- `/src/utils/calculation/cart-calculation.ts`
- `/src/utils/calculation/tax-calculation.ts`
- `/src/utils/calculation/discountCalculation.ts`
- `/src/utils/calculation/volume-discount-calculation.ts`
- `/src/utils/calculation/product-utils.ts`

---

## 🚦 Quick Decision Guide

**"I'm implementing edit order now"**  
→ Use the Quick Start section above

**"I want to understand the architecture"**  
→ Read the Calculation Pipeline section

**"I need to see code examples"**  
→ Check the Common Use Cases section

**"I'm debugging an issue"**  
→ Review the Common Issues section

---

**Happy Calculating! 🧮✨**

_Last Updated: December 2024_
