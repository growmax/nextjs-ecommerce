# TargetDiscountCard Component

A React component for managing target discount and target price calculations in quote summary pages. This component allows users to set either a target discount percentage or a target price, which automatically calculates revised product prices for Special Price Request (SPR).

## Overview

The `TargetDiscountCard` component is used in quote summary pages to enable buyers to request special pricing. It provides two input methods:
- **Target Discount**: Enter a discount percentage (0-100%)
- **Target Price**: Enter a specific target price amount

When either value is changed, the component automatically:
- Calculates the corresponding value (discount ↔ price)
- Updates all product prices proportionally based on their contribution to the total
- Sets SPR (Special Price Request) flags when applicable
- Handles cash discount integration

## Props

```typescript
interface TargetDiscountCardProps {
  isContentPage?: boolean;   // If true, displays read-only view (default: false)
  isSummaryPage?: boolean;   // If true, always shows the card (default: true)
}
```

## Usage

### Basic Usage (Summary Page)

```tsx
import { FormProvider, useForm } from "react-hook-form";
import TargetDiscountCard from "@/components/summary/TargetDiscountCard/TargetDiscountCard";

function QuoteSummaryPage() {
  const methods = useForm({
    defaultValues: {
      sprDetails: {
        targetPrice: 0,
        sprRequestedDiscount: 0,
        spr: false,
      },
      cartValue: {
        totalValue: 1000,
        // ... other cart values
      },
      products: [
        // ... product array
      ],
    },
  });

  return (
    <FormProvider {...methods}>
      <TargetDiscountCard isSummaryPage={true} />
    </FormProvider>
  );
}
```

### Content Page (Read-Only)

```tsx
<TargetDiscountCard 
  isContentPage={true} 
  isSummaryPage={false} 
/>
```

## Form Data Structure

The component expects the following form structure:

```typescript
{
  sprDetails: {
    targetPrice: number;              // Target price amount
    sprRequestedDiscount: number;     // Discount percentage (0-100)
    spr: boolean;                     // SPR flag
  },
  cartValue: {
    totalValue: number;               // Total cart value
    cashDiscountValue: number;        // Cash discount percentage (if applied)
    // ... other cart values
  },
  products: Array<{
    productId: number;
    unitPrice: number;
    quantity: number;
    askedQuantity: number;
    totalPrice: number;
    // ... other product fields
  }>,
  cashdiscount: boolean;               // Whether cash discount is applied
  isSPRRequested: boolean;            // Whether SPR is requested
}
```

## Features

### 1. Bidirectional Calculation
- Changing **target discount** automatically calculates **target price**
- Changing **target price** automatically calculates **target discount**

### 2. Proportional Product Updates
When target price/discount changes, each product is updated based on its contribution percentage:
- **Contribution**: `(product.totalPrice / totalValue) * 100`
- **Revised Value**: `(targetPrice * contribution) / 100`
- **Buyer Requested Price**: `revisedValue / quantity`
- **Buyer Requested Discount**: `((unitPrice - buyerRequestedPrice) / unitPrice) * 100`

### 3. Cash Discount Integration
When cash discount is applied and `totalValue` changes:
- Target price is recalculated based on the new discounted total
- Target discount is calculated from the original total (before cash discount)

### 4. SPR Flag Management
- Sets `isSPRRequested = true` when `targetPrice < totalValue`
- Sets `isSPRRequested = false` when `targetPrice >= totalValue`
- Updates `sprDetails.spr` based on quote settings

### 5. Validation
- Discount values are clamped to 0-100% range
- Handles edge cases (zero values, negative values, very large values)
- Displays validation errors from form state

## Display Modes

### Summary Page Mode (`isContentPage={false}`)
- Shows editable input fields
- Allows users to change discount/price values
- Displays validation errors inline

### Content Page Mode (`isContentPage={true}`)
- Shows read-only display
- Displays formatted values (discount as percentage, price as currency)
- Used in quote detail pages

## Visibility Logic

The component is shown when:
- `isSummaryPage={true}` (always visible on summary pages)
- OR `targetPrice > 0` OR `sprRequestedDiscount > 0` (visible on content pages if values exist)

## Dependencies

- **react-hook-form**: For form state management
- **@/hooks/useUser**: To get company data (roundOff setting)
- **@/hooks/useModuleSettings**: To get quote settings (SPR configuration)
- **@/components/PricingFormat**: For currency formatting
- **@/components/ui/card, input, label**: UI components

## Testing

See `TargetDiscountCard.test.tsx` for comprehensive test coverage including:
- Rendering in different modes
- Input handling and calculations
- Product updates
- SPR flag management
- Cash discount integration
- Edge cases

## Mock Data

See `TargetDiscountCard.mocks.ts` for mock data and test utilities.

## Migration Notes

This component was migrated from `buyer-fe/src/components/Summary/Components/TargetDiscountCard/TargetDiscountCard.js` and maintains compatibility with the original implementation while using modern React patterns and TypeScript.

