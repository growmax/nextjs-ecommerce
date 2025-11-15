# status

Utility functions for order status styling and status checks.

## Overview

This module provides utilities for handling order status display and validation:

- Status badge styling based on order status
- Order cancellation check
- Edit in progress check

## Functions

### `getStatusStyle`

Returns Tailwind CSS classes for styling status badges based on order status.

**Parameters:**

- `status`: Order status string (optional)

**Returns:** String with Tailwind CSS classes

**Example:**

```typescript
import { getStatusStyle } from "@/utils/details/orderdetails/status/status";

const style = getStatusStyle("COMPLETED");
// Returns: "bg-green-100 text-green-700 border-green-200"
```

### `isOrderCancelled`

Checks if an order is cancelled.

**Parameters:**

- `status`: Order status string (optional)

**Returns:** Boolean indicating if order is cancelled

**Example:**

```typescript
import { isOrderCancelled } from "@/utils/details/orderdetails/status/status";

const isCancelled = isOrderCancelled("CANCELLED");
// Returns: true
```

### `isEditInProgress`

Checks if edit is in progress for an order.

**Parameters:**

- `status`: Order status string (optional)

**Returns:** Boolean indicating if edit is in progress

**Example:**

```typescript
import { isEditInProgress } from "@/utils/details/orderdetails/status/status";

const isEditing = isEditInProgress("EDIT IN PROGRESS");
// Returns: true
```

## Status Styles

### Blue (Acknowledged)

- `ORDER ACKNOWLEDGED`
- `ACKNOWLEDGED`
- Style: `bg-blue-100 text-blue-700 border-blue-200`

### Orange (In Progress)

- `IN PROGRESS`
- `PROCESSING`
- Style: `bg-orange-100 text-orange-700 border-orange-200`

### Green (Completed)

- `COMPLETED`
- `DELIVERED`
- Style: `bg-green-100 text-green-700 border-green-200`

### Red (Cancelled)

- `CANCELLED`
- Style: `bg-red-100 text-red-700 border-red-200`

### Gray (Default)

- Any other status or undefined
- Style: `bg-gray-100 text-gray-700 border-gray-200`

## Examples

### Status Styling

```typescript
// Acknowledged status
const style1 = getStatusStyle("ORDER ACKNOWLEDGED");
// "bg-blue-100 text-blue-700 border-blue-200"

// In progress status
const style2 = getStatusStyle("IN PROGRESS");
// "bg-orange-100 text-orange-700 border-orange-200"

// Completed status
const style3 = getStatusStyle("COMPLETED");
// "bg-green-100 text-green-700 border-green-200"

// Cancelled status
const style4 = getStatusStyle("CANCELLED");
// "bg-red-100 text-red-700 border-red-200"

// Unknown status
const style5 = getStatusStyle("UNKNOWN");
// "bg-gray-100 text-gray-700 border-gray-200"
```

### Status Checks

```typescript
// Check if cancelled
const cancelled1 = isOrderCancelled("CANCELLED"); // true
const cancelled2 = isOrderCancelled("ORDER CANCELLED"); // true
const cancelled3 = isOrderCancelled("COMPLETED"); // false

// Check if edit in progress
const editing1 = isEditInProgress("EDIT IN PROGRESS"); // true
const editing2 = isEditInProgress("COMPLETED"); // false
```

### Case Insensitivity

All functions are case-insensitive:

```typescript
getStatusStyle("completed"); // Same as "COMPLETED"
getStatusStyle("In Progress"); // Same as "IN PROGRESS"
isOrderCancelled("cancelled"); // true
isEditInProgress("edit in progress"); // true
```

## Notes

- **Case Insensitive**: All status comparisons are case-insensitive (converted to uppercase)
- **Default Style**: Unknown or undefined statuses return gray styling
- **Cancellation Check**: Returns `false` for undefined/null/empty status
- **Edit Check**: Returns `false` for undefined/null/empty status
- **Status Matching**: Exact match required for `isEditInProgress` (not partial)

## Testing

See `status.test.ts` for comprehensive test cases covering:

- All status style mappings
- Case insensitivity
- Edge cases (undefined, null, empty)
- Status check functions
- Partial matches

Mocks are available in `status.mocks.ts`.

## Folder Structure

```
utils/
  details/
    orderdetails/
      status/
        status.ts
        status.test.ts
        status.mocks.ts
        README.md
```

## Dependencies

None (pure utility functions)

## Related

- Utility: `payment` - Payment due date utilities
- Component: Order details components use these utilities for status display
