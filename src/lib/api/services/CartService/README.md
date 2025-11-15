# CartService

Service for managing shopping cart operations.

## Overview

This service provides functionality to get cart information, count items, delete carts, and clear carts by seller.

## Class

### `CartService`

Extends `BaseService<CartService>` and uses `coreCommerceClient` for API calls.

## Methods

### `getCartCount`

Gets the count of items in a user's cart.

**Parameters:**

- `params`: `CartParams` object with:
  - `userId`: User ID (string)
  - `pos`: Position/index (number, optional, defaults to 0)

**Returns:** `Promise<CartCount>` - Cart count response

**Example:**

```typescript
import CartService from "@/lib/api/services/CartService/CartService";

const count = await CartService.getCartCount({
  userId: "123",
  pos: 0,
});
```

### `getCartCountServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `CartParams` object

**Returns:** `Promise<CartCount | null>`

### `getCart`

Gets the user's cart.

**Parameters:**

- `params`: `CartParams` object

**Returns:** `Promise<Cart>` - Cart object

**Example:**

```typescript
const cart = await CartService.getCart({
  userId: "123",
  pos: 0,
});
```

### `getCartServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `CartParams` object

**Returns:** `Promise<Cart | null>`

### `deleteCart`

Deletes the user's cart.

**Parameters:**

- `params`: `CartParams` object

**Returns:** `Promise<unknown>` - Delete response

**Example:**

```typescript
await CartService.deleteCart({
  userId: "123",
  pos: 0,
});
```

### `deleteCartServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `CartParams` object

**Returns:** `Promise<unknown | null>`

### `clearCartBySeller`

Clears cart items for a specific seller.

**Parameters:**

- `params`: `ClearCartBySellerParams` object with:
  - `userId`: User ID (string)
  - `sellerId`: Seller ID (string)

**Returns:** `Promise<unknown>` - Clear response

**Example:**

```typescript
await CartService.clearCartBySeller({
  userId: "123",
  sellerId: "456",
});
```

### `clearCartBySellerServerSide`

Server-side version that returns null on error.

**Parameters:**

- `params`: `ClearCartBySellerParams` object

**Returns:** `Promise<unknown | null>`

## API Endpoints

- **Get Cart Count**: `GET /carts/findCartsCountByUserId?userId={userId}&pos={pos}`
- **Get Cart**: `GET /carts?userId={userId}&find=ByUserId&pos={pos}`
- **Delete Cart**: `DELETE /carts?userId={userId}&find=ByUserId&pos={pos}`
- **Clear Cart by Seller**: `DELETE /carts/clearCartBySeller?userId={userId}&sellerId={sellerId}`

## Response Structures

```typescript
interface CartCount {
  count: number;
  userId: string;
}

interface Cart {
  id: string;
  userId: string;
}
```

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- `pos` parameter defaults to 0 if not provided
- Server-side methods use `callSafe` for error handling
- All methods support both client-side and server-side usage

## Testing

See `CartService.test.ts` for comprehensive test cases covering:

- All CRUD operations
- Default parameter handling
- Error handling
- Server-side error handling
- HTTP method verification

Mocks are available in `CartService.mocks.ts`.

## Folder Structure

```
services/
  CartService/
    CartService.ts
    CartService.test.ts
    CartService.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `coreCommerceClient`: Default API client

## Related

- Base: `BaseService` - Base service implementation
- Client: `coreCommerceClient` - Core commerce API client
