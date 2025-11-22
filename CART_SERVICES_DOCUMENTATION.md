# Cart Services Documentation

## Service Overview

The cart functionality uses **CartServices.ts** (`src/lib/api/CartServices.ts`) as the primary service for all cart operations. This service makes direct calls to the backend API (bypassing Next.js API routes).

## Service Comparison

### CartServices.ts (Primary - Currently Used)

**Location:** `src/lib/api/CartServices.ts`

**Methods:**

- `getCart()` - Get user's cart
- `postCart()` - Add/Update item (POST/PUT)
- `deleteCart()` - Delete single item
- `emptyCart()` - Empty entire cart
- `addMultipleItems()` - Add multiple items at once
- `clearCartBySeller()` - Clear items by seller
- `geBilling()` - Get billing information
- `getModule()` - Get module settings
- `getShipping()` - Get shipping information
- `getCurrencyModuleSettings()` - Get currency module settings
- `getAllSellerPrice()` - Get all seller prices
- `getDiscount()` - Get product discounts

**Usage:** Used throughout the application for cart operations, including:

- `src/hooks/useCart.ts` - Main cart hook
- `src/contexts/CartContext.tsx` - Cart context
- `src/components/product/AddToCartSection.tsx` - Add to cart component
- `src/components/product/MobileCartAction.tsx` - Mobile cart actions
- Various other hooks and components

**Backend Calls:** Direct calls to `coreCommerceClient` and `discountClient`

### CartService.ts (Alternative - Not Used for Cart Operations)

**Location:** `src/lib/api/services/CartService/CartService.ts`

**Methods:**

- `getCart()` - Get user's cart
- `getCartCount()` - Get cart count
- `deleteCart()` - Delete entire cart (not single item)
- `clearCartBySeller()` - Clear items by seller

**Usage:** This is a simplified service that appears to be an alternative implementation but is **NOT currently used** for cart update/delete operations. It lacks methods for:

- Adding items (`postCart`)
- Updating item quantities
- Deleting single items (only has delete entire cart)

**Note:** This service may be intended for server-side operations or future use, but the main cart operations use `CartServices.ts`.

## Update and Delete Functionality

### Update Item Quantity

**Implementation:**

- **Hook:** `useCart().changeQty()` in `src/hooks/useCart.ts`
- **Service:** `CartServices.postCart()` with method "PUT"
- **Endpoint:** `PUT /carts?userId={userId}&pos=0`
- **Component:** `CartProductCard.handleQuantityChange()`

**Flow:**

1. User changes quantity in `CartProductCard`
2. `handleQuantityChange()` calls `changeQty()` from `useCart` hook
3. `changeQty()` validates quantity (MOQ, packaging quantity)
4. For logged-in users: Calls `CartServices.postCart()` with method "PUT"
5. For guest users: Updates localStorage
6. Refreshes cart after update
7. Shows toast notification

**Multi-Seller Support:**

- Matches items by `productId + sellerId` for multi-seller carts
- Falls back to `productId + itemNo` for single-seller carts
- Preserves seller information during updates

### Delete Item

**Implementation:**

- **Hook:** `useCart().DeleteCart()` in `src/hooks/useCart.ts`
- **Service:** `CartServices.deleteCart()`
- **Endpoint:** `DELETE /carts/{userId}?productsId={productId}&itemNo={itemNo}&pos=0`
- **Component:** `CartProductCard.handleDelete()`

**Flow:**

1. User clicks delete button in `CartProductCard`
2. `handleDelete()` calls `DeleteCart()` from `useCart` hook
3. For logged-in users: Calls `CartServices.deleteCart()`
4. For guest users: Removes from localStorage
5. Updates local cart state
6. Refreshes cart after delete
7. Shows toast notification

**Multi-Seller Support:**

- Matches items by `productId + sellerId` for multi-seller carts
- Falls back to `productId + itemNo` for single-seller carts
- **Note:** Backend endpoint only uses `productsId + itemNo` (no sellerId in URL), but itemNo should be unique per cart item

## API Routes Decision

**Current Approach:** Direct backend calls via `CartServices.ts`

**Decision:** API routes are **NOT needed** for cart operations.

**Rationale:**

1. **Auth Handling:** The `coreCommerceClient` automatically handles auth tokens via axios interceptors (from cookies)
2. **Tenant Headers:** Automatically injected from JWT token via axios interceptors
3. **Error Handling:** Axios interceptors handle token refresh and error transformation
4. **Simplicity:** Fewer layers, direct communication with backend
5. **Consistency:** Matches pattern used in other services
6. **Performance:** Direct calls are more performant (one less hop)

**buyer-fe Approach:** Uses Next.js API routes as proxy

**Why Not Used Here:**

