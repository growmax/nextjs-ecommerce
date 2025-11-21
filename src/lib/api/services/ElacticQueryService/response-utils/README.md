# OpenSearch Response Utilities

Utility functions for parsing and formatting OpenSearch API responses.

## Functions

### `extractSearchHits<T>(response: unknown): T[] | null`

Extracts product documents from OpenSearch response.

### `extractSearchTotal(response: unknown): number`

Extracts total count from OpenSearch response.

### `formatProductSearchResponse(response: unknown): ProductSearchResponse`

Formats raw response into standardized structure.

### `createErrorSearchResponse(): ProductSearchResponse`

Creates error response structure.

## Usage

```typescript
import { formatProductSearchResponse } from "./response-utils";

const formatted = formatProductSearchResponse(rawResponse);
```

## Testing

Run tests: `npm test response-utils.test.ts`
