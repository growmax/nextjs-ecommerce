# date-format

Utility functions for formatting dates with timezone support, validation, and multiple output formats.

## Overview

This module provides date formatting utilities that handle various input types (Date objects, strings, timestamps), validate inputs using Zod schemas, support timezone conversions, and format dates in multiple formats including local, ISO, and custom formats.

## Functions

### `dateWithTimeFormat(input: DateInput): string`

Formats a date with time in the format `dd/MM/yyyy, hh:mm a`.

**Parameters:**

- `input`: Date object, string, or number (timestamp)

**Returns:** Formatted date string (e.g., "15/01/2024, 10:30 AM")

**Throws:** Error if input is not a valid date

**Example:**

```typescript
import { dateWithTimeFormat } from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");
const formatted = dateWithTimeFormat(date);
// Returns: "15/01/2024, 10:30 AM"
```

### `dateLocalFormat(input: DateInput): string`

Formats a date in local format `dd/MM/yyyy` without time.

**Parameters:**

- `input`: Date object, string, or number (timestamp)

**Returns:** Formatted date string (e.g., "15/01/2024")

**Throws:** Error if input is not a valid date

**Example:**

```typescript
import { dateLocalFormat } from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");
const formatted = dateLocalFormat(date);
// Returns: "15/01/2024"
```

### `dateISOFormat(input: DateInput): string | undefined`

Formats a date in ISO format without milliseconds and timezone offset.

**Parameters:**

- `input`: Date object, string, or number (timestamp)

**Returns:** ISO formatted date string (e.g., "2024-01-15T10:30:00") or `undefined` if invalid

**Example:**

```typescript
import { dateISOFormat } from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");
const formatted = dateISOFormat(date);
// Returns: "2024-01-15T10:30:00"
```

### `zoneDateTimeCalculator(...): string | undefined`

Formats a date with timezone conversion and customizable date/time formats.

**Parameters:**

- `date`: Date object, string, number, `null`, or `undefined`
- `timeZone`: Timezone string (default: "Asia/Kolkata")
- `dateFormat`: Date format string (default: "dd/MM/yyyy")
- `timeFormat`: Time format string (default: "hh:mm a")
- `includeTime`: Boolean to include time in output (default: false)

**Returns:** Formatted date string or `undefined` if date is null/undefined

**Throws:** Error if date is invalid or formats are empty strings

**Example:**

```typescript
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";

// Date only
const dateOnly = zoneDateTimeCalculator(new Date("2024-01-15T10:30:00Z"));
// Returns: "15/01/2024"

// Date with time
const withTime = zoneDateTimeCalculator(
  new Date("2024-01-15T10:30:00Z"),
  "Asia/Kolkata",
  "dd/MM/yyyy",
  "hh:mm a",
  true
);
// Returns: "15/01/2024 10:30 AM"

// Custom timezone
const nyTime = zoneDateTimeCalculator(
  new Date("2024-01-15T10:30:00Z"),
  "America/New_York"
);
// Returns date in New York timezone
```

## Input Types

All functions accept the following input types (except `zoneDateTimeCalculator` which also accepts `null`/`undefined`):

- **Date object**: `new Date("2024-01-15")`
- **String**: `"2024-01-15T10:30:00Z"` or `"2024-01-15"`
- **Number**: Timestamp in milliseconds (e.g., `1705315800000`)

## Validation

All functions use Zod schemas to validate inputs:

- **dateInputSchema**: Validates that the input can be converted to a valid Date
- **timeZoneSchema**: Validates timezone string (defaults to "Asia/Kolkata")
- **formatSchema**: Validates format strings (must be non-empty)

Invalid inputs will throw errors (except `dateISOFormat` which returns `undefined`).

## Error Handling

### `dateWithTimeFormat` and `dateLocalFormat`

- Throw `Error` with descriptive message for invalid dates
- Use Zod validation which throws `ZodError` for invalid input types

### `dateISOFormat`

- Returns `undefined` for invalid dates (does not throw)
- Uses Zod validation which throws `ZodError` for invalid input types

### `zoneDateTimeCalculator`

- Returns `undefined` if date is `null` or `undefined`
- Throws `Error` for invalid dates or empty format strings
- Uses Zod validation which throws `ZodError` for invalid input types

## Examples

### Basic Date Formatting

