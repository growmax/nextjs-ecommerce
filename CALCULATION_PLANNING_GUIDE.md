# 🧮 Order Calculation Planning Guide

## Overview
This guide helps you plan and implement complex calculation logic with multiple conditions in your Next.js e-commerce application.

---

## 🎯 The Problem: Complex Calculations with Many Conditions

When you have calculations with:
- Multiple discount types (volume, cash, basic, special)
- Different tax scenarios (inter-state, intra-state, exemptions)
- Conditional logic (MOQ checks, bundle products, negative prices)
- Edge cases (currency conversion, rounding, resets)

**It becomes difficult to manage and maintain.**

---

## 💡 The Solution: Modular Calculation Pipeline

Break your calculation into **sequential steps** that each handle one concern.

### Step-by-Step Pipeline

```
1. INPUT VALIDATION
   ↓
2. RESET/CLEANUP (if edit/reorder)
   ↓
3. BUNDLE HANDLING
   ↓
4. DISCOUNT CALCULATION
   ↓
5. PRICE CALCULATION
   ↓
6. TAX CALCULATION
   ↓
7. CART TOTALS
   ↓
8. SPECIAL FEATURES (Volume Discount)
   ↓
9. FINAL ADJUSTMENTS (Shipping, Insurance, Rounding)
   ↓
10. OUTPUT VALIDATION & WARNINGS
```

---

## 📋 Planning Template for New Calculations

### Step 1: Define Your Input Data Structure
**What data do you need from services?**

```typescript
interface CalculationInput {
  // Product data from API
  products: Product[];
  
  // Order context
  isInter: boolean;          // Inter-state or Intra-state
  taxExemption: boolean;     // Is buyer tax-exempt?
  
  // Discounts from API
  discountData: DiscountData;
  
  // Settings from API
  settings: Settings;
  
  // Additional charges
  shippingCharges: number;
  insuranceCharges: number;
  pfRate: number;
}
```

### Step 2: Define Your Output Structure
**What do you need to return?**

```typescript
interface CalculationOutput {
  // Calculated products
  products: CalculatedProduct[];
  
  // Cart totals
  cartValue: CartValue;
  
  // Tax breakup
  breakup: TaxBreakup;
  
  // Warnings for user
  warnings: Warning[];
  
  // Metadata for debugging
  metadata: Metadata;
}
```

### Step 3: Map Out All Conditions

Create a **condition matrix** for your calculations:

| Condition | When | Impact | Priority |
|-----------|------|--------|----------|
| Is Reorder | `isReorder === true` | Reset shipping & discounts | HIGH |
| Is Inter-State | `isInter === true` | Use IGST instead of CGST+SGST | HIGH |
| Tax Exemption | `taxExemption === true` | Skip all tax calculations | HIGH |
| Volume Discount | `VDApplied === true` | Apply VD after basic calc | MEDIUM |
| Cash Discount | `cashdiscountValue > 0` | Reduce unit price | MEDIUM |
| MOQ Check | `quantity < minOrderQuantity` | Show warning | LOW |
| Negative Price | `unitPrice < 0` | Show warning | LOW |

### Step 4: Create Calculation Flowchart

```
┌─────────────────┐
│  Start          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Is Reorder?     │──YES─► Reset fields
└────────┬────────┘
         NO
         │
         ▼
┌─────────────────┐
│ Has Bundles?    │──YES─► Handle bundles
└────────┬────────┘
         NO
         │
         ▼
┌─────────────────┐
│ Apply Discounts │
│ (quantity-based)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cash Discount?  │──YES─► Reduce price
└────────┬────────┘
         NO
         │
         ▼
┌─────────────────┐
│ Calculate Taxes │
│ (inter/intra)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Volume Discount?│──YES─► Apply VD
└────────┬────────┘
         NO
         │
         ▼
┌─────────────────┐
│  Calculate      │
│  Grand Total    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return Result  │
└─────────────────┘
```

---

## 🔧 Implementation Strategy

