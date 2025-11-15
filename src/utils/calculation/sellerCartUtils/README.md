# sellerCartUtils

Utility functions for managing multi-seller cart operations, including grouping items by seller, calculating pricing, applying volume discounts, and finding best pricing matches.

## Overview

This module provides utilities for handling cart operations in a multi-seller environment. It supports grouping cart items by seller, calculating pricing for individual sellers and across all sellers, applying volume discounts, finding best pricing matches from multiple sources, and generating summary reports.

## Functions

### `groupCartItemsBySeller`

Groups cart items by seller ID and creates seller cart structures.

**Parameters:**

- `cartItems`: Array of cart items
- `_debugMode`: Debug mode flag (unused, kept for backward compatibility)

**Returns:** Object with seller IDs as keys and seller cart objects as values

**Example:**

```typescript
import { groupCartItemsBySeller } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const sellerCarts = groupCartItemsBySeller(cartItems);
// Returns: { "seller-1": { seller: {...}, items: [...], itemCount: 2, totalQuantity: 20 }, ... }
```

### `calculateSellerCartPricing`

Calculates pricing for a specific seller's cart items.

**Parameters:**

- `sellerItems`: Array of cart items for a seller
- `isInter`: Inter-state tax flag (default: true)
- `insuranceCharges`: Insurance charges (default: 0)
- `precision`: Decimal precision (default: 2)
- `Settings`: Calculation settings object (default: {})
- `isSeller`: Is seller flag (default: false)
- `taxExemption`: Tax exemption flag (default: false)

**Returns:** Object with `pricing` and `processedItems`

**Example:**

```typescript
import { calculateSellerCartPricing } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const result = calculateSellerCartPricing(
  sellerItems,
  true,
  0,
  2,
  {},
  false,
  false
);
// Returns: { pricing: {...}, processedItems: [...] }
```

### `calculateAllSellerCartPricing`

Calculates pricing for all seller carts.

**Parameters:**

- `sellerCarts`: Object containing seller carts
- `calculationParams`: Parameters object with:
  - `isInter`: Inter-state tax flag (default: true)
  - `insuranceCharges`: Insurance charges (default: 0)
  - `precision`: Decimal precision (default: 2)
  - `Settings`: Calculation settings (default: {})
  - `isSeller`: Is seller flag (default: false)
  - `taxExemption`: Tax exemption flag (default: false)

**Returns:** Seller carts with calculated pricing

**Example:**

```typescript
import { calculateAllSellerCartPricing } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const result = calculateAllSellerCartPricing(sellerCarts, {
  isInter: true,
  insuranceCharges: 25,
  precision: 2,
});
```

### `getOverallCartSummary`

Gets total summary across all sellers.

**Parameters:**

- `sellerCartsWithPricing`: Seller carts with calculated pricing

**Returns:** Summary object with totals

**Example:**

```typescript
import { getOverallCartSummary } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const summary = getOverallCartSummary(sellerCartsWithPricing);
// Returns: { totalSellers: 2, totalItems: 5, totalValue: 5000, totalTax: 500, grandTotal: 5500 }
```

### `getMockSellerData`

Gets mock seller data for testing.

**Parameters:**

- `sellerId`: Seller ID string

**Returns:** Mock seller data object

**Example:**

```typescript
import { getMockSellerData } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const sellerData = getMockSellerData("seller-1");
// Returns: { id: "seller-1", name: "Vashi Electricals", location: "Mumbai, Maharashtra", ... }
```

### `applyVolumeDiscountsToSellerCarts`

Applies volume discounts to seller carts.

**Parameters:**

- `sellerCarts`: Object containing seller carts
- `volumeDiscountData`: Object with seller IDs as keys and volume discount arrays as values
- `calculationParams`: Parameters object with:
  - `isInter`: Inter-state tax flag (default: true)
  - `precision`: Decimal precision (default: 2)
  - `Settings`: Calculation settings (default: {})
  - `beforeTax`: Before tax flag (default: false)
  - `beforeTaxPercentage`: Before tax percentage (default: 0)

**Returns:** Seller carts with volume discounts applied

**Example:**

```typescript
import { applyVolumeDiscountsToSellerCarts } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const result = applyVolumeDiscountsToSellerCarts(
  sellerCarts,
  volumeDiscountData,
  {
    isInter: true,
    precision: 2,
  }
);
```

### `findBestPricingMatch`

Finds the best matching pricing data for a product from multiple sources.

**Parameters:**

