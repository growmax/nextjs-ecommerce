# useQuoteSubmission Hook

Custom React hook for submitting quotes as new versions. Handles submission process, loading state, and error handling.

## API

### `useQuoteSubmission()`

Returns:

- `submitQuote(request: QuoteSubmissionRequest): Promise<boolean>`: Submits a quote and returns success status.
- `isSubmitting: boolean`: Indicates if submission is in progress.
- `error: string | null`: Error message if submission fails.

#### `QuoteSubmissionRequest` shape

```
{
  body: object;
  quoteId: string;
  userId: number | string;
  companyId: number | string;
}
```

## Usage Example

```tsx
import { useQuoteSubmission } from "./useQuoteSubmission";

const { submitQuote, isSubmitting, error } = useQuoteSubmission();

const handleSubmit = async () => {
  const request = {
    body: {
      /* quote data */
    },
    quoteId: "123",
    userId: "user-1",
    companyId: "company-1",
  };
  await submitQuote(request);
};
```

## Testing

See `useQuoteSubmission.test.ts` for test cases covering:

- Successful submission
- Failed submission
- Error handling

## Mocks

See `useQuoteSubmission.mocks.ts` for mock objects and services used in tests.