### Pattern 1: Sequential Processing

```typescript
function calculateOrder(input: Input): Output {
  let products = cloneDeep(input.products);
  const warnings = [];
  
  // Step 1: Reset if needed
  if (input.isReorder) {
    products = resetFields(products);
  }
  
  // Step 2: Apply discounts
  products = applyDiscounts(products, input.discountData);
  
  // Step 3: Calculate taxes
  products = calculateTaxes(products, input.isInter, input.taxExemption);
  
  // Step 4: Calculate totals
  const cartValue = calculateTotals(products, input);
  
  // Step 5: Apply volume discount
  if (input.volumeDiscount) {
    const result = applyVolumeDiscount(products, cartValue);
    products = result.products;
    cartValue = result.cartValue;
  }
  
  return {
    products,
    cartValue,
    warnings,
  };
}
```

### Pattern 2: Conditional Branching

```typescript
function calculateTaxes(product: Product, isInter: boolean, taxExemption: boolean) {
  // Early exit for tax exemption
  if (taxExemption) {
    return { ...product, totalTax: 0 };
  }
  
  // Branch based on inter/intra state
  if (isInter) {
    return calculateInterStateTax(product);
  } else {
    return calculateIntraStateTax(product);
  }
}
```

### Pattern 3: Validation & Warnings

```typescript
function validateProduct(product: Product): Warning[] {
  const warnings = [];
  
  if (product.quantity < product.minOrderQuantity) {
    warnings.push({
      type: 'moq',
      message: `Quantity below MOQ of ${product.minOrderQuantity}`,
    });
  }
  
  if (product.unitPrice < 0) {
    warnings.push({
      type: 'negative_price',
      message: 'Product has negative price',
    });
  }
  
  return warnings;
}
```

---

## 🧪 Testing Strategy

### Test Each Step Independently

```typescript
describe('Order Calculations', () => {
  describe('Step 1: Reset Fields', () => {
    it('should reset shipping charges on reorder', () => {
      const products = [{ shippingCharges: 100 }];
      const result = resetFields(products);
      expect(result[0].shippingCharges).toBe(0);
    });
  });
  
  describe('Step 2: Apply Discounts', () => {
    it('should apply quantity-based discount', () => {
      const product = { quantity: 10, unitListPrice: 100 };
      const result = applyDiscounts(product, discountRanges);
      expect(result.discount).toBeGreaterThan(0);
    });
  });
  
  // ... more tests for each step
});
```

### Test Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle zero quantity', () => {
    // test implementation
  });
  
  it('should handle negative prices', () => {
    // test implementation
  });
  
  it('should handle missing discount data', () => {
    // test implementation
  });
});
```

---

## 📚 Example: Complete Calculation Flow

```typescript
// File: src/hooks/useOrderCalculation.ts

