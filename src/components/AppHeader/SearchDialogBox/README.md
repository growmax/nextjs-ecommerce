# SearchDialogBox Component

## Overview

`SearchDialogBox` is a client-side search dialog component integrated into the application header. It provides real-time product search with debouncing, request cancellation, and image fallback support.

## Purpose

- Enable global product search across the e-commerce catalog
- Display search suggestions and recent searches
- Render real-time search results with product information
- Optimize network requests with debouncing and AbortController
- Handle image loading failures gracefully with fallback images

## Component Props

```typescript
interface SearchDialogBoxProps {
  open: boolean; // Controls dialog visibility
  setOpen: (open: boolean) => void; // Callback to toggle dialog state
  elasticIndex: string; // OpenSearch index name (e.g., 'products_v3')
  suggestionItems: SuggestionItem[]; // Pre-populated suggestion items (recent searches, categories)
  handleSelect: (item: SuggestionItem) => void; // Callback when user selects a suggestion
  setSearchValue: (value: string) => void; // Callback to update parent search state
}

interface SuggestionItem {
  key: string; // Unique identifier
  label: string; // Display label
  icon?: string; // Icon/emoji for visual representation
  href?: string; // Link destination
}
```

## State Management

The component manages internal state for:

- **searchTerm**: Current search input value
- **searchResults**: Array of product results from API
- **isLoading**: Loading indicator state during API calls
- **searchAbortController**: AbortController instance for canceling in-flight requests

## Key Features

### 1. Debounced Search (300ms)

Search requests are debounced to prevent excessive API calls:

```typescript
// When user types:
// - First keystroke: debounce timer starts
// - User continues typing within 300ms: timer resets
// - 300ms of inactivity: API request fires
```

**Benefit**: Reduces server load and improves user experience.

### 2. Request Cancellation (AbortController)

Each new search cancels the previous request:

```typescript
// Previous request with AbortController
// New request arrives
// --> Previous request is aborted (fetch throws AbortError)
// --> Only new request completes
```

**Benefit**: Prevents race conditions where slow requests arrive out-of-order.

### 3. State Cleanup

When the dialog closes:

- All in-flight requests are aborted
- Search term is cleared
- Results are reset

**Benefit**: Prevents memory leaks and state pollution.

### 4. Image Fallback Support

Uses `ImageWithFallback` component which:

- Attempts to load the product thumbnail
- Falls back to placeholder on error
- Prevents broken image icons in UI

```typescript
<ImageWithFallback
  src={product.thumbnailUrl}
  alt={product.productShortDescription}
  fallbackSrc="/asset/fallback-image.png"
/>
```

## API Integration

### Search Endpoint

**URL**: `/api/search`  
**Method**: `GET`  
**Query Parameters**:

- `term` (string): Search query
- `index` (string): OpenSearch index name

### Request Example

```typescript
fetch(`/api/search?term=${encodeURIComponent("O+RING")}&index=products_v3`, {
  signal: abortController.signal,
  method: "GET",
});
```

### Response Format

```typescript
{
  hits: {
    total: { value: number },
    hits: [
      {
        _source: {
          productShortDescription: string;
          thumbnailUrl: string;
          productUrl: string;
          brandsName: string;
          isPublished: boolean;
        }
      }
    ]
  }
}
```

## Search Results Rendering

Results display in a Command-style interface with:

- **Product Thumbnail**: Image with fallback support
- **Brand Name**: Left-aligned brand information
- **Product Description**: Short product name/description
- **Click Handler**: Routes to product page via `handleSelect`

### Result Item Structure

```typescript
<div className="flex items-center gap-3 p-2">
  <ImageWithFallback src={thumbnailUrl} alt={description} />
  <div className="flex flex-col">
    <span className="text-sm font-medium">{brandsName}</span>
    <span className="text-xs text-gray-500">{productShortDescription}</span>
  </div>
</div>
```

## Keyboard Interactions

| Key            | Action                               |
| -------------- | ------------------------------------ |
| `Escape`       | Close dialog                         |
| `Enter`        | Select highlighted suggestion/result |
| `ArrowUp/Down` | Navigate results                     |

## Error Handling

The component gracefully handles:

1. **API Errors**: Silently fails, maintains UI
2. **Network Timeouts**: AbortError is caught and logged
3. **Empty Results**: Shows empty state without crashing
4. **Image Load Failures**: Falls back to placeholder

## Usage Example

