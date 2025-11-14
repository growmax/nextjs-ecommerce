# Order Utils

Utility functions for transforming order and quote data for API submissions.

## Overview

This module provides utility functions for handling order and quote data transformations, including:

- Bundle product payload formatting
- Quote to order conversion (Place Order)
- Order payment/update operations
- Place order validation

## Functions

### `formBundleProductsPayload(bundleArray: any[])`

Transforms bundle products array for API payload by converting boolean values to numeric and filtering selected bundles.

**Parameters:**

- `bundleArray`: Array of bundle products

**Returns:**

- Filtered array of selected bundle products with `bundleSelected` and `isBundleSelected_fe` converted to 1 or 0

**Example:**

```typescript
const bundles = [
  { bundleSelected: true, isBundleSelected_fe: true, productId: 1 },
  { bundleSelected: false, isBundleSelected_fe: false, productId: 2 },
];

const payload = formBundleProductsPayload(bundles);
// Returns: [{ bundleSelected: 1, isBundleSelected_fe: 1, productId: 1 }]
```

---

### `checkIsBundleProduct(bundleProducts: any[])`

Checks if a product has any bundle products selected.

**Parameters:**

- `bundleProducts`: Array of bundle products

**Returns:**

- `true` if any bundle product is selected, `false` otherwise

**Example:**

```typescript
const bundles = [
  { bundleSelected: true, productId: 1 },
  { bundleSelected: false, productId: 2 },
];

const hasBundle = checkIsBundleProduct(bundles);
// Returns: true
```

---

### `quoteSubmitDTO(values, overViewValues, displayName, companyName, isPlaceOrder)`

Transforms quote data to order submission DTO. Used when converting a quote to an order (Place Order action).

**Parameters:**

- `values`: Quote data with products, pricing, and terms
- `overViewValues`: Overview data including comment, users, tags, divisions
- `displayName`: User's display name
- `companyName`: Company name
- `isPlaceOrder`: Boolean indicating if this is a place order operation

**Returns:**

- Transformed DTO ready for API submission

**Key Transformations:**

- Converts boolean values to numeric (0/1)
- Maps user IDs from objects
- Calculates totals based on Volume Discount (VD) application
- Formats product details with proper IDs
- Sets payment/tax breakups based on inter/intra state
- Handles bundle products
- Adds removed products to payload

**Example:**

```typescript
const dto = quoteSubmitDTO(
  quoteValues,
  overviewData,
  "John Doe",
  "Acme Corp",
  true // isPlaceOrder
);
// Returns: Complete order DTO ready for submission
```

---

### `orderPaymentDTO(values, overviewValues, previousVersionDetails, initialValues, displayName, companyName, totalPaid, isReorder)`

Transforms order data for payment/update operations. Used when editing existing orders or making payments.

**Parameters:**

- `values`: Order data with products and pricing
- `overviewValues`: Overview data including comment, users, tags
- `previousVersionDetails`: Previous version data for differential calculations
- `initialValues`: Initial order data
- `displayName`: User's display name
- `companyName`: Company name
- `totalPaid`: Amount already paid
- `isReorder`: Boolean indicating if this is a reorder operation

**Returns:**

- Transformed DTO ready for API submission

**Key Transformations:**

- Adjusts cart values based on `totalPaid` amount
- Uses previous version details for differential calculations
- Handles reorder vs edit operations differently
- Sets pfValue to null (known issue workaround)
- Includes/excludes removed products based on `isReorder` flag
- Handles tentative delivery dates

**Example:**

```typescript
const dto = orderPaymentDTO(
  orderValues,
  overviewData,
  previousVersion,
  initialOrder,
  "John Doe",
  "Acme Corp",
  5000, // totalPaid
  false // isReorder
);
// Returns: Complete order payment DTO
```

---

### `validatePlaceOrder(quoteData)`

Validates if a quote can be converted to an order based on its status and validity.

**Parameters:**

- `quoteData`: Object containing:
  - `updatedBuyerStatus`: Current quote status
  - `validityTill` (optional): Quote validity end date
  - `reorder` (optional): Boolean indicating if this is a reorder

**Returns:**

- `PlaceOrderValidation` object:
  - `isValid`: Boolean indicating if place order is allowed
  - `message` (optional): Validation message for invalid cases
  - `variant` (optional): Message variant type

**Validation Rules:**

