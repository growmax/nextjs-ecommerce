# payment

Utility function for calculating and formatting payment due dates from payment due data.

## Overview

This module provides a function to extract and format the last date to pay from payment due data, handling both invoice and order due breakups, checking for overdue status, and formatting dates according to user preferences.

## Functions

### `getLastDateToPay`

Gets the last date to pay from payment due data and formats it according to user preferences.

**Parameters:**

- `paymentDueData`: Array of `PaymentDueDataItem` objects
- `preferences`: `UserPreferences` object with timezone, date format, and time format

**Returns:** Formatted date string or status message

**Example:**

```typescript
import { getLastDateToPay } from "@/utils/details/orderdetails/payment/payment";

const result = getLastDateToPay(paymentDueData, {
  timeZone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
});
// Returns: "31/12/2024, 12:00 AM" or "Overdue by 5 days" or "- No due"
```

## Key Features

### Breakup Selection

The function selects the appropriate breakup array:

- **Invoice Due Breakup**: Used when `invoiceIdentifier` exists
- **Order Due Breakup**: Used when `invoiceIdentifier` is not present

### Overdue Detection

The function checks if the due date is in the past:

- If overdue: Returns `"Overdue by X day(s)"` message
- If not overdue: Formats the date using user preferences

### Date Formatting

Uses `zoneDateTimeCalculator` to format dates:

- Applies user's timezone
- Uses user's date format preference
- Uses user's time format preference (12h/24h)

### Edge Cases

Handles various edge cases:

- Empty payment due data → `"- No due"`
- Missing first item → `"- No due"`
- No breakup array → `"- No due"`
- Empty breakup array → `"- No due"`
- Missing due date → `"-"`
- Empty formatted date → `"-"`

## Examples

### Basic Usage

```typescript
const paymentDueData = [
  {
    orderDueBreakup: [
      {
        dueDate: "2024-12-31T00:00:00Z",
        amount: 1000,
      },
    ],
  },
];

const preferences = {
  timeZone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
};

const result = getLastDateToPay(paymentDueData, preferences);
// Returns: "31/12/2024, 12:00 AM"
```

### Invoice Due Breakup

```typescript
const paymentDueData = [
  {
    invoiceIdentifier: "INV-001",
    invoiceDueBreakup: [
      {
        dueDate: "2024-12-31T00:00:00Z",
        amount: 1000,
      },
    ],
  },
];

const result = getLastDateToPay(paymentDueData, preferences);
// Uses invoiceDueBreakup instead of orderDueBreakup
```

### Overdue Payment

```typescript
const paymentDueData = [
  {
    orderDueBreakup: [
      {
        dueDate: "2024-01-01T00:00:00Z", // Past date
        amount: 1000,
      },
    ],
  },
];

const result = getLastDateToPay(paymentDueData, preferences);
// Returns: "Overdue by 365 days" (or appropriate number)
```

### Singular vs Plural Days

```typescript
// 1 day overdue
const result1 = getLastDateToPay(oneDayOverdue, preferences);
// Returns: "Overdue by 1 day"

// Multiple days overdue
const result2 = getLastDateToPay(multipleDaysOverdue, preferences);
// Returns: "Overdue by 5 days"
```

### Edge Cases

```typescript
// Empty data
getLastDateToPay([], preferences);
// Returns: "- No due"

// No breakup
getLastDateToPay([{}], preferences);
// Returns: "- No due"

// Missing due date
getLastDateToPay([{ orderDueBreakup: [{ amount: 1000 }] }], preferences);
// Returns: "-"
```

## Return Value

The function returns a string with one of the following formats:

- **Formatted Date**: `"31/12/2024, 12:00 AM"` (when date is valid and not overdue)
- **Overdue Message**: `"Overdue by X day"` or `"Overdue by X days"` (when date is in the past)
- **No Due**: `"- No due"` (when no payment due data exists)
- **Dash**: `"-"` (when due date is missing or formatting fails)

## Algorithm Details

### Processing Flow

1. **Check Empty Data**: Return `"- No due"` if array is empty
2. **Get First Item**: Extract first item from payment due data
3. **Select Breakup**: Choose `invoiceDueBreakup` or `orderDueBreakup` based on `invoiceIdentifier`
4. **Check Breakup**: Return `"- No due"` if breakup is missing or empty
5. **Get Due Date**: Extract `dueDate` from first breakup item
6. **Check Due Date**: Return `"-"` if due date is missing
7. **Check Overdue**: Compare due date with current date
8. **Format or Overdue**: Format date if not overdue, or return overdue message
9. **Return Result**: Return formatted string or fallback to `"-"`

### Overdue Calculation

```typescript
const isDue = isAfter(new Date(), dueDateObj);
if (isDue) {
  const daysOverdue = differenceInDays(new Date(), dueDateObj);
  return `Overdue by ${daysOverdue} ${daysOverdue > 1 ? "days" : "day"}`;
}
```

### Date Formatting

```typescript
const formattedDate = zoneDateTimeCalculator(
  dueDate,
  preferences.timeZone,
  preferences.dateFormat,
  preferences.timeFormat,
  true
);
```

## Notes

- **Breakup Priority**: Invoice due breakup takes priority over order due breakup
- **First Item Only**: Only processes the first item in the payment due data array
- **First Breakup Only**: Only uses the first item in the breakup array
- **Overdue Detection**: Uses `date-fns` `isAfter` to check if date is in the past
- **Day Calculation**: Uses `date-fns` `differenceInDays` to calculate overdue days
- **Pluralization**: Automatically handles singular/plural for "day" vs "days"
- **Timezone Handling**: Formats dates according to user's timezone preference
- **Fallback Values**: Returns `"-"` when formatting fails or date is missing

## Testing

See `payment.test.ts` for comprehensive test cases covering:

- Empty and missing data handling
- Breakup selection (invoice vs order)
- Overdue detection and messaging
- Date formatting with different preferences
- Edge cases (missing dates, empty arrays, etc.)
- Singular vs plural day messages

Mocks are available in `payment.mocks.ts`.

## Folder Structure

```
utils/
  details/
    orderdetails/
      payment/
        payment.ts
        payment.test.ts
        payment.mocks.ts
        README.md
```

## Dependencies

- `date-fns`: `differenceInDays`, `isAfter` for date calculations
- `@/utils/date-format/date-format`: `zoneDateTimeCalculator` for date formatting
- `@/lib/api`: `PaymentDueDataItem` type
- `@/types/details/orderdetails/version.types`: `UserPreferences` type

## Related

- Utility: `status` - Order status utilities
- Utility: `date-format` - Date formatting utilities
- Component: `OrderDetailsClient` - Uses this utility for payment display
- Component: `QuoteDetailsClient` - Uses this utility for payment display