- `item`: Cart item object
- `sellerPricingData`: Seller-specific pricing data
- `allSellerPricesData`: All seller prices data (fallback)

**Returns:** Pricing data object with `pricingSource` or null

**Example:**

```typescript
import { findBestPricingMatch } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const pricing = findBestPricingMatch(
  item,
  sellerPricingData,
  allSellerPricesData
);
// Returns: { ...pricingData, pricingSource: "seller-specific", matchedSellerId: "seller-1" }
```

### `mergeSellerPricing`

Merges seller-specific pricing with getAllSellerPrices data.

**Parameters:**

- `sellerPricingData`: Seller-specific pricing object
- `allSellerPricesData`: All seller prices object

**Returns:** Merged pricing data object

**Example:**

```typescript
import { mergeSellerPricing } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const merged = mergeSellerPricing(sellerPricingData, allSellerPricesData);
```

### `isValidPricing`

Checks if pricing data is valid.

**Parameters:**

- `pricingData`: Pricing data object

**Returns:** Boolean indicating if pricing is valid

**Example:**

```typescript
import { isValidPricing } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const isValid = isValidPricing({
  MasterPrice: 100,
  BasePrice: 90,
  priceNotAvailable: false,
});
// Returns: true
```

### `getPricingResolutionSummary`

Gets pricing resolution summary for debugging.

**Parameters:**

- `sellerCarts`: Seller carts with pricing

**Returns:** Summary object with pricing source counts

**Example:**

```typescript
import { getPricingResolutionSummary } from "@/utils/calculation/sellerCartUtils/sellerCartUtils";

const summary = getPricingResolutionSummary(sellerCartsWithPricing);
// Returns: { totalSellers: 2, totalProducts: 5, pricingBySources: {...}, productsWithoutPricing: [...] }
```

## Key Features

### Seller Grouping

`groupCartItemsBySeller`:

- Groups items by `sellerId`
- Creates seller information from first item
- Falls back to `vendorName`/`vendorLocation` if seller info missing
- Calculates `itemCount` and `totalQuantity`

### Pricing Calculation

`calculateSellerCartPricing`:

- Processes items through `discountDetails`
- Calculates totals using `cartCalculation`
- Returns pricing and processed items
- Handles empty/null items gracefully

### Volume Discount Application

`applyVolumeDiscountsToSellerCarts`:

- Calculates subtotal and shipping per seller
- Applies volume discount calculation
- Updates items with volume discount results
- Preserves seller cart structure

### Pricing Matching

`findBestPricingMatch`:

- **Priority 1**: Seller-specific pricing (by `sellerId` or `vendorId`)
- **Priority 2**: Exact match from `getAllSellerPrices` (by `sellerId` or `vendorId`)
- **Priority 3**: Cross-seller pricing from `getAllSellerPrices`
- Returns `null` if no match found
- Adds `pricingSource` and `matchedSellerId` to result

### Pricing Validation

`isValidPricing`:

- Checks for `MasterPrice` or `BasePrice` (at least one must be non-null)
- Verifies `priceNotAvailable` is false
- Returns `false` for null/undefined input

## Examples

### Grouping Cart Items

```typescript
const cartItems = [
  {
    productId: "prod-1",
    sellerId: "seller-1",
    sellerName: "Seller 1",
    quantity: 10,
  },
  {
    productId: "prod-2",
    sellerId: "seller-1",
    sellerName: "Seller 1",
    quantity: 5,
  },
  {
    productId: "prod-3",
    sellerId: "seller-2",
    sellerName: "Seller 2",
    quantity: 3,
  },
];

const sellerCarts = groupCartItemsBySeller(cartItems);
// {
//   "seller-1": {
//     seller: { id: "seller-1", name: "Seller 1", ... },
//     items: [...],
//     itemCount: 2,
//     totalQuantity: 15
//   },
//   "seller-2": { ... }
// }
```

### Calculating Pricing

```typescript
const sellerItems = [
  { productId: "prod-1", quantity: 10, unitPrice: 100, totalPrice: 1000 },
];

const result = calculateSellerCartPricing(
  sellerItems,
  true,
  0,
  2,
  {},
  false,
  false
);
// {
//   pricing: { totalItems: 1, totalValue: 1000, totalTax: 100, grandTotal: 1100, ... },
//   processedItems: [...]
// }
```

### Applying Volume Discounts