```typescript
import {
  dateWithTimeFormat,
  dateLocalFormat,
  dateISOFormat,
} from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");

// With time
const withTime = dateWithTimeFormat(date);
// "15/01/2024, 10:30 AM"

// Local format
const local = dateLocalFormat(date);
// "15/01/2024"

// ISO format
const iso = dateISOFormat(date);
// "2024-01-15T10:30:00"
```

### Timezone Conversion

```typescript
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");

// Default (Asia/Kolkata)
const kolkata = zoneDateTimeCalculator(date);
// "15/01/2024"

// New York timezone
const ny = zoneDateTimeCalculator(date, "America/New_York");
// Date converted to NY timezone

// With time
const withTime = zoneDateTimeCalculator(
  date,
  "Asia/Kolkata",
  "dd/MM/yyyy",
  "hh:mm a",
  true
);
// "15/01/2024 10:30 AM"
```

### Custom Formats

```typescript
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";

const date = new Date("2024-01-15T10:30:00Z");

// US date format
const usFormat = zoneDateTimeCalculator(date, "America/New_York", "MM/dd/yyyy");
// "01/15/2024"

// Long format
const longFormat = zoneDateTimeCalculator(
  date,
  "Asia/Kolkata",
  "dd MMMM yyyy",
  "hh:mm a",
  true
);
// "15 January 2024 10:30 AM"
```

### Handling Different Input Types

```typescript
import { dateLocalFormat } from "@/utils/date-format/date-format";

// Date object
const fromDate = dateLocalFormat(new Date("2024-01-15"));
// "15/01/2024"

// String
const fromString = dateLocalFormat("2024-01-15T10:30:00Z");
// "15/01/2024"

// Timestamp
const fromTimestamp = dateLocalFormat(1705315800000);
// "15/01/2024"
```

### Error Handling

```typescript
import {
  dateWithTimeFormat,
  dateISOFormat,
} from "@/utils/date-format/date-format";

// Throws error
try {
  dateWithTimeFormat("invalid-date");
} catch (error) {
  console.error("Invalid date:", error);
}

// Returns undefined
const result = dateISOFormat("invalid-date");
if (!result) {
  console.log("Date is invalid");
}
```

## Dependencies

- **zod**: For input validation and type inference
- **date-fns**: For date formatting (`format`, `isValid`)
- **date-fns-tz**: For timezone conversion (`toZonedTime`)

## Format Patterns

The functions use `date-fns` format patterns:

- `dd`: Day of month (01-31)
- `MM`: Month (01-12)
- `yyyy`: Full year (e.g., 2024)
- `hh`: Hour in 12-hour format (01-12)
- `mm`: Minutes (00-59)
- `a`: AM/PM marker
- `HH`: Hour in 24-hour format (00-23)
- `MMMM`: Full month name (January, February, etc.)

See [date-fns format documentation](https://date-fns.org/docs/format) for more patterns.

## Notes

- **Timezone Handling**: `zoneDateTimeCalculator` uses `date-fns-tz` to convert dates to specified timezones. The default timezone is "Asia/Kolkata".

- **Input Validation**: All functions validate inputs using Zod schemas. Invalid inputs will throw errors (except `dateISOFormat`).

- **ISO Format**: `dateISOFormat` removes milliseconds and timezone offset, returning a simplified ISO string format.

- **Null/Undefined Handling**: Only `zoneDateTimeCalculator` accepts `null` or `undefined` and returns `undefined` in those cases. Other functions will throw errors.

- **Default Values**: `zoneDateTimeCalculator` has default values for all optional parameters except `date`.

- **Format Validation**: Format strings must be non-empty. Empty strings will cause validation errors.

## Testing

See `date-format.test.ts` for comprehensive test cases covering:

- All input types (Date, string, number)
- All formatting functions
- Timezone conversions
- Custom formats
- Error handling
- Edge cases (midnight, end of day, leap year, year boundary)
- Invalid input handling

Mocks are available in `date-format.mocks.ts`.

## Folder Structure

```
utils/
  date-format/
    date-format.ts
    date-format.test.ts
    date-format.mocks.ts
    README.md
```

## Related

- Library: [date-fns](https://date-fns.org/)
- Library: [date-fns-tz](https://github.com/marnusw/date-fns-tz)
- Library: [zod](https://zod.dev/)
