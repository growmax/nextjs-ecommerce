# Bundle Optimization Quick Reference

## Critical Issues Found

### 1. Build Blocking Errors (Fix First!)

**Duplicate Link Imports in 5 Files:**

```tsx
// ❌ WRONG - Causes build errors
import { Link } from "@/i18n/navigation";
import Link from "next/link"; // Duplicate!

// ✅ CORRECT - Use only i18n Link
import { Link } from "@/i18n/navigation";
```

**Affected Files:**

- `src/components/ProductGrid/ProductGridServer.tsx` (line 7)
- `src/app/[locale]/(app)/search/page.tsx` (line 6)
- `src/components/AppHeader/app-header.tsx` (line 27)
- `src/app/[locale]/(app)/details/orderDetails/[orderId]/components/OrderDetailsClient.tsx`
- `src/app/[locale]/(app)/details/quoteDetails/[quoteId]/components/QuoteDetailsClient.tsx`

---

### 2. Large Static Data (31KB Impact)

**File:** `src/components/custom/countrycode.tsx` (1620 lines)

**Issue:** Entire 241-country database hardcoded in client component

**Solution:**

```tsx
// Before: 31KB hardcoded array
const countries: Country[] = [
  /* 241 countries */
];

// After: Dynamic loading
const [countries, setCountries] = useState<Country[]>([]);

useEffect(() => {
  // Check cache first
  const cached = localStorage.getItem("countries");
  if (cached) {
    setCountries(JSON.parse(cached));
    return;
  }

  // Fetch on demand
  fetch("/data/countries.json")
    .then(res => res.json())
    .then(data => {
      setCountries(data);
      localStorage.setItem("countries", JSON.stringify(data));
    });
}, []);
```

---

### 3. Lodash Usage (48 Files, ~3MB Impact)

**Current Pattern:**

```ts
// ❌ Imports entire library (70KB per file)
import _ from "lodash";
import lodash from "lodash";
```

**Recommended Replacements:**

#### Option A: Native JavaScript (Best)

```ts
// Instead of _.isEmpty
Object.keys(obj).length === 0

// Instead of _.map
array.map(fn)

// Instead of _.filter
array.filter(fn)

// Instead of _.includes
array.includes(item)

// Instead of _.find
array.find(fn)

// Instead of _.forEach
array.forEach(fn)

// Instead of _.reduce
array.reduce(fn, initial)

// Instead of _.keys
Object.keys(obj)

// Instead of _.values
Object.values(obj)

// Instead of _.assign
Object.assign({}, obj1, obj2)
// or
{ ...obj1, ...obj2 }

// Instead of _.clone (shallow)
{ ...obj }
[...array]

// Instead of _.omit
const { keyToRemove, ...rest } = obj;
```

#### Option B: Specific Imports (When needed)

```ts
// ✅ Import only what you need (2-5KB each)
import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";
import debounce from "lodash-es/debounce";
import throttle from "lodash-es/throttle";
```

---

### 4. Icon Libraries (20KB Impact)

**Issue:** Using both lucide-react AND @tabler/icons-react

**Files Using @tabler (4 files):**

- `src/components/custom/CartPriceDetails.tsx`
- `src/components/sample/Button.tsx`
- `src/components/sales/CartPriceDetails.tsx`

**Solution:** Replace all @tabler with lucide-react

```tsx
// ❌ Before
import { IconShoppingCart } from "@tabler/icons-react";

// ✅ After - Find lucide equivalent
import { ShoppingCart } from "lucide-react";
```

---

### 5. Date-fns Imports (10KB Impact)

**Current:**

```ts
// ⚠️ Mixed import styles
import { addDays } from "date-fns";
import { format } from "date-fns/format";
```

**Optimized:**

```ts
// ✅ Consistent sub-path imports for best tree-shaking
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import differenceInDays from "date-fns/differenceInDays";
```

---

### 6. Missing Dynamic Imports

**Heavy Components to Lazy Load:**

```tsx
// ❌ Loaded immediately in bundle
import AddAddressDialog from "@/components/dialogs/company/AddAddressDialog"; // 1429 lines

// ✅ Lazy loaded on interaction
const AddAddressDialog = dynamic(
  () => import("@/components/dialogs/company/AddAddressDialog"),
  {
    loading: () => <DialogSkeleton />,
    ssr: false, // Dialog doesn't need SSR
  }
);
```

**Candidates:**

- `AddAddressDialog` (1429 lines)
- `QuoteFilterForm` (665 lines)
- Large form components
- Heavy tables (already done for some)

---

## Quick Commands

### Build and Analyze

```bash
# Regular build
yarn build

# Build with bundle analyzer
ANALYZE=true yarn build

# Type checking
yarn type-check

# Linting
yarn lint

# Fix lint issues
yarn lint:fix
```

### Find Lodash Usage