```typescript
import SearchDialogBox from '@/components/AppHeader/SearchDialogBox/SearchDialogBox';

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const suggestionItems = [
    { key: 'recent-1', label: 'Recent: Bearing', icon: '🕐' },
    { key: 'category-1', label: 'Category: Tools', icon: '📁' },
  ];

  const handleSelect = (item) => {
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <SearchDialogBox
      open={searchOpen}
      setOpen={setSearchOpen}
      elasticIndex="products_v3"
      suggestionItems={suggestionItems}
      handleSelect={handleSelect}
      setSearchValue={setSearchValue}
    />
  );
}
```

## Performance Optimization

### Debounce Timing

- **300ms**: Optimal balance between responsiveness and server load
- Adjustable via `DEBOUNCE_DELAY` constant in component

### Request Cancellation

Prevents:

- Multiple simultaneous requests
- Results arriving out-of-order
- Unnecessary processing of stale data

### Component Lazy Loading

The component should be wrapped with `Suspense` or lazy-loaded:

```typescript
const SearchDialogBox = lazy(() => import("./SearchDialogBox"));
```

## Testing

### Mock Data

See `SearchDialogBox.mocks.ts` for:

- Mock suggestion items
- Mock search results
- Mock API responses

### Test Coverage

Tests in `SearchDialogBox.test.ts` cover:

- ✅ Component rendering (open/closed states)
- ✅ Search debouncing (300ms delay)
- ✅ Request cancellation (AbortController)
- ✅ Dialog state management (open/close)
- ✅ State cleanup on close
- ✅ Keyboard interactions (Escape, Enter)
- ✅ Image fallback rendering
- ✅ Dynamic result rendering
- ✅ Error handling (API errors, network timeouts)
- ✅ Empty results handling
- ✅ API request format validation
- ✅ Loading state display

### Running Tests

```bash
npm test -- SearchDialogBox.test.ts
```

## Configuration

### Environment Variables

None required. Uses OpenSearch index name from props.

### Constants

Update in `SearchDialogBox.tsx`:

```typescript
const DEBOUNCE_DELAY = 300; // milliseconds
const FALLBACK_IMAGE_URL = "/asset/fallback-image.png";
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE 11: ⚠️ AbortController polyfill required

## Accessibility

- ARIA labels on buttons
- Keyboard navigation support
- Focus management in dialog
- Semantic HTML structure

## Related Components

- `ImageWithFallback`: Custom image component with fallback
- `Command` (cmdk): Command palette UI
- `Dialog`: Modal wrapper (shadcn/ui)
- `Input`: Search input field (shadcn/ui)

## Known Limitations

1. **Image Optimization**: Uses `unoptimized` flag for thumbnails (disables Next.js image optimization)
   - Reason: External image hosts may not be reachable
   - Alternative: Configure whitelist in `next.config.mjs` if using Vercel Image Optimization

2. **Client-Side Rendering Only**: Component requires client-side hydration
   - Cannot be server-side rendered (uses `useState`, `useEffect`)
   - Must wrap with `ClientOnly` or `NoSSR` in server components

3. **Debounce Not Configurable**: 300ms debounce is hardcoded
   - Could be parameterized for different search contexts

## Future Improvements

- [ ] Configurable debounce delay
- [ ] Search history persistence (localStorage)
- [ ] Advanced filters (price, category, brand)
- [ ] Voice search support
- [ ] Analytics tracking for search queries
- [ ] Autocomplete suggestions from ElasticSearch

## Troubleshooting

### No Results Appearing

1. Check OpenSearch service is running
2. Verify `elasticIndex` prop matches actual index name
3. Confirm network request in browser DevTools
4. Check API response format matches expected schema

### Images Not Loading

1. Verify `thumbnailUrl` is valid and accessible
2. Check fallback image path: `/asset/fallback-image.png`
3. Review middleware asset rewriting logic in `src/middleware.ts`

### Dialog Not Closing

1. Verify `setOpen` callback is properly connected
2. Check for JavaScript errors in console
3. Ensure parent component state is synced

### Slow Search Response

1. Check OpenSearch performance
2. Verify network latency
3. Consider increasing `DEBOUNCE_DELAY` to reduce API calls

## Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint compliant
- ✅ Fully typed component props and state
- ✅ Comprehensive test coverage
- ✅ No console errors or warnings

## Author Notes

This component was built to replace inline search implementations across the application and provide a consistent, performant search experience. The debounce + AbortController pattern is critical for handling rapid user input without overwhelming the backend.

Key implementation details:

- Debounce implemented with `useRef` timeout tracking (not external library)
- AbortController per request for automatic cancellation
- ImageWithFallback ensures UI never shows broken images
- Middleware rewrites locale-prefixed asset requests for proper static serving
- Command component has `shouldFilter={false}` to allow server-side results
