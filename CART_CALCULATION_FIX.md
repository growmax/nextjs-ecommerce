# Cart Calculation Fix - Discount Data Issue

## Problem Identified

The cart calculation was not working correctly because:

1. **Missing Discount Data Processing**: `cartCalculation` was being called directly on raw cart items without:
   - Fetching discount data from the API
   - Applying discount details to items using `assign_pricelist_discounts_data_to_products`
   - Processing discount details using `processDiscountDetails` (TypeScript version of `discountDetails`)

2. **Wrong Function Used**: `sellerCartUtils.ts` was using `discountDetails` (JavaScript version from `cartCalculation.ts`) instead of `processDiscountDetails` (TypeScript version from `product-utils.ts`)

## Root Cause

In buyer-fe, the flow is:

1. Fetch discount data using `getProductDiscountsFetcher`
2. Apply discount data using `assign_pricelist_discounts_data_to_products` (sets `discountDetails`, `unitListPrice`, `discount`, `discountedPrice`, `unitPrice`)
3. Process discount details using `discountDetails()` (calculates `discountedPrice`, `unitPrice`, etc.)
4. Calculate cart using `cartCalculation()` with processed items

In the current implementation:

- `useMultipleSellerCart` does fetch discount data and apply it ✓
- But `calculateSellerCartPricing` was using the wrong `discountDetails` function ✗
- `CartPageClient` was calling `cartCalculation` directly on raw items, bypassing discount processing ✗

## Fixes Applied

### 1. Fixed `sellerCartUtils.ts`

- Changed from `discountDetails` (JS version) to `processDiscountDetails` (TS version)
- This ensures discount details are processed correctly before cart calculation

### 2. Updated `CartPageClient.tsx`

- Now uses `selectedSellerPricing` from `useSelectedSellerCart` which already includes:
  - Discount data fetching
  - Discount application
  - Discount processing
  - Cart calculation
- Falls back to direct calculation only if no selected seller pricing is available

## Verification Steps

1. **Check Discount Data Fetching**:
   - Verify `useMultipleSellerPricing` is fetching discount data
   - Check that `CartService.getDiscount()` is being called with correct parameters
   - Ensure discount data structure matches expected format

2. **Check Discount Application**:
   - Verify `assign_pricelist_discounts_data_to_products` is being called
   - Check that items have `discountDetails`, `unitListPrice`, `discount`, `discountedPrice` set
   - Ensure `showPrice` is set correctly

3. **Check Discount Processing**:
   - Verify `processDiscountDetails` is being called
   - Check that `discountedPrice` and `unitPrice` are calculated correctly
   - Ensure MOQ and packaging quantity are handled

4. **Check Cart Calculation**:
   - Verify `cartCalculation` receives processed items with discount data
   - Check that tax, discounts, and totals are calculated correctly
   - Ensure multi-seller pricing is handled correctly

## Testing Checklist

- [ ] Cart items show correct prices after discount
- [ ] Discount percentages are displayed correctly
- [ ] Cart totals (subtotal, tax, grand total) are correct
- [ ] Multi-seller cart calculations work correctly
- [ ] Single seller cart calculations work correctly
- [ ] Guest cart calculations work correctly
- [ ] Discount data is fetched from API correctly
- [ ] Discount data is applied to items correctly
- [ ] Volume discounts are calculated correctly
- [ ] Cash discounts are calculated correctly

## Files Modified

1. `src/utils/calculation/sellerCartUtils/sellerCartUtils.ts`
   - Changed `discountDetails` import to `processDiscountDetails`
   - Updated `calculateSellerCartPricing` to use `processDiscountDetails`

2. `src/app/[locale]/(app)/cart/components/CartPageClient.tsx`
   - Updated to use `selectedSellerPricing` from `useSelectedSellerCart`
   - Added fallback to direct calculation if needed

## Next Steps

1. Test with real cart data to verify discount calculations
2. Check API responses to ensure discount data structure matches
3. Verify that `assign_pricelist_discounts_data_to_products` is working correctly
4. Test edge cases (no discount, multiple discounts, volume discounts)