```bash
# Find all lodash imports
grep -r "import.*lodash" src/ --include="*.ts" --include="*.tsx"

# Count files using lodash
grep -r "import.*lodash" src/ --include="*.ts" --include="*.tsx" | wc -l
```

### Find Duplicate Imports

```bash
# Find files with multiple Link imports
grep -r "import.*Link" src/ --include="*.tsx" | grep -E "from.*link|from.*navigation"
```

### Find Client Components

```bash
# Count client components
grep -r '"use client"' src/ --include="*.tsx" --include="*.ts" | wc -l

# Find large client components
find src/components -name "*.tsx" -exec wc -l {} + | sort -rn | head -20
```

---

## Expected Bundle Size Reduction

| Optimization          | Savings     |
| --------------------- | ----------- |
| Country Code Data     | 31 KB       |
| Lodash Replacement    | ~3 MB       |
| Icon Library          | 20 KB       |
| Dynamic Imports       | 150 KB      |
| Date-fns Optimization | 10 KB       |
| **Total**             | **~3.2 MB** |

---

## Common Lodash to Native Conversions

```ts
// isEmpty
_.isEmpty(obj) → Object.keys(obj).length === 0
_.isEmpty(arr) → arr.length === 0
_.isEmpty(str) → str.length === 0

// isEqual (deep equality - may need import)
_.isEqual(a, b) → import isEqual from 'lodash-es/isEqual'

// cloneDeep (deep clone - may need import)
_.cloneDeep(obj) → import cloneDeep from 'lodash-es/cloneDeep'

// get (safe property access)
_.get(obj, 'a.b.c', default) → obj?.a?.b?.c ?? default

// merge
_.merge(obj1, obj2) → { ...obj1, ...obj2 } // shallow
// For deep merge, use import merge from 'lodash-es/merge'

// groupBy
_.groupBy(arr, 'key') → arr.reduce((acc, item) => {
  const key = item.key;
  (acc[key] = acc[key] || []).push(item);
  return acc;
}, {})

// uniq
_.uniq(arr) → [...new Set(arr)]

// flatten
_.flatten(arr) → arr.flat()

// flattenDeep
_.flattenDeep(arr) → arr.flat(Infinity)

// compact (remove falsy)
_.compact(arr) → arr.filter(Boolean)

// pick
_.pick(obj, ['a', 'b']) → { a: obj.a, b: obj.b }

// omit
_.omit(obj, ['a']) → const { a, ...rest } = obj; return rest;

// debounce (needs import)
_.debounce(fn, wait) → import debounce from 'lodash-es/debounce'

// throttle (needs import)
_.throttle(fn, wait) → import throttle from 'lodash-es/throttle'

// sortBy
_.sortBy(arr, 'key') → [...arr].sort((a, b) => a.key - b.key)

// sum
_.sum(arr) → arr.reduce((a, b) => a + b, 0)

// min
_.min(arr) → Math.min(...arr)

// max
_.max(arr) → Math.max(...arr)

// range
_.range(5) → Array.from({ length: 5 }, (_, i) => i)
_.range(1, 6) → Array.from({ length: 5 }, (_, i) => i + 1)

// chunk
_.chunk(arr, 2) → arr.reduce((acc, item, i) => {
  const idx = Math.floor(i / 2);
  (acc[idx] = acc[idx] || []).push(item);
  return acc;
}, [])
```

---

## Testing Checklist After Each Fix

- [ ] `yarn build` succeeds
- [ ] `yarn type-check` passes
- [ ] Functionality still works
- [ ] No console errors
- [ ] Performance maintained or improved

---

## Priority Order

1. **Fix build errors** (duplicate Link imports) - CRITICAL
2. **Extract country data** - High impact (31KB)
3. **Replace lodash** - Highest impact (~3MB)
4. **Consolidate icons** - Medium impact (20KB)
5. **Add dynamic imports** - Medium impact (150KB)
6. **Optimize date-fns** - Low impact (10KB)
7. **Server component audit** - Variable impact

---

## Files Requiring Most Attention

### Top 10 Largest Client Components:

1. `/src/components/custom/countrycode.tsx` - 1620 lines, 31KB
2. `/src/components/dialogs/company/AddAddressDialog.tsx` - 1429 lines
3. `/src/components/sales/contactdetails.tsx` - 830 lines
4. `/src/components/ui/sidebar.tsx` - 800 lines
5. `/src/components/sales/QuoteFilterForm.tsx` - 665 lines
6. `/src/components/sales/order-price-details.tsx` - 633 lines
7. `/src/components/sales/CartPriceDetails.tsx` - 554 lines
8. `/src/components/Global/DataTable/DataTable.tsx` - 520 lines
9. `/src/components/sales/order-products-table.tsx` - 490 lines
10. `/src/components/homepage/CollectionSlider.tsx` - 477 lines