export function useOrderCalculation(input: OrderCalculationInput) {
  const calculatedData = useMemo(() => {
    const warnings: Warning[] = [];
    
    // STEP 1: CLONE & VALIDATE
    let products = cloneDeep(input.products);
    if (!products || products.length === 0) {
      return { products: [], cartValue: emptyCartValue, warnings };
    }
    
    // STEP 2: RESET (if reorder)
    if (input.options?.resetFields) {
      products = products.map(p => ({
        ...p,
        shippingCharges: 0,
        cashdiscountValue: 0,
      }));
    }
    
    // STEP 3: HANDLE BUNDLES
    if (input.options?.handleBundles) {
      products = handleBundleProductsLogic(products);
    }
    
    // STEP 4: APPLY DISCOUNTS
    products = products.map(product => {
      // Initialize
      let updatedProduct = { ...product };
      
      // Quantity-based discount
      if (product.disc_prd_related_obj?.discounts) {
        const { suitableDiscount } = getSuitableDiscountByQuantity(
          product.quantity,
          product.disc_prd_related_obj.discounts,
          0
        );
        
        if (suitableDiscount) {
          updatedProduct.discount = suitableDiscount.Value;
          updatedProduct.unitPrice = calculateDiscountedPrice(
            product.unitListPrice,
            suitableDiscount.Value
          );
        }
      }
      
      // Cash discount
      if (input.options?.applyCashDiscount && product.cashdiscountValue) {
        updatedProduct.unitPrice = applyPercentageDiscount(
          updatedProduct.unitPrice,
          product.cashdiscountValue
        );
      }
      
      // Validation
      if (updatedProduct.unitPrice < 0) {
        warnings.push({
          type: 'negative_price',
          productId: product.productId,
          message: 'Negative price after discounts',
        });
      }
      
      return updatedProduct;
    });
    
    // STEP 5: CALCULATE CART
    const { cartValue, processedItems } = calculateCart({
      cartData: products,
      isInter: input.isInter,
      insuranceCharges: input.insuranceCharges,
      precision: input.precision,
      settings: input.settings,
    });
    
    products = processedItems;
    
    // STEP 6: VOLUME DISCOUNT (if applicable)
    let finalCartValue = cartValue;
    if (input.options?.applyVolumeDiscount) {
      const volumeResult = applyVolumeDiscount(products, cartValue);
      if (volumeResult) {
        products = volumeResult.products;
        finalCartValue = volumeResult.cartValue;
      }
    }
    
    // STEP 7: EXTRACT BREAKUP
    const breakup = extractTaxBreakup(finalCartValue);
    
    return {
      products,
      cartValue: finalCartValue,
      breakup,
      warnings,
    };
  }, [input]);
  
  return {
    calculatedData,
    recalculate: () => calculatedData,
  };
}
```

---

## 🎨 Best Practices

### 1. **Immutability**
Always clone data before modification:
```typescript
const products = cloneDeep(input.products); // ✅ Good
input.products.forEach(p => p.price = 100); // ❌ Bad - mutates input
```

### 2. **Early Returns**
Exit early for special cases:
```typescript
if (taxExemption) {
  return { ...product, totalTax: 0 }; // ✅ Good - clear intent
}

// vs

if (!taxExemption) {
  // ... 50 lines of tax calculation
} else {
  return { ...product, totalTax: 0 }; // ❌ Harder to read
}
```

### 3. **Single Responsibility**
Each function should do ONE thing:
```typescript
// ✅ Good - focused functions
function applyDiscount(price, percentage) { ... }
function calculateTax(price, rate) { ... }
function calculateTotal(price, tax) { ... }

// ❌ Bad - does too much
function calculateEverything(data) {
  // discount logic
  // tax logic
  // total logic
  // 500 lines...
}
```

### 4. **Type Safety**
Use TypeScript interfaces:
```typescript
interface Product {
  unitPrice: number;
  quantity: number;
  discount?: number;
}

function calculate(product: Product): CalculatedProduct {
  // TypeScript will catch errors!
}
```

### 5. **Logging & Debugging**
Add metadata for debugging:
```typescript
return {
  products,
  cartValue,
  metadata: {
    calculationTime: Date.now(),
    hasWarnings: warnings.length > 0,
    appliedRules: ['discount', 'tax', 'volume'],
  },
};
```

---

## 🚀 Quick Start Checklist

When implementing a new calculation:

- [ ] Define input/output types
- [ ] Map all conditions in a table
- [ ] Draw flowchart of logic
- [ ] Break into small functions (one concern each)
- [ ] Use immutable operations
- [ ] Add validation & warnings
- [ ] Write unit tests for each step
- [ ] Test edge cases
- [ ] Add TypeScript types
- [ ] Document complex conditions

---

## 📖 Additional Resources

- **Type Definitions**: `/src/types/calculation/`
- **Utility Functions**: `/src/utils/calculation/`
- **Example Hook**: `/src/hooks/useOrderCalculation.ts`
- **Service Guide**: `/CREATE_SERVICE_GUIDE.md`

---

**Remember**: Complex calculations become simple when broken into small, testable steps! 🎯