1. ❌ CANCELLED status → "Quote was cancelled already"
2. ❌ Expired validity → "Contract validity expired"
3. ❌ OPEN status → "Quote owner is working on this quote"
4. ❌ ORDER PLACED status → "Quote was converted to order already"
5. ✅ QUOTE RECEIVED status → Valid
6. ✅ Reorder within validity → Valid
7. ❌ Default → "Quote owner is working on this quote"

**Example:**

```typescript
const validation = validatePlaceOrder({
  updatedBuyerStatus: "QUOTE RECEIVED",
  validityTill: "2025-12-31",
});

if (validation.isValid) {
  // Proceed with place order
} else {
  toast[validation.variant](validation.message);
}
```

## Types

### `PlaceOrderValidation`

```typescript
interface PlaceOrderValidation {
  isValid: boolean;
  message?: string;
  variant?: "info" | "error" | "warning" | "success";
}
```

## Common Use Cases

### 1. Place Order from Quote

```typescript
// Validate first
const validation = validatePlaceOrder({
  updatedBuyerStatus: quote.status,
  validityTill: quote.validityTill,
});

if (!validation.isValid) {
  toast.info(validation.message);
  return;
}

// Transform data
const orderDTO = quoteSubmitDTO(
  quoteData,
  overviewData,
  user.displayName,
  user.companyName,
  true // isPlaceOrder
);

// Submit to API
await OrdersService.createOrder(orderDTO);
```

### 2. Edit Existing Order

```typescript
const orderDTO = orderPaymentDTO(
  editedOrderData,
  overviewData,
  previousVersion,
  initialOrder,
  user.displayName,
  user.companyName,
  totalAmountPaid,
  false // not a reorder
);

await OrderDetailsService.updateOrder(orderDTO);
```

### 3. Reorder

```typescript
const reorderDTO = orderPaymentDTO(
  orderData,
  overviewData,
  null, // no previous version for reorder
  initialOrder,
  user.displayName,
  user.companyName,
  0, // no payment for reorder
  true // isReorder
);

await OrdersService.createOrder(reorderDTO);
```

## Financial Calculations

### Volume Discount (VD) Handling

Both `quoteSubmitDTO` and `orderPaymentDTO` handle Volume Discount calculations:

- **When `VDapplied` is `false`**: Uses `cartValue` fields
- **When `VDapplied` is `true`**: Uses `VDDetails` fields

Fields affected:

- `subTotal`
- `overallTax`
- `taxableAmount`
- `totalPfValue`
- `calculatedTotal`
- `grandTotal`
- `roundingAdjustment`

### Payment Adjustments (Order Payment DTO)

When `totalPaid > 0` and not a reorder, the function adjusts cart values:

```typescript
adjustedValue = currentValue - (previousVersion?.value || initialValue);
```

This ensures proper calculation of remaining amounts after partial payments.

## Product Transformations

### Common Product Mappings

Both DTOs transform products with:

- Account owner ID extraction
- Business unit ID mapping
- Division ID parsing
- Warehouse details
- Tax breakup selection (inter/intra state)
- Discount details formatting
- Bundle products processing
- Price visibility flags

### New vs Existing Products

For new products (`prod.new === true`):

- `lineNo` → `null`
- `itemNo` → `null`

For existing products:

- `lineNo` → preserved
- `itemNo` → preserved

## Testing

Tests are located in `orderUtils.test.ts` with comprehensive coverage of:

- Bundle product transformations
- Quote to order conversions
- Order payment DTOs
- Place order validations
- Edge cases and error scenarios

Run tests:

```bash
npm test orderUtils
```

## Dependencies

- `lodash`: For data manipulation (`map`, `filter`, `some`, `trim`, `forEach`, `cloneDeep`)

## Notes

1. **PF Value**: In `orderPaymentDTO`, `pfValue` is hardcoded to `null` due to a known PF calculation issue
2. **Deep Clone**: `orderPaymentDTO` uses `cloneDeep` to avoid mutating the original values
3. **Window Object**: Both DTOs check for `window` object availability for `domainURL`
4. **Removed Products**: Handled differently for reorder vs edit operations
5. **Date Handling**: Validity checks use `new Date()` comparisons

## Migration from Old Path

This utility was moved from `src/utils/orderUtils.ts` to `src/utils/order/orderUtils/orderUtils.ts` to follow the standard folder structure pattern.

Update imports:

```typescript
// Old
import { quoteSubmitDTO, orderPaymentDTO } from "@/utils/orderUtils";

// New
import {
  quoteSubmitDTO,
  orderPaymentDTO,
} from "@/utils/order/orderUtils/orderUtils";
```