- The axios client already handles all the concerns that API routes would address:
  - Auth token injection (from cookies)
  - Tenant header injection (from JWT)
  - Error handling and retry logic
  - Token refresh on 401 errors
  - Request/response transformation
- Direct calls are simpler and more performant
- No need to hide backend URL (it's already in environment variables)
- The client is configured to work with CORS and credentials properly

**If API Routes Needed in Future (e.g., for server-side rendering or additional security):**

- Create `src/app/api/cart/postcart/route.ts` for POST/PUT/DELETE
- Create `src/app/api/cart/getcart/route.ts` for GET
- Create `src/app/api/cart/emptycart/route.ts` for empty cart
- Create `src/app/api/cart/clearCartBySeller/route.ts` for clear by seller
- Update `CartServices.ts` to use API routes instead of direct calls
- Ensure API routes handle auth tokens from cookies and pass them to backend

## Multi-Seller Cart Support

### Update Operations

- `changeQty()` accepts `sellerId` parameter
- Matches cart items by `productId + sellerId` when sellerId is provided
- Falls back to `productId + itemNo` for backward compatibility
- Preserves seller information (`sellerId`, `sellerName`, `sellerLocation`) during updates

### Delete Operations

- `DeleteCart()` accepts `sellerId` parameter
- Matches cart items by `productId + sellerId` when sellerId is provided
- Falls back to `productId + itemNo` for backward compatibility
- **Backend Limitation:** Backend DELETE endpoint only uses `productsId + itemNo`, but `itemNo` should be unique per cart item, so this works correctly

### Components

- `CartPageClient` handles both single-seller and multi-seller carts
- `MultipleSellerCards` component displays items grouped by seller
- `CartProductCard` works with both single and multi-seller items

## Error Handling

### Current Implementation

- **Toast Notifications:** Success/error messages via `sonner` toast
- **Error Callbacks:** `setErrorMessage` callback for validation errors
- **Loading States:** `isCartLoading` and `updatingItems` Set for UI feedback
- **Try-Catch:** All API calls wrapped in try-catch blocks

### Error Types

1. **Validation Errors:** Quantity validation (MOQ, packaging quantity) - shown via `setErrorMessage`
2. **API Errors:** Network/backend errors - shown via toast.error()
3. **Guest Cart Errors:** localStorage errors - handled gracefully

### Enhancements Made

- All error cases are handled
- User-friendly error messages
- Loading states don't block UI unnecessarily
- Error messages display in `CartProductCard` component

## Testing Checklist

### Update Functionality

- ✅ Update quantity for single-seller cart item
- ✅ Update quantity for multi-seller cart item
- ✅ Update quantity for guest cart (localStorage)
- ✅ Validate MOQ and packaging quantity constraints
- ✅ Error handling for invalid quantities
- ✅ Loading states during update
- ✅ Cart refresh after update

### Delete Functionality

- ✅ Delete item from single-seller cart
- ✅ Delete item from multi-seller cart
- ✅ Delete item from guest cart (localStorage)
- ✅ Correct item identification (productId + itemNo + sellerId)
- ✅ Error handling for delete failures
- ✅ Loading states during delete
- ✅ Cart refresh after delete
- ✅ UI updates correctly (item removed from display)

### Integration

- ✅ CartPageClient update/delete handlers work
- ✅ CartProductCard update/delete buttons work
- ✅ MultipleSellerCards update/delete handlers work
- ✅ Cart price details update after changes
- ✅ Cart count updates correctly

## Backend Endpoints

### Get Cart

- `GET /carts?userId={userId}&find=ByUserId&pos=0`

### Add Item

- `POST /carts?userId={userId}&pos=0`

### Update Item

- `PUT /carts?userId={userId}&pos=0`

### Delete Item

- `DELETE /carts/{userId}?productsId={productId}&itemNo={itemNo}&pos=0`

### Empty Cart

- `DELETE /carts?userId={userId}&find=ByUserId&pos=0`

### Clear by Seller

- `DELETE /carts/clearCartBySeller?userId={userId}&sellerId={sellerId}`

### Add Multiple Items

- `POST /carts/addMultipleProducts?userId={userId}&pos=0`

## Files Reference

### Core Files

- `src/lib/api/CartServices.ts` - Main cart service
- `src/hooks/useCart.ts` - Cart hook with update/delete functions
- `src/components/cart/CartProductCard.tsx` - Product card component
- `src/app/[locale]/(app)/cart/components/CartPageClient.tsx` - Cart page
- `src/components/cart/MultipleSellerCards.tsx` - Multi-seller display

### Context

- `src/contexts/CartContext.tsx` - Cart context provider

### Types

- `src/types/calculation/cart.ts` - Cart item types
