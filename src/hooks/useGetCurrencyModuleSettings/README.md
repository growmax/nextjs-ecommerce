# useGetCurrencyModuleSettings

A React hook that fetches and manages currency module settings for orders and quotes based on user and company context.

## Purpose

This hook retrieves minimum order and quote values based on currency settings from the backend. It uses React Query for efficient data fetching and caching.

## Usage

```tsx
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings";

function MyComponent() {
  const { minimumOrderValue, minimumQuoteValue } = useGetCurrencyModuleSettings(
    user,
    shouldFetch,
    buyerCurrency
  );

  return (
    <div>
      <p>Minimum Order Value: {minimumOrderValue}</p>
      <p>Minimum Quote Value: {minimumQuoteValue}</p>
    </div>
  );
}
```

## Parameters

- `user: User` - User object containing userId, companyId, and currency information
- `condition: unknown` - Boolean-like condition to enable/disable the query
- `buyerCurrency: BuyerCurrency` - Buyer's currency information (falls back to user currency if not provided)

## Return Value

Returns an object with:

- `minimumOrderValue: string | undefined` - Minimum order value for the current currency
- `minimumQuoteValue: string | undefined` - Minimum quote value for the current currency

## Features

- **Query Caching**: Caches results for 60 seconds using React Query
- **Currency Fallback**: Uses buyer currency if available, otherwise falls back to user currency
- **Conditional Fetching**: Only fetches when userId, companyId, and condition are truthy
- **Error Handling**: Throws error if required parameters are missing
- **Type Safety**: Fully typed with TypeScript interfaces

## Dependencies

- `@tanstack/react-query` - For data fetching and caching
- `lodash/find` - For finding currency values by code
- `@/lib/api/CartServices` - Backend API service

## Testing

See `useGetCurrencyModuleSettings.test.ts` for comprehensive test coverage including:

- Successful data fetching
- Empty data handling
- Conditional fetching
- Currency fallback logic
- Missing parameters handling