```typescript
const sellerCarts = {
  "seller-1": {
    items: [{ productId: "prod-1", totalPrice: 1000, shippingCharges: 50 }],
  },
};

const volumeDiscountData = {
  "seller-1": [{ itemNo: "item-1", volumeDiscount: 10, appliedDiscount: 10 }],
};

const result = applyVolumeDiscountsToSellerCarts(
  sellerCarts,
  volumeDiscountData
);
// {
//   "seller-1": {
//     items: [...],
//     volumeDiscountDetails: { subTotal: 1000, subTotalVolume: 900, ... },
//     pfRate: 5
//   }
// }
```

### Finding Best Pricing

```typescript
const item = { productId: "prod-1", sellerId: "seller-1" };
const sellerPricing = {
  "seller-1": [{ ProductVariantId: "prod-1", MasterPrice: 100 }],
};
const allPrices = {
  "seller-2": [{ ProductVariantId: "prod-1", MasterPrice: 90 }],
};

const pricing = findBestPricingMatch(item, sellerPricing, allPrices);
// { ...pricingData, pricingSource: "seller-specific", matchedSellerId: "seller-1" }
```

### Getting Summary

```typescript
const sellerCartsWithPricing = {
  "seller-1": {
    pricing: {
      totalItems: 2,
      totalValue: 2000,
      totalTax: 200,
      grandTotal: 2200,
    },
  },
  "seller-2": {
    pricing: {
      totalItems: 1,
      totalValue: 1000,
      totalTax: 100,
      grandTotal: 1100,
    },
  },
};

const summary = getOverallCartSummary(sellerCartsWithPricing);
// {
//   totalSellers: 2,
//   totalItems: 3,
//   totalValue: 3000,
//   totalTax: 300,
//   grandTotal: 3300
// }
```

## Return Value Structures

### Seller Cart

```typescript
{
  seller: {
    id: string;
    sellerId: string;
    name: string;
    location: string;
  };
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
}
```

### Pricing Result

```typescript
{
  pricing: {
    totalItems: number;
    totalValue: number;
    totalTax: number;
    grandTotal: number;
    totalLP: number;
    pfRate: number;
    totalShipping: number;
    hideListPricePublic: boolean;
    hasProductsWithNegativeTotalPrice: boolean;
    hasAllProductsAvailableInPriceList: boolean;
  };
  processedItems: CartItem[];
}
```

### Overall Summary

```typescript
{
  totalSellers: number;
  totalItems: number;
  totalValue: number;
  totalTax: number;
  grandTotal: number;
}
```

### Pricing Resolution Summary

```typescript
{
  totalSellers: number;
  totalProducts: number;
  pricingBySources: {
    "seller-specific": number;
    "getAllSellerPrices-exact": number;
    "getAllSellerPrices-cross-seller": number;
    "no-pricing": number;
  };
  productsWithoutPricing: Array<{
    productId: string | number;
    productName?: string;
    sellerId: string;
  }>;
}
```

## Notes

- **Seller Grouping**: Items are grouped by `sellerId`, not `vendorId`
- **Fallback Values**: Uses `vendorName`/`vendorLocation` as fallback for seller info
- **Default Values**: Uses "Unknown Seller" and "Location not specified" when info is missing
- **Pricing Priority**: Seller-specific > Exact match > Cross-seller
- **Volume Discounts**: Only applied when volume discount data exists for seller
- **Pricing Validation**: Requires at least one of `MasterPrice` or `BasePrice` to be non-null
- **Summary Calculation**: Accumulates values across all sellers
- **Mock Data**: `getMockSellerData` provides test data for 3 predefined sellers

## Testing

See `sellerCartUtils.test.ts` for comprehensive test cases covering:

- Seller grouping with various item configurations
- Pricing calculations for single and multiple sellers
- Volume discount application
- Pricing matching from multiple sources
- Pricing validation
- Summary calculations
- Edge cases (empty carts, missing data, etc.)

Mocks are available in `sellerCartUtils.mocks.ts`.

## Folder Structure

```
utils/
  calculation/
    sellerCartUtils/
      sellerCartUtils.ts
      sellerCartUtils.test.ts
      sellerCartUtils.mocks.ts
      README.md
```

## Dependencies

- `lodash/find`: Finding items in arrays
- `lodash/groupBy`: Grouping items by key
- `../cartCalculation`: `cartCalculation`, `discountDetails`, `VolumeDiscountCalculation`

## Related

- Hook: `useMultipleSellerCart` - Uses these utilities for multi-seller cart management
- Utility: `cartCalculation` - Core cart calculation functions
- Utility: `volume-discount-calculation` - Volume discount calculations
